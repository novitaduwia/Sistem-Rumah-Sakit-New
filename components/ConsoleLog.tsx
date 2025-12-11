import React, { useEffect, useRef } from 'react';
import { SystemLog } from '../types';
import { Terminal } from 'lucide-react';

interface ConsoleLogProps {
  logs: SystemLog[];
}

const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">System Operations Log</span>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 scrollbar-hide max-h-[200px] md:max-h-none"
      >
        {logs.length === 0 && (
            <span className="text-slate-600 italic">Menunggu inisialisasi sistem...</span>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-slate-500 shrink-0">[{log.timestamp.toLocaleTimeString()}]</span>
            <span className={`${
              log.level === 'info' ? 'text-blue-400' :
              log.level === 'success' ? 'text-emerald-400' :
              log.level === 'warning' ? 'text-amber-400' :
              'text-red-500'
            }`}>
              {log.level.toUpperCase()}:
            </span>
            <span className="text-slate-300 break-all">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsoleLog;