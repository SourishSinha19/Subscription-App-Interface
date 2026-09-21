import React, { useState } from 'react';
import { Terminal, X, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { HttpTelemetryEntry } from '../types';

interface HttpTelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: HttpTelemetryEntry[];
  onClearLogs: () => void;
}

export const HttpTelemetryDrawer: React.FC<HttpTelemetryDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10';
    if (code >= 400 && code < 500) return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    return 'text-[#ff2e55] border-[#ff2e55]/30 bg-[#ff2e55]/10';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-[#00daf3] bg-[#00daf3]/10 border-[#00daf3]/30';
      case 'POST':
        return 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30';
      case 'PUT':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'DELETE':
        return 'text-[#ff2e55] bg-[#ff2e55]/10 border-[#ff2e55]/30';
      default:
        return 'text-white bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a]/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#090d16] border-l border-[#1a253b] h-full flex flex-col p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1a253b]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00daf3]" />
            <h3 className="font-jupiter text-xs sm:text-sm font-bold uppercase text-white tracking-wider">
              HTTP TELEMETRY &amp; PAYLOAD INSPECTOR
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearLogs}
              title="Clear Logs"
              className="p-1.5 rounded-lg border border-[#1a253b] bg-[#0d1322] text-[#8498b5] hover:text-white hover:border-[#ff2e55] transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-[#1a253b] bg-[#0d1322] text-[#8498b5] hover:text-white flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status notice */}
        <div className="my-2 p-2 rounded bg-[#05070a] border border-[#1a253b] font-digital text-[10px] text-[#8498b5] flex items-center justify-between">
          <span>REALTIME EXPRESS HTTP INTERCEPTOR</span>
          <span className="text-[#00ff88]">{logs.length} EVENTS RECORDED</span>
        </div>

        {/* Logs Stream */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-12 font-digital text-xs text-[#8498b5]">
              No HTTP traffic recorded yet. Interact with the HUD to trigger GET, POST, or PUT calls.
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedId === log.id;
              return (
                <div
                  key={log.id}
                  className="rounded-xl border border-[#1a253b] bg-[#0d1322]/80 overflow-hidden text-xs font-digital"
                >
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#1a253b]/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-[#8498b5] shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#8498b5] shrink-0" />
                      )}
                      <span
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${getMethodColor(
                          log.method
                        )}`}
                      >
                        {log.method}
                      </span>
                      <span className="text-white truncate font-medium">{log.endpoint}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[#8498b5]">{log.durationMs}ms</span>
                      <span
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${getStatusColor(
                          log.statusCode
                        )}`}
                      >
                        {log.statusCode}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Payload Section */}
                  {isExpanded && (
                    <div className="p-3 bg-[#05070a] border-t border-[#1a253b] space-y-2.5">
                      <div className="text-[10px] text-[#8498b5] flex justify-between">
                        <span>TIMESTAMP: {log.timestamp}</span>
                        <span>STATUS: {log.statusText}</span>
                      </div>

                      {log.requestPayload ? (
                        <div>
                          <div className="text-[10px] uppercase text-[#00daf3] mb-1 font-bold">
                            REQUEST JSON PAYLOAD:
                          </div>
                          <pre className="p-2 rounded bg-[#090d16] border border-[#1a253b] text-[#dee2f0] text-[10px] overflow-x-auto">
                            {JSON.stringify(log.requestPayload, null, 2)}
                          </pre>
                        </div>
                      ) : null}

                      {log.responsePayload ? (
                        <div>
                          <div className="text-[10px] uppercase text-[#00ff88] mb-1 font-bold">
                            RESPONSE JSON PAYLOAD:
                          </div>
                          <pre className="p-2 rounded bg-[#090d16] border border-[#1a253b] text-[#dee2f0] text-[10px] overflow-x-auto max-h-48">
                            {JSON.stringify(log.responsePayload, null, 2)}
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
