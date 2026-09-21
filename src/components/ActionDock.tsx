import React from 'react';
import { Trash2, PauseCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Subscription } from '../types';

interface ActionDockProps {
  subscription: Subscription;
  isProcessing: boolean;
  onExecuteAction: () => void;
  onKeepForNow: () => void;
}

export const ActionDock: React.FC<ActionDockProps> = ({
  subscription,
  isProcessing,
  onExecuteAction,
  onKeepForNow,
}) => {
  const { selectedStrategy, pauseMonths, status } = subscription;
  const isCancelled = status === 'cancelled';

  const getButtonContent = () => {
    if (isProcessing) {
      return (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>EXECUTING TELEMETRY SEQUENCE...</span>
        </>
      );
    }

    if (isCancelled) {
      return (
        <>
          <RefreshCw className="w-4 h-4" />
          <span>REACTIVATE SUBSCRIPTION RECORD</span>
        </>
      );
    }

    if (selectedStrategy === 'concierge') {
      return (
        <>
          <Trash2 className="w-4 h-4" />
          <span id="btn-text">Confirm &amp; Cancel via Concierge</span>
        </>
      );
    }

    if (selectedStrategy === 'pause') {
      return (
        <>
          <PauseCircle className="w-4 h-4" />
          <span id="btn-text">Apply {pauseMonths || 2}-Month Snooze</span>
        </>
      );
    }

    return (
      <>
        <ExternalLink className="w-4 h-4" />
        <span id="btn-text">Launch Cancellation Page</span>
      </>
    );
  };

  const getButtonClasses = () => {
    if (isCancelled) {
      return 'bg-[#00daf3]/20 border border-[#00daf3] text-[#00daf3] hover:bg-[#00daf3] hover:text-[#05070a] shadow-[0_0_15px_rgba(0,218,243,0.3)]';
    }

    if (selectedStrategy === 'concierge') {
      return 'bg-[#ff2e55] hover:bg-[#ff1744] text-white shadow-[0_0_20px_rgba(255,46,85,0.45)] border border-white/20';
    }

    if (selectedStrategy === 'pause') {
      return 'bg-[#00ff88] hover:bg-[#00e479] text-[#05070a] shadow-[0_0_20px_rgba(0,255,136,0.45)] border border-white/30';
    }

    return 'bg-[#0d1322] hover:bg-[#090d16] text-[#00daf3] border border-[#00daf3]/50 shadow-lg';
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-[#05070a]/90 backdrop-blur-xl border-t border-[#1a253b] px-4 pt-3 pb-4">
      <div className="max-w-lg mx-auto flex flex-col gap-2">
        {/* Primary Destructive Action with Laser Activation Effect */}
        <button
          id="main-action-btn"
          type="button"
          disabled={isProcessing}
          onClick={onExecuteAction}
          className={`relative overflow-hidden w-full h-12 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-jupiter text-xs tracking-[0.14em] uppercase font-bold group disabled:opacity-50 disabled:cursor-not-allowed ${getButtonClasses()}`}
        >
          {/* Button Laser Glow Shimmer */}
          <span className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000" />
          {getButtonContent()}
        </button>

        {/* Secondary Retain Button */}
        <button
          type="button"
          onClick={onKeepForNow}
          className="w-full h-10 rounded-xl bg-transparent hover:bg-[#0d1322] active:scale-[0.98] transition-all flex items-center justify-center text-[#8498b5] hover:text-white font-jupiter text-xs tracking-wider uppercase border border-transparent hover:border-[#1a253b]"
        >
          Keep For Now
        </button>
      </div>
    </div>
  );
};
