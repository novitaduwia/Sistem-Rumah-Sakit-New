import React from 'react';
import { SUB_AGENTS } from '../constants';
import { AgentType } from '../types';
import * as Icons from 'lucide-react';

interface AgentVisualizerProps {
  activeAgent: AgentType | null;
}

const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ activeAgent }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {Object.values(SUB_AGENTS).map((agent) => {
        if (agent.type === AgentType.COORDINATOR) return null; // Coordinator is shown separately usually, or ignored in this grid

        const isActive = activeAgent === agent.type;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const IconComponent = (Icons as any)[agent.icon];

        return (
          <div
            key={agent.type}
            className={`
              relative overflow-hidden rounded-xl border p-4 transition-all duration-500
              ${isActive 
                ? `${agent.color} border-transparent shadow-lg shadow-${agent.color}/50 scale-105` 
                : 'bg-slate-800/50 border-slate-700 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}
            `}
          >
            <div className="flex flex-col items-center text-center space-y-3 relative z-10">
              <div className={`p-3 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-700'}`}>
                {IconComponent && <IconComponent className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400'}`} />}
              </div>
              <div>
                <h3 className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {agent.name}
                </h3>
                {agent.isSecure && (
                    <div className="flex items-center justify-center gap-1 mt-1 text-[10px] uppercase tracking-wider font-bold text-red-300">
                        <Icons.Lock className="w-3 h-3" />
                        Secure
                    </div>
                )}
              </div>
            </div>
            
            {/* Animated Background pulse for active state */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent animate-pulse pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AgentVisualizer;