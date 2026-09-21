import React from 'react';
import {
  Activity,
  Terminal,
  PlusCircle,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { StatusFilterOption, SubscriptionsSummary } from '../types';

interface HeaderProps {
  currentCode: string;
  statusFilter: StatusFilterOption;
  onFilterChange: (filter: StatusFilterOption) => void;
  summary: SubscriptionsSummary | null;
  onOpenCreateModal: () => void;
  onOpenTelemetryDrawer: () => void;
  onResetData: () => void;
  onToggleSelector: () => void;
  isSelectorOpen: boolean;
  totalAvailable: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentCode,
  statusFilter,
  onFilterChange,
  summary,
  onOpenCreateModal,
  onOpenTelemetryDrawer,
  onResetData,
  onToggleSelector,
  isSelectorOpen,
  totalAvailable,
}) => {
  const filterTabs: { id: StatusFilterOption; label: string; count?: number; alert?: boolean }[] = [
    { id: 'all', label: 'ALL', count: summary?.totalCount },
    {
      id: 'flagged_inactive',
      label: 'FLAGGED INACTIVE',
      count: summary?.flaggedCount,
      alert: true,
    },
    { id: 'active', label: 'ACTIVE', count: summary?.activeCount },
    { id: 'paused', label: 'PAUSED', count: summary?.pausedCount },
    { id: 'cancelled', label: 'CANCELLED', count: summary?.cancelledCount },
  ];

  return (
    <header className="sticky top-0 inset-x-0 z-40 bg-[#05070a]/90 backdrop-blur-xl border-b border-[#1a253b]">
      {/* Top Telemetry Strip */}
      <div className="h-16 px-4 max-w-5xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            id="sub-selector-btn"
            onClick={onToggleSelector}
            aria-label="Switch Subscription"
            className="h-10 px-3 flex items-center gap-2 rounded-lg border border-[#1a253b] bg-[#090d16]/80 text-[#8498b5] hover:text-white hover:border-[#00daf3] transition-all active:scale-95 group"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#00daf3] group-hover:rotate-45 transition-transform" />
            <span className="font-digital text-xs hidden sm:inline text-white">RECORDS ({totalAvailable})</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#8498b5] transition-transform ${isSelectorOpen ? 'rotate-180 text-[#00daf3]' : ''}`}
            />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#ff2e55] animate-ping rounded-full opacity-75 shrink-0" />
            <h1 className="font-jupiter text-xs sm:text-sm tracking-[0.14em] uppercase text-white font-bold flex items-center gap-1.5 truncate">
              SUBSCRIPTION TERMINATION //{' '}
              <span className="text-[#ff2e55] text-[11px] font-digital tracking-normal">
                {currentCode || 'MSC-990-DEL'}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div className="hidden xs:flex px-2 py-0.5 rounded border border-[#00daf3]/40 bg-[#00daf3]/10 text-[#00daf3] font-digital text-[10px] tracking-widest uppercase items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3] animate-pulse" />
            SYS.ONLINE
          </div>

          {/* Telemetry Log Trigger */}
          <button
            id="open-http-telemetry-btn"
            onClick={onOpenTelemetryDrawer}
            title="Inspect HTTP request flow & JSON payloads"
            className="h-9 px-2.5 rounded-lg border border-[#22395d] bg-[#0d1322] text-[#00daf3] hover:border-[#00daf3] hover:bg-[#00daf3]/10 text-xs font-digital flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Terminal className="w-4 h-4 text-[#00daf3]" />
            <span className="hidden sm:inline">HTTP LOGS</span>
          </button>

          {/* New Record POST Button */}
          <button
            id="create-subscription-btn"
            onClick={onOpenCreateModal}
            title="Add New Subscription Record (POST /api/subscriptions)"
            className="h-9 px-2.5 rounded-lg border border-[#00ff88]/40 bg-[#00ff88]/15 text-[#00ff88] hover:bg-[#00ff88] hover:text-[#05070a] text-xs font-digital flex items-center gap-1.5 transition-all font-bold active:scale-95 shadow-[0_0_10px_rgba(0,255,136,0.2)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">NEW TARGET</span>
          </button>

          {/* Reset Seeds Button */}
          <button
            id="reset-db-btn"
            onClick={onResetData}
            title="Reset to default seed data"
            className="w-9 h-9 rounded-lg border border-[#1a253b] bg-[#090d16] text-[#8498b5] hover:text-white hover:border-[#22395d] flex items-center justify-center transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cyber Status Filter Tabs Bar (Directly wired to GET /api/subscriptions?status=...) */}
      <div className="bg-[#090d16]/90 border-t border-[#1a253b]/80 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            <span className="font-digital text-[10px] text-[#8498b5] tracking-widest uppercase mr-1 hidden sm:inline">
              FILTER STATUS //
            </span>
            {filterTabs.map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`filter-tab-${tab.id}`}
                  onClick={() => onFilterChange(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-digital tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                    isActive
                      ? tab.alert
                        ? 'bg-[#ff2e55]/20 border border-[#ff2e55] text-white shadow-[0_0_12px_rgba(255,46,85,0.35)]'
                        : 'bg-[#00daf3]/15 border border-[#00daf3] text-[#00daf3] shadow-[0_0_10px_rgba(0,218,243,0.3)]'
                      : 'border border-transparent text-[#8498b5] hover:text-white hover:border-[#22395d] bg-[#0d1322]/50'
                  }`}
                >
                  {tab.alert && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#ff2e55] animate-ping' : 'bg-[#ff2e55]/70'}`}
                    />
                  )}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1 rounded ${
                        isActive
                          ? 'bg-black/40 text-white font-bold'
                          : 'bg-[#1a253b] text-[#8498b5]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Metrics Badge */}
          {summary && summary.totalMonthlyWaste > 0 && (
            <div className="hidden md:flex items-center gap-2 bg-[#ff2e55]/10 border border-[#ff2e55]/30 px-2.5 py-1 rounded text-[11px] font-digital shrink-0">
              <span className="text-[#8498b5] uppercase">Flagged Drain:</span>
              <span className="text-[#ff2e55] font-bold">${summary.totalMonthlyWaste.toFixed(2)}/mo</span>
              <span className="text-white/40">|</span>
              <span className="text-[#00ff88] font-bold">+${summary.totalAnnualSavings.toFixed(2)}/yr</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
