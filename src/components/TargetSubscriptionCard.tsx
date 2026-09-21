import React from 'react';
import { Calendar, AlertTriangle, Play, Square, Zap } from 'lucide-react';
import { Subscription } from '../types';

interface TargetSubscriptionCardProps {
  subscription: Subscription;
  isLaserActive: boolean;
  onToggleLaserBeam: () => void;
}

export const TargetSubscriptionCard: React.FC<TargetSubscriptionCardProps> = ({
  subscription,
  isLaserActive,
  onToggleLaserBeam,
}) => {
  const isCancelled = subscription.status === 'cancelled';
  const isPaused = subscription.status === 'paused';
  const isFlagged = subscription.status === 'flagged_inactive';

  return (
    <div className="relative w-full">
      {/* MASTERCLASS TARGET MODULE WITH LASER DESTRUCTION BEAM */}
      <div
        id="target-subscription-container"
        className={`relative w-full rounded-2xl hud-box ${
          isCancelled
            ? 'border-gray-600 bg-[#0d1322]/70 opacity-90'
            : isPaused
            ? 'hud-box-emerald'
            : 'hud-box-critical'
        } p-5 my-2 transition-all duration-300 ${
          isLaserActive ? 'laser-active target-card-glitch' : ''
        }`}
      >
        {/* Laser Sweep Beam Overlay Line (Destruction Graphic) */}
        <div
          className={`laser-beam ${
            isLaserActive ? 'block' : 'hidden'
          } absolute left-0 right-0 h-[3px] bg-white pointer-events-none z-30`}
          style={{
            boxShadow: '0 0 20px 4px #ff2e55, 0 0 45px 10px #ff2e55',
          }}
        >
          {/* Laser Spark Particle Embers */}
          <div className="absolute left-1/4 -top-2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]" />
          <div className="absolute left-2/4 -bottom-2 w-1.5 h-1.5 rounded-full bg-[#ff2e55] shadow-[0_0_12px_#ff2e55]" />
          <div className="absolute right-1/4 -top-1 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_15px_#ff2e55]" />
        </div>

        {/* Tech Header Ribbon */}
        <div className="flex items-center justify-between text-[10px] font-digital tracking-widest text-[#8498b5] border-b border-[#1a253b] pb-3 mb-4">
          <span className="flex items-center gap-1.5 text-[#ff2e55]">
            <span className="inline-block w-1.5 h-1.5 bg-[#ff2e55] rounded-full animate-ping" />
            TARGET: ACCT-REVOCATION
          </span>
          <span className="text-[#8498b5] uppercase">
            CODE: <span className="text-white font-bold">{subscription.code}</span>
          </span>
        </div>

        <div className="relative flex flex-col items-center text-center">
          {/* Service Brand Badge */}
          <div className="relative mb-3 group">
            <div className="w-20 h-20 rounded-xl bg-[#080c14] border-2 border-[#ff2e55]/50 flex items-center justify-center p-2.5 shadow-[0_0_25px_rgba(255,46,85,0.25)] relative overflow-hidden">
              {subscription.logoUrl ? (
                <img
                  className="w-full h-full object-contain rounded-lg contrast-110"
                  src={subscription.logoUrl}
                  alt={subscription.name}
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#ff2e55]/20 to-[#0d1322] flex items-center justify-center text-white font-jupiter font-extrabold text-xl">
                  {subscription.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              {/* Scan grid badge sweep */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#ff2e55]/10 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Inactive Warning Badge */}
            {isFlagged && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-md bg-[#05070a] border border-[#ff2e55] flex items-center justify-center shadow-md">
                <AlertTriangle className="w-3.5 h-3.5 text-[#ff2e55]" />
              </div>
            )}
          </div>

          {/* Status Indicator Chip */}
          {isCancelled ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-gray-600 bg-gray-900/60 text-gray-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
              <span className="font-digital text-xs font-semibold tracking-wider uppercase">
                Terminated / Account Revoked
              </span>
            </div>
          ) : isPaused ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#00ff88]/50 bg-[#00ff88]/10 text-[#00ff88] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="font-digital text-xs font-semibold tracking-wider uppercase">
                Membership Frozen ({subscription.pauseMonths} Months)
              </span>
            </div>
          ) : isFlagged ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#ff2e55]/50 bg-[#ff2e55]/10 text-[#ff2e55] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2e55] animate-ping" />
              <span className="font-digital text-xs font-semibold tracking-wider uppercase">
                Flagged as Inactive ({subscription.inactivityDays} days no use)
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#00daf3]/50 bg-[#00daf3]/10 text-[#00daf3] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3]" />
              <span className="font-digital text-xs font-semibold tracking-wider uppercase">
                Active Subscription
              </span>
            </div>
          )}

          {/* Main Title */}
          <h2 className="font-jupiter text-2xl sm:text-3xl font-extrabold tracking-[0.1em] text-white uppercase mt-0.5">
            {subscription.name}
          </h2>

          {/* Price readout */}
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="font-digital text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
              ${subscription.cost.toFixed(2)}
            </span>
            <span className="font-digital text-sm text-[#8498b5] uppercase tracking-widest">
              / {subscription.billingCycle}
            </span>
          </div>

          <p className="font-body text-xs text-[#8498b5] mt-2 flex items-center gap-1.5 justify-center flex-wrap">
            <Calendar className="w-3.5 h-3.5 text-[#ff2e55]" />
            <span>Next renewal: {subscription.renewalDate}</span>
            <span>•</span>
            <span className="font-digital text-white font-medium">
              ${subscription.spentToDate.toFixed(2)}
            </span>{' '}
            spent to date ({subscription.monthsActive} mos)
          </p>

          {/* Interactive Beam Trigger Switch / Simulator */}
          <div className="mt-4 pt-3 border-t border-[#1a253b]/60 w-full flex items-center justify-between">
            <span className="font-digital text-[10px] text-[#8498b5] tracking-wider uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#ff2e55]" />
              LASER CANCEL PREVIEW:
            </span>
            <button
              id="toggle-laser-preview-btn"
              type="button"
              onClick={onToggleLaserBeam}
              className={`px-2.5 py-1 rounded font-digital text-[10px] tracking-widest uppercase transition-all flex items-center gap-1 active:scale-95 ${
                isLaserActive
                  ? 'bg-[#ff2e55] text-white shadow-[0_0_15px_#ff2e55]'
                  : 'bg-[#ff2e55]/15 border border-[#ff2e55]/60 text-[#ff2e55] hover:bg-[#ff2e55] hover:text-white'
              }`}
            >
              {isLaserActive ? (
                <>
                  <Square className="w-3 h-3 fill-white" />
                  <span>Halt Beam</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test Plasma Beam</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sci-Fi Visualizer Wave Strip */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 my-2 border border-[#1a253b] bg-[#090d16]/40 rounded-lg">
        <span className="font-digital text-[10px] text-[#00daf3] tracking-widest uppercase">
          TELEMETRY_FREQ // REALTIME
        </span>
        <div className="flex items-center gap-1 h-5">
          <div className="w-1 bg-[#00ff88]/80 rounded-full wave-bar" style={{ animationDelay: '0.1s' }} />
          <div className="w-1 bg-[#00ff88]/90 rounded-full wave-bar" style={{ animationDelay: '0.3s' }} />
          <div className="w-1 bg-[#00daf3] rounded-full wave-bar" style={{ animationDelay: '0.5s' }} />
          <div className="w-1 bg-[#ff2e55] rounded-full wave-bar" style={{ animationDelay: '0.2s' }} />
          <div className="w-1 bg-[#ff2e55]/90 rounded-full wave-bar" style={{ animationDelay: '0.4s' }} />
          <div className="w-1 bg-[#ff2e55]/70 rounded-full wave-bar" style={{ animationDelay: '0.15s' }} />
        </div>
      </div>
    </div>
  );
};
