import React from 'react';
import { Check, ShieldCheck, ExternalLink, Bell } from 'lucide-react';
import { CancellationStrategy, Subscription } from '../types';

interface CancellationStrategiesProps {
  subscription: Subscription;
  onStrategyChange: (strategy: CancellationStrategy) => void;
  onPauseMonthsChange: (months: number) => void;
  onToggleRestartPrevention: () => void;
}

export const CancellationStrategies: React.FC<CancellationStrategiesProps> = ({
  subscription,
  onStrategyChange,
  onPauseMonthsChange,
  onToggleRestartPrevention,
}) => {
  const selected = subscription.selectedStrategy;
  const pauseMonths = subscription.pauseMonths || 2;

  const getOptionIndexText = () => {
    switch (selected) {
      case 'concierge':
        return 'OPTION 1 OF 3';
      case 'pause':
        return 'OPTION 2 OF 3';
      case 'manual':
        return 'OPTION 3 OF 3';
      default:
        return 'OPTION 1 OF 3';
    }
  };

  return (
    <div className="flex flex-col gap-2.5 mb-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-jupiter text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
          Select Cancellation Strategy
        </h3>
        <span className="font-digital text-xs text-[#00daf3] tracking-wider">
          {getOptionIndexText()}
        </span>
      </div>

      {/* Option A (Recommended Concierge) */}
      <div
        id="option-concierge"
        onClick={() => onStrategyChange('concierge')}
        className={`relative cursor-pointer transition-all duration-200 rounded-2xl p-4 ${
          selected === 'concierge'
            ? 'hud-box'
            : 'bg-[#0d1322]/60 border border-[#1a253b] hover:border-[#22395d]'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              id="radio-concierge"
              className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-all ${
                selected === 'concierge'
                  ? 'border-[#00ff88] bg-[#00ff88] text-[#05070a] shadow-[0_0_10px_#00ff88]'
                  : 'border-[#22395d] bg-[#090d16] text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-jupiter text-xs sm:text-sm font-bold text-white tracking-wide">
                  SubPulse Concierge
                </h4>
                <span className="px-2 py-0.5 rounded border border-[#00ff88]/40 bg-[#00ff88]/20 text-[#00ff88] font-digital text-[10px] tracking-widest font-bold">
                  RECOMMENDED
                </span>
              </div>
              <p className="font-body text-xs text-[#8498b5] mt-1.5 leading-relaxed">
                ⚡ Instant, automated legal cancellation notice. No retention scripts, no survey loops, zero hassle.
              </p>
            </div>
          </div>
        </div>

        {/* Expanded details drawer */}
        {selected === 'concierge' && (
          <div id="details-concierge" className="mt-3 pt-3 border-t border-[#1a253b]/80 flex flex-col gap-2">
            <div className="bg-[#080c14] border border-[#00ff88]/20 rounded-xl p-2.5 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#00ff88] shrink-0" />
              <p className="font-body text-xs text-[#8498b5]">
                Backed by FTC Negative Option rule. Proof of confirmation delivered within{' '}
                <span className="font-digital text-white font-semibold">24 minutes</span>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Option B: Pause Subscription */}
      <div
        id="option-pause"
        onClick={() => onStrategyChange('pause')}
        className={`relative cursor-pointer transition-all duration-200 rounded-2xl p-4 ${
          selected === 'pause'
            ? 'hud-box'
            : 'bg-[#0d1322]/60 border border-[#1a253b] hover:border-[#22395d]'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            id="radio-pause"
            className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-all ${
              selected === 'pause'
                ? 'border-[#00ff88] bg-[#00ff88] text-[#05070a] shadow-[0_0_10px_#00ff88]'
                : 'border-[#22395d] bg-[#090d16] text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div className="flex-1">
            <h4 className="font-jupiter text-xs sm:text-sm font-bold text-white tracking-wide">
              Snooze / Pause Membership
            </h4>
            <p className="font-body text-xs text-[#8498b5] mt-1 leading-relaxed">
              Freeze billing for 1 to 3 months without forfeiting your saved bookmarks or notes.
            </p>

            {selected === 'pause' && (
              <div id="details-pause" className="mt-3 pt-3 border-t border-[#1a253b] flex flex-col gap-2">
                <span className="font-digital text-xs text-[#8498b5] uppercase tracking-wider">
                  Select pause period:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPauseMonthsChange(months);
                      }}
                      className={`py-1.5 rounded font-digital text-xs transition-all active:scale-95 ${
                        pauseMonths === months
                          ? 'border border-[#00ff88] bg-[#00ff88] text-[#05070a] font-bold shadow-[0_0_8px_#00ff88]'
                          : 'border border-[#1a253b] bg-[#090d16] text-[#dee2f0] hover:border-[#00daf3]'
                      }`}
                    >
                      {months} Month{months > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Option C: Self-Service Trap Bypass */}
      <div
        id="option-manual"
        onClick={() => onStrategyChange('manual')}
        className={`relative cursor-pointer transition-all duration-200 rounded-2xl p-4 ${
          selected === 'manual'
            ? 'hud-box'
            : 'bg-[#0d1322]/60 border border-[#1a253b] hover:border-[#22395d]'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            id="radio-manual"
            className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-all ${
              selected === 'manual'
                ? 'border-[#00ff88] bg-[#00ff88] text-[#05070a] shadow-[0_0_10px_#00ff88]'
                : 'border-[#22395d] bg-[#090d16] text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-jupiter text-xs sm:text-sm font-bold text-white tracking-wide">
                Direct Portal Link &amp; Bypass Guide
              </h4>
              <ExternalLink className="w-4 h-4 text-[#00daf3]" />
            </div>
            <p className="font-body text-xs text-[#8498b5] mt-1 leading-relaxed">
              We open their actual cancellation page directly and guide you around sneaky retention traps.
            </p>

            {selected === 'manual' && (
              <div id="details-manual" className="mt-3 pt-3 border-t border-[#1a253b] flex flex-col gap-2 font-body text-xs text-[#8498b5]">
                <div className="flex items-start gap-2">
                  <span className="font-digital text-[10px] px-1.5 py-0.5 rounded bg-[#090d16] border border-[#1a253b] text-[#00daf3]">
                    01
                  </span>
                  <span>Skip page 2 offer of &quot;30% off next month&quot;</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-digital text-[10px] px-1.5 py-0.5 rounded bg-[#090d16] border border-[#1a253b] text-[#00daf3]">
                    02
                  </span>
                  <span>Select &quot;Too expensive&quot; on step 3 exit survey</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-digital text-[10px] px-1.5 py-0.5 rounded bg-[#090d16] border border-[#1a253b] text-[#00daf3]">
                    03
                  </span>
                  <span>Click faint grey &quot;Finish Cancellation&quot; at very bottom</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Reminder Toggle Card */}
      <div className="w-full bg-[#0d1322]/80 border border-[#1a253b] rounded-2xl p-4 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3 pr-2">
          <div className="w-9 h-9 rounded-lg bg-[#00daf3]/10 border border-[#00daf3]/30 flex items-center justify-center text-[#00daf3] shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-jupiter text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
              Restart Prevention Alert
            </h4>
            <p className="font-body text-xs text-[#8498b5]">
              Notify me 3 days before any restart or sneak renewal
            </p>
          </div>
        </div>

        {/* Cyber Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            id="reminder-toggle"
            type="checkbox"
            checked={subscription.restartPreventionAlert}
            onChange={onToggleRestartPrevention}
            className="sr-only peer"
          />
          <div className="w-12 h-6 bg-[#090d16] border border-[#1a253b] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-[#05070a] peer-checked:after:bg-[#05070a] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-[#8498b5] after:border-[#1a253b] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00ff88] peer-checked:border-[#00ff88] peer-checked:shadow-[0_0_12px_rgba(0,255,136,0.5)]" />
        </label>
      </div>
    </div>
  );
};
