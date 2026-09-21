import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { CreateSubscriptionPayload, CancellationStrategy } from '../types';

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSubscriptionPayload) => Promise<void>;
}

export const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('18.99');
  const [category, setCategory] = useState('Productivity & SaaS');
  const [inactivityDays, setInactivityDays] = useState('40');
  const [usageScore, setUsageScore] = useState('16');
  const [strategy, setStrategy] = useState<CancellationStrategy>('concierge');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedCost = parseFloat(cost);
    if (!name.trim()) {
      setErrorMsg('Subscription name is required');
      return;
    }
    if (isNaN(parsedCost) || parsedCost <= 0) {
      setErrorMsg('Cost must be a valid positive number');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        cost: parsedCost,
        category: category.trim(),
        inactivityDays: parseInt(inactivityDays, 10) || 30,
        usageScore: parseInt(usageScore, 10) || 20,
        selectedStrategy: strategy,
        restartPreventionAlert: true,
      });
      // Reset form
      setName('');
      setCost('18.99');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create subscription record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#090d16] border border-[#00daf3]/40 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,218,243,0.15)] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1a253b]">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-[#00ff88]" />
            <h3 className="font-jupiter text-xs sm:text-sm font-bold uppercase text-white tracking-wider">
              REGISTER NEW RECURRING TARGET
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#1a253b] bg-[#0d1322] text-[#8498b5] hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* API Endpoint Banner */}
        <div className="my-3 px-2.5 py-1.5 rounded bg-[#05070a] border border-[#1a253b] font-digital text-[10px] text-[#8498b5] flex items-center justify-between">
          <span className="text-[#00ff88]">METHOD: POST</span>
          <span className="text-[#00daf3]">/api/subscriptions</span>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded bg-[#ff2e55]/15 border border-[#ff2e55]/40 text-[#ff2e55] font-body text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 font-body text-xs">
          <div>
            <label className="block font-digital text-[10px] uppercase text-[#8498b5] mb-1">
              Target Subscription Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Netflix, GitHub Copilot, Figma Pro"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#05070a] border border-[#1a253b] rounded-lg font-digital text-xs text-white focus:outline-none focus:border-[#00daf3]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-digital text-[10px] uppercase text-[#8498b5] mb-1">
                Cost ($ / Month) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-3 py-2 bg-[#05070a] border border-[#1a253b] rounded-lg font-digital text-xs text-white focus:outline-none focus:border-[#00daf3]"
              />
            </div>
            <div>
              <label className="block font-digital text-[10px] uppercase text-[#8498b5] mb-1">
                Days Inactive
              </label>
              <input
                type="number"
                min="0"
                value={inactivityDays}
                onChange={(e) => setInactivityDays(e.target.value)}
                className="w-full px-3 py-2 bg-[#05070a] border border-[#1a253b] rounded-lg font-digital text-xs text-white focus:outline-none focus:border-[#00daf3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-digital text-[10px] uppercase text-[#8498b5] mb-1">
                Usage Score (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={usageScore}
                onChange={(e) => setUsageScore(e.target.value)}
                className="w-full px-3 py-2 bg-[#05070a] border border-[#1a253b] rounded-lg font-digital text-xs text-white focus:outline-none focus:border-[#00daf3]"
              />
            </div>
            <div>
              <label className="block font-digital text-[10px] uppercase text-[#8498b5] mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#05070a] border border-[#1a253b] rounded-lg font-digital text-xs text-white focus:outline-none focus:border-[#00daf3]"
              />
            </div>
          </div>

          <div>
            <label className="block font-digital text-[10px] uppercase text-[#8498b5] mb-1">
              Default Cancellation Strategy
            </label>
            <div className="grid grid-cols-3 gap-1.5 font-digital text-[11px]">
              {(['concierge', 'pause', 'manual'] as CancellationStrategy[]).map((strat) => (
                <button
                  type="button"
                  key={strat}
                  onClick={() => setStrategy(strat)}
                  className={`py-1.5 px-1 rounded uppercase transition-all ${
                    strategy === strat
                      ? 'bg-[#00daf3]/20 border border-[#00daf3] text-[#00daf3] font-bold'
                      : 'bg-[#05070a] border border-[#1a253b] text-[#8498b5] hover:text-white'
                  }`}
                >
                  {strat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#1a253b] text-[#8498b5] hover:text-white font-digital text-xs"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#00ff88] text-[#05070a] hover:bg-[#00e479] font-jupiter text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? 'DISPATCHING...' : 'DISPATCH POST'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
