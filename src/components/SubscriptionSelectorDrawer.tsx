import React, { useState } from 'react';
import { X, Search, Plus, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Subscription } from '../types';

interface SubscriptionSelectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  currentId: string;
  onSelectSubscription: (sub: Subscription) => void;
  onOpenCreateModal: () => void;
}

export const SubscriptionSelectorDrawer: React.FC<SubscriptionSelectorDrawerProps> = ({
  isOpen,
  onClose,
  subscriptions,
  currentId,
  onSelectSubscription,
  onOpenCreateModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = subscriptions.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#090d16] border-l border-[#1a253b] h-full flex flex-col p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1a253b]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#00daf3]" />
            <h3 className="font-jupiter text-xs sm:text-sm font-bold uppercase text-white tracking-wider">
              TELEMETRY TARGET DIRECTORY
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#1a253b] bg-[#0d1322] text-[#8498b5] hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Add Action */}
        <div className="my-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8498b5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search targets or codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#05070a] border border-[#1a253b] rounded-lg text-xs font-digital text-white placeholder-[#526b8c] focus:outline-none focus:border-[#00daf3]"
            />
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            className="px-3 py-2 bg-[#00ff88]/15 border border-[#00ff88]/40 text-[#00ff88] rounded-lg text-xs font-digital flex items-center gap-1 hover:bg-[#00ff88] hover:text-[#05070a] transition-all font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>NEW</span>
          </button>
        </div>

        {/* Subscriptions List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 font-digital text-xs text-[#8498b5]">
              No subscriptions match your query.
            </div>
          ) : (
            filtered.map((sub) => {
              const isSelected = sub.id === currentId;
              const isFlagged = sub.status === 'flagged_inactive';
              const isCancelled = sub.status === 'cancelled';
              const isPaused = sub.status === 'paused';

              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    onSelectSubscription(sub);
                    onClose();
                  }}
                  className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#0d1322] border-[#00daf3] shadow-[0_0_12px_rgba(0,218,243,0.25)]'
                      : 'bg-[#0d1322]/50 border-[#1a253b] hover:border-[#22395d]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#05070a] border border-[#1a253b] flex items-center justify-center overflow-hidden shrink-0">
                      {sub.logoUrl ? (
                        <img src={sub.logoUrl} alt={sub.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="font-jupiter text-xs text-white font-bold">
                          {sub.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-jupiter text-xs font-bold text-white">{sub.name}</span>
                        {isFlagged && <AlertTriangle className="w-3 h-3 text-[#ff2e55]" />}
                      </div>
                      <div className="font-digital text-[10px] text-[#8498b5] flex items-center gap-1.5 mt-0.5">
                        <span>{sub.code}</span>
                        <span>•</span>
                        <span className="text-white">${sub.cost.toFixed(2)}/mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-digital px-1.5 py-0.5 rounded border uppercase ${
                        isFlagged
                          ? 'border-[#ff2e55]/40 bg-[#ff2e55]/10 text-[#ff2e55]'
                          : isCancelled
                          ? 'border-gray-600 bg-gray-800 text-gray-400'
                          : isPaused
                          ? 'border-[#00ff88]/40 bg-[#00ff88]/10 text-[#00ff88]'
                          : 'border-[#00daf3]/40 bg-[#00daf3]/10 text-[#00daf3]'
                      }`}
                    >
                      {sub.status.replace('_', ' ')}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#00daf3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#1a253b] font-digital text-[10px] text-[#8498b5] flex justify-between">
          <span>Active filter endpoint</span>
          <span className="text-[#00daf3]">GET /api/subscriptions</span>
        </div>
      </div>
    </div>
  );
};
