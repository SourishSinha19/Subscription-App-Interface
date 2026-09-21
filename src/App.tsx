import React, { useState, useEffect, useCallback } from 'react';
import { api, subscribeToHttpTelemetry } from './services/api';
import {
  Subscription,
  StatusFilterOption,
  SubscriptionsSummary,
  CancellationStrategy,
  CreateSubscriptionPayload,
  HttpTelemetryEntry,
} from './types';
import { Header } from './components/Header';
import { TargetSubscriptionCard } from './components/TargetSubscriptionCard';
import { ValueAssessmentCard } from './components/ValueAssessmentCard';
import { CancellationStrategies } from './components/CancellationStrategies';
import { ActionDock } from './components/ActionDock';
import { SuccessTerminalModal } from './components/SuccessTerminalModal';
import { SubscriptionSelectorDrawer } from './components/SubscriptionSelectorDrawer';
import { CreateSubscriptionModal } from './components/CreateSubscriptionModal';
import { HttpTelemetryDrawer } from './components/HttpTelemetryDrawer';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('all');
  const [summary, setSummary] = useState<SubscriptionsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive UI states
  const [isLaserActive, setIsLaserActive] = useState<boolean>(false);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  // Drawers & Modals
  const [selectorDrawerOpen, setSelectorDrawerOpen] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [telemetryDrawerOpen, setTelemetryDrawerOpen] = useState<boolean>(false);
  const [telemetryLogs, setTelemetryLogs] = useState<HttpTelemetryEntry[]>([]);

  // Telemetry listener registration
  useEffect(() => {
    const unsubscribe = subscribeToHttpTelemetry((entry) => {
      setTelemetryLogs((prev) => [entry, ...prev.slice(0, 49)]);
    });
    return () => unsubscribe();
  }, []);

  // Fetch subscriptions from backend with status filter
  const fetchSubscriptions = useCallback(
    async (filter: StatusFilterOption = statusFilter, preferredId?: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getSubscriptions(filter);
        setSubscriptions(response.subscriptions);
        setSummary(response.summary);

        // Select subscription: preferred or existing active or first available
        if (response.subscriptions.length > 0) {
          const target = preferredId
            ? response.subscriptions.find((s) => s.id === preferredId)
            : response.subscriptions.find((s) => s.id === (activeSubscription?.id || 'sub-884x')) ||
              response.subscriptions[0];
          setActiveSubscription(target || response.subscriptions[0]);
        } else {
          setActiveSubscription(null);
        }
      } catch (err: any) {
        console.error('Failed to load subscriptions:', err);
        setError(err.message || 'Failed to fetch application records from API');
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter, activeSubscription?.id]
  );

  // Initial load
  useEffect(() => {
    fetchSubscriptions('all', 'sub-884x');
  }, []);

  // Handler: Status Filter Change
  const handleFilterChange = async (newFilter: StatusFilterOption) => {
    setStatusFilter(newFilter);
    await fetchSubscriptions(newFilter);
  };

  // Handler: Laser Beam Preview Toggle
  const handleToggleLaserBeam = () => {
    setIsLaserActive((prev) => !prev);
  };

  // Handler: Cancellation Strategy Change (Dispatches PUT /api/subscriptions/:id)
  const handleStrategyChange = async (strategy: CancellationStrategy) => {
    if (!activeSubscription) return;
    try {
      // Optimistic local update
      setActiveSubscription({ ...activeSubscription, selectedStrategy: strategy });
      const res = await api.updateSubscription(activeSubscription.id, {
        selectedStrategy: strategy,
      });
      setActiveSubscription(res.subscription);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === res.subscription.id ? res.subscription : s))
      );
    } catch (err: any) {
      console.error('Failed to update strategy:', err);
    }
  };

  // Handler: Pause Months Change (Dispatches PUT /api/subscriptions/:id)
  const handlePauseMonthsChange = async (months: number) => {
    if (!activeSubscription) return;
    try {
      setActiveSubscription({ ...activeSubscription, pauseMonths: months });
      const res = await api.updateSubscription(activeSubscription.id, {
        pauseMonths: months,
      });
      setActiveSubscription(res.subscription);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === res.subscription.id ? res.subscription : s))
      );
    } catch (err: any) {
      console.error('Failed to update pause months:', err);
    }
  };

  // Handler: Restart Prevention Toggle (Dispatches PUT /api/subscriptions/:id)
  const handleToggleRestartPrevention = async () => {
    if (!activeSubscription) return;
    const nextVal = !activeSubscription.restartPreventionAlert;
    try {
      setActiveSubscription({ ...activeSubscription, restartPreventionAlert: nextVal });
      const res = await api.updateSubscription(activeSubscription.id, {
        restartPreventionAlert: nextVal,
      });
      setActiveSubscription(res.subscription);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === res.subscription.id ? res.subscription : s))
      );
    } catch (err: any) {
      console.error('Failed to toggle restart prevention alert:', err);
    }
  };

  // Handler: Confirm & Cancel Execution
  const handleExecuteAction = async () => {
    if (!activeSubscription) return;

    // If already cancelled, allow reactivating via PUT
    if (activeSubscription.status === 'cancelled') {
      try {
        setIsProcessingAction(true);
        const res = await api.updateSubscription(activeSubscription.id, {
          status: 'active',
        });
        setActiveSubscription(res.subscription);
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === res.subscription.id ? res.subscription : s))
        );
        await fetchSubscriptions(statusFilter, activeSubscription.id);
      } catch (err: any) {
        console.error('Failed to reactivate:', err);
      } finally {
        setIsProcessingAction(false);
      }
      return;
    }

    try {
      setIsProcessingAction(true);
      // Fire visual laser destruction sequence
      setIsLaserActive(true);

      // Perform termination PUT request
      const res = await api.terminateSubscription(activeSubscription.id, {
        strategy: activeSubscription.selectedStrategy,
        pauseMonths: activeSubscription.pauseMonths,
      });

      // Allow 1.1s for laser sweep animation to complete
      setTimeout(async () => {
        setIsLaserActive(false);
        setIsProcessingAction(false);
        setActiveSubscription(res.subscription);
        setLastReceipt(res.receipt);
        setSuccessModalOpen(true);

        // Update list
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === res.subscription.id ? res.subscription : s))
        );
        // Refresh summary
        const fresh = await api.getSubscriptions(statusFilter);
        setSummary(fresh.summary);
      }, 1100);
    } catch (err: any) {
      setIsLaserActive(false);
      setIsProcessingAction(false);
      console.error('Termination execution error:', err);
      setError(err.message || 'Termination action failed on server');
    }
  };

  // Handler: Create Subscription (Dispatches POST /api/subscriptions)
  const handleCreateSubscription = async (payload: CreateSubscriptionPayload) => {
    const res = await api.createSubscription(payload);
    // Refresh list and select the newly created subscription
    await fetchSubscriptions(statusFilter, res.subscription.id);
  };

  // Handler: Reset Telemetry Seeds (Dispatches POST /api/subscriptions/reset)
  const handleResetData = async () => {
    try {
      setIsLoading(true);
      await api.resetDatabase();
      setStatusFilter('all');
      await fetchSubscriptions('all', 'sub-884x');
    } catch (err: any) {
      console.error('Failed to reset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#05070a] text-[#dee2f0] flex flex-col min-h-screen selection:bg-[#ff2e55] selection:text-white relative font-body">
      {/* Cyberpunk Background Matrix Canvas */}
      <div className="fixed inset-0 hud-grid-overlay pointer-events-none z-0" />
      <div className="fixed inset-0 scanline pointer-events-none z-0" />

      {/* Ambient Holographic Plasma Glows */}
      <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-96 h-80 bg-[#ff2e55]/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-24 w-72 h-72 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Top Header Nav & Status Filter Tabs */}
      <Header
        currentCode={activeSubscription?.code || 'MSC-990-DEL'}
        statusFilter={statusFilter}
        onFilterChange={handleFilterChange}
        summary={summary}
        onOpenCreateModal={() => setCreateModalOpen(true)}
        onOpenTelemetryDrawer={() => setTelemetryDrawerOpen(true)}
        onResetData={handleResetData}
        onToggleSelector={() => setSelectorDrawerOpen((prev) => !prev)}
        isSelectorOpen={selectorDrawerOpen}
        totalAvailable={subscriptions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full pt-4 pb-28 px-4 z-10">
        <div className="flex flex-col w-full max-w-lg mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#ff2e55]/15 border border-[#ff2e55]/40 text-[#ff2e55] text-xs font-digital flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => fetchSubscriptions()}
                className="underline hover:text-white uppercase font-bold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && !activeSubscription && (
            <div className="flex flex-col items-center justify-center py-24 text-[#00daf3] gap-3 font-digital">
              <RefreshCw className="w-8 h-8 animate-spin text-[#00daf3]" />
              <span className="text-xs tracking-widest uppercase">CONNECTING TO HUD REST API...</span>
            </div>
          )}

          {/* Empty State when filtered */}
          {!isLoading && !activeSubscription && (
            <div className="text-center py-16 px-4 hud-box rounded-2xl my-6">
              <p className="font-jupiter text-sm text-white uppercase mb-2">
                No Subscriptions in &quot;{statusFilter.replace('_', ' ')}&quot; Filter
              </p>
              <p className="font-body text-xs text-[#8498b5] mb-4">
                Switch filters or register a new target record via POST.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => handleFilterChange('all')}
                  className="px-3 py-1.5 rounded-lg border border-[#00daf3] text-[#00daf3] text-xs font-digital hover:bg-[#00daf3]/10"
                >
                  VIEW ALL RECORDS
                </button>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#00ff88] text-[#05070a] text-xs font-digital font-bold hover:bg-[#00e479]"
                >
                  CREATE NEW TARGET
                </button>
              </div>
            </div>
          )}

          {/* Active Target Module & Controls */}
          {activeSubscription && (
            <>
              {/* Target Subscription Card */}
              <TargetSubscriptionCard
                subscription={activeSubscription}
                isLaserActive={isLaserActive}
                onToggleLaserBeam={handleToggleLaserBeam}
              />

              {/* Value Assessment Card */}
              <ValueAssessmentCard subscription={activeSubscription} />

              {/* Cancellation Strategies Accordion & Toggle */}
              <CancellationStrategies
                subscription={activeSubscription}
                onStrategyChange={handleStrategyChange}
                onPauseMonthsChange={handlePauseMonthsChange}
                onToggleRestartPrevention={handleToggleRestartPrevention}
              />
            </>
          )}
        </div>
      </main>

      {/* Bottom Action Dock */}
      {activeSubscription && (
        <ActionDock
          subscription={activeSubscription}
          isProcessing={isProcessingAction}
          onExecuteAction={handleExecuteAction}
          onKeepForNow={() => {
            // Dismiss or notification
            alert(`Target subscription "${activeSubscription.name}" retained in active tracking.`);
          }}
        />
      )}

      {/* Success Terminal Modal Sheet */}
      {activeSubscription && (
        <SuccessTerminalModal
          isOpen={successModalOpen}
          subscription={activeSubscription}
          receiptData={lastReceipt}
          onClose={() => setSuccessModalOpen(false)}
        />
      )}

      {/* Subscriptions Directory Drawer */}
      <SubscriptionSelectorDrawer
        isOpen={selectorDrawerOpen}
        onClose={() => setSelectorDrawerOpen(false)}
        subscriptions={subscriptions}
        currentId={activeSubscription?.id || ''}
        onSelectSubscription={(sub) => setActiveSubscription(sub)}
        onOpenCreateModal={() => setCreateModalOpen(true)}
      />

      {/* Create Subscription Modal (POST) */}
      <CreateSubscriptionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubscription}
      />

      {/* HTTP Telemetry & Payload Inspector Drawer */}
      <HttpTelemetryDrawer
        isOpen={telemetryDrawerOpen}
        onClose={() => setTelemetryDrawerOpen(false)}
        logs={telemetryLogs}
        onClearLogs={() => setTelemetryLogs([])}
      />
    </div>
  );
}
