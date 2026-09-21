import React from 'react';
import { CheckCircle2, TrendingDown, Code, X } from 'lucide-react';
import { Subscription } from '../types';

interface SuccessTerminalModalProps {
  isOpen: boolean;
  subscription: Subscription;
  receiptData?: {
    noticeRef: string;
    strategy: string;
    timestamp: string;
    annualizedSavings: number;
    status: string;
  } | null;
  onClose: () => void;
}

export const SuccessTerminalModal: React.FC<SuccessTerminalModalProps> = ({
  isOpen,
  subscription,
  receiptData,
  onClose,
}) => {
  if (!isOpen) return null;

  const isPause = subscription.status === 'paused';
  const noticeRef = receiptData?.noticeRef || subscription.legalNoticeRef || '#SP-99214';

  return (
    <div
      id="success-sheet"
      className="fixed inset-0 z-50 bg-[#05070a]/90 backdrop-blur-md flex items-end justify-center px-4 pb-safe animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-[#090d16] border-t-2 border-x-2 border-[#00ff88] rounded-t-3xl p-6 flex flex-col items-center text-center relative shadow-[0_0_50px_rgba(0,255,136,0.2)]">
        {/* Close icon button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-[#1a253b] bg-[#0d1322] text-[#8498b5] hover:text-white flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Decorative HUD Bar */}
        <div className="w-12 h-1 bg-[#1a253b] rounded-full mb-4" />

        <div className="w-14 h-14 rounded-xl bg-[#00ff88]/10 border border-[#00ff88] flex items-center justify-center text-[#00ff88] mb-3 shadow-[0_0_20px_rgba(0,255,136,0.4)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="font-jupiter text-base sm:text-lg font-bold uppercase tracking-wider text-white">
          {isPause ? 'Membership Freeze Dispatched!' : 'Cancellation Notice Dispatched!'}
        </h3>

        <p className="font-body text-xs sm:text-sm text-[#8498b5] mt-2 leading-relaxed">
          {isPause ? (
            <>
              {subscription.name} has been paused for{' '}
              <span className="font-digital text-[#00ff88] font-bold">
                {subscription.pauseMonths} months
              </span>
              . Ref <span className="font-digital text-[#00daf3]">{noticeRef}</span>.
            </>
          ) : (
            <>
              SubPulse Concierge generated legal notice ref{' '}
              <span className="font-digital text-[#00ff88] font-semibold">{noticeRef}</span>. Target
              account <span className="text-white font-bold">{subscription.name}</span> will not be billed.
            </>
          )}
        </p>

        {/* Savings Metric Card */}
        <div className="w-full bg-[#0d1322] border border-[#1a253b] rounded-xl p-3.5 mt-4 text-left flex justify-between items-center">
          <div>
            <span className="font-digital text-[10px] text-[#8498b5] uppercase tracking-widest">
              Saved Annually
            </span>
            <p className="font-digital text-2xl font-bold text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]">
              ${subscription.annualizedSavings.toFixed(2)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88]">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* API Response Telemetry Micro Badge */}
        <div className="w-full mt-3 p-2.5 rounded-lg bg-[#05070a] border border-[#1a253b] text-left">
          <div className="flex items-center justify-between font-digital text-[10px] text-[#8498b5] mb-1">
            <span className="flex items-center gap-1 text-[#00daf3]">
              <Code className="w-3 h-3" />
              PUT /api/subscriptions/{subscription.id}/terminate
            </span>
            <span className="text-[#00ff88]">200 OK</span>
          </div>
          <div className="font-digital text-[10px] text-[#8498b5] truncate">
            status: &quot;{subscription.status}&quot; • notice: &quot;{noticeRef}&quot; • timestamp:{' '}
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 mt-4 rounded-xl bg-[#00ff88] text-[#05070a] font-jupiter text-xs tracking-wider uppercase font-bold hover:bg-[#00e479] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,255,136,0.4)]"
        >
          Done &amp; Return to Dashboard
        </button>
      </div>
    </div>
  );
};
