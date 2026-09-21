import React from 'react';
import { Activity, PiggyBank } from 'lucide-react';
import { Subscription } from '../types';

interface ValueAssessmentCardProps {
  subscription: Subscription;
}

export const ValueAssessmentCard: React.FC<ValueAssessmentCardProps> = ({ subscription }) => {
  const isLowValue = subscription.usageScore < 40;
  const isHealthy = subscription.usageScore >= 70;

  return (
    <div className="w-full rounded-2xl hud-box p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1a253b]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00daf3]/10 border border-[#00daf3]/30 flex items-center justify-center text-[#00daf3]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-jupiter text-xs sm:text-sm font-bold tracking-wider uppercase text-white">
              Value Assessment
            </h3>
            <p className="font-body text-xs text-[#8498b5]">Based on synced device activity</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded border font-digital text-[11px] font-bold tracking-widest uppercase ${
            isLowValue
              ? 'border-[#ff2e55]/40 bg-[#ff2e55]/10 text-[#ff2e55]'
              : isHealthy
              ? 'border-[#00ff88]/40 bg-[#00ff88]/10 text-[#00ff88]'
              : 'border-[#00daf3]/40 bg-[#00daf3]/10 text-[#00daf3]'
          }`}
        >
          {isLowValue ? 'Low Value' : isHealthy ? 'Healthy Value' : 'Moderate Value'}
        </span>
      </div>

      {/* Metric Readout Strip */}
      <div className="bg-[#080c14]/90 border border-[#1a253b] rounded-xl p-3.5 mt-3 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="font-digital text-xs text-[#8498b5] tracking-wider uppercase">
            Usage Score
          </span>
          <span
            className={`font-digital text-sm font-bold ${
              isLowValue ? 'text-[#ff2e55]' : isHealthy ? 'text-[#00ff88]' : 'text-[#00daf3]'
            }`}
          >
            {subscription.usageScore} / 100{' '}
            <span className="text-xs text-[#8498b5] font-body">
              ({subscription.usageRating})
            </span>
          </span>
        </div>

        {/* Futuristic Segmented Progress Bar Track */}
        <div className="w-full h-2.5 rounded bg-[#05070a] border border-[#1a253b] p-0.5 flex">
          <div
            className={`h-full rounded transition-all duration-500 ${
              isLowValue
                ? 'bg-gradient-to-r from-[#ff2e55] via-[#ff2e55] to-orange-500 shadow-[0_0_10px_#ff2e55]'
                : isHealthy
                ? 'bg-gradient-to-r from-[#00daf3] to-[#00ff88] shadow-[0_0_10px_#00ff88]'
                : 'bg-gradient-to-r from-yellow-500 to-[#00daf3] shadow-[0_0_10px_#00daf3]'
            }`}
            style={{ width: `${Math.max(4, subscription.usageScore)}%` }}
          />
        </div>

        {/* Dual Metric Boxes */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-[#090d16] border border-[#1a253b] rounded-lg p-2.5 flex flex-col">
            <span className="font-digital text-[10px] uppercase text-[#8498b5] tracking-wider">
              Cost per session
            </span>
            <span className="font-digital text-xl font-bold text-white mt-1">
              ${subscription.costPerSession.toFixed(2)}
            </span>
            <span className="font-digital text-[10px] text-[#ff2e55] mt-0.5 tracking-wider">
              {subscription.sessionsTotal} session{subscription.sessionsTotal === 1 ? '' : 's'} total
            </span>
          </div>

          <div className="bg-[#090d16] border border-[#00ff88]/30 rounded-lg p-2.5 flex flex-col">
            <span className="font-digital text-[10px] uppercase text-[#8498b5] tracking-wider">
              Annualized waste
            </span>
            <span className="font-digital text-xl font-bold text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.4)] mt-1">
              +${subscription.annualizedSavings.toFixed(2)}/yr
            </span>
            <span className="font-digital text-[10px] text-[#00ff88] mt-0.5 tracking-wider">
              Direct pocket savings
            </span>
          </div>
        </div>
      </div>

      {/* Savings HUD Callout Box */}
      <div className="mt-3 flex items-start gap-2.5 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-xl p-3">
        <PiggyBank className="w-5 h-5 text-[#00ff88] shrink-0 mt-0.5" />
        <p className="font-body text-xs text-[#dee2f0] leading-relaxed">
          Average users who cancel at {subscription.inactivityDays || 45} days save{' '}
          <strong className="font-digital text-[#00ff88] font-bold text-sm tracking-wide">
            ${subscription.annualizedSavings.toFixed(2)} each year
          </strong>{' '}
          for high-priority personal goals.
        </p>
      </div>
    </div>
  );
};
