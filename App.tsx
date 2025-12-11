import React, { useState, useRef, useEffect } from 'react';
import { AgentType, Message, SystemLog } from './types';
import { SUB_AGENTS } from './constants';
import { classifyAndDelegate, mapFunctionToAgentType, simulateSubAgentResponse } from './services/geminiService';
import AgentVisualizer from './components/AgentVisualizer';
import ConsoleLog from './components/ConsoleLog';
import { Send, Cpu, Activity, ShieldCheck, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addLog = (message: string, level: SystemLog['level'] = 'info') => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      level,
      message,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const handleSetKey = () => {
    if (apiKey.trim().length > 0) {
      setHasKey(true);
      addLog("System initialized. Security protocols active.", "success");
      addLog("Coordinator Agent ready.", "info");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);
    setActiveAgent(AgentType.COORDINATOR);

    addLog(`Incoming request: "${userMsg.content.substring(0, 30)}..."`, 'info');
    addLog("Coordinator analyzing user intent...", "warning");

    try {
      // 1. Coordinator Step
      const result = await classifyAndDelegate(apiKey, userMsg.content);

      if (result.type === 'DELEGATION' && result.functionName) {
        const targetAgentType = mapFunctionToAgentType(result.functionName);
        const targetAgent = SUB_AGENTS[targetAgentType];

        addLog(`Intent Identified. Delegating to: ${targetAgent.name}`, "success");
        addLog(`Function Call: ${result.functionName}(${JSON.stringify(result.args)})`, "info");
        
        // Visualize the switch
        setActiveAgent(targetAgentType);

        // Simulate Network/Processing Delay for effect
        setTimeout(() => {
            const subAgentResponseText = simulateSubAgentResponse(targetAgentType, userMsg.content);
            
            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                agentType: targetAgentType,
                content: subAgentResponseText,
                timestamp: new Date(),
                metadata: {
                    isSecure: targetAgent.isSecure
                }
            };
            
            setMessages((prev) => [...prev, agentMsg]);
            addLog(`Sub-agent task completed successfully.`, "success");
            
            // Reset state
            setIsProcessing(false);
            setActiveAgent(null);

        }, 1500); // 1.5s delay to show the agent working
      } else {
        // Fallback error
        addLog("Delegation failed. Coordinator could not determine intent.", "error");
        setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: "Maaf, saya tidak dapat menentukan sub-agen yang tepat untuk permintaan ini.",
            timestamp: new Date()
        }]);
        setIsProcessing(false);
        setActiveAgent(null);
      }

    } catch (error) {
      addLog(`Critical Error: ${error}`, "error");
      setIsProcessing(false);
      setActiveAgent(null);
    }
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600/20 rounded-full">
                <ShieldCheck className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">Hospital Command Center</h1>
          <p className="text-slate-400 text-center mb-6">Secure Access Terminal</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Gemini API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API Key..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleSetKey}
              disabled={apiKey.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Initialize System <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-slate-500 text-center mt-4">
              Restricted Access. Authorized Personnel Only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar / Top area for Mobile - System Status */}
      <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="font-bold text-lg text-white leading-tight">Hospital<br/>Command Center</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs text-emerald-500 font-mono">SYSTEM ONLINE</span>
                </div>
            </div>
        </div>

        {/* Coordinator Status */}
        <div className={`p-4 rounded-xl border transition-all duration-300 ${activeAgent === AgentType.COORDINATOR ? 'bg-blue-900/30 border-blue-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-slate-400">Main Processor</span>
                {activeAgent === AgentType.COORDINATOR && <Cpu className="w-4 h-4 text-blue-400 animate-spin" />}
            </div>
            <div className="text-sm font-medium text-slate-200">
                {activeAgent === AgentType.COORDINATOR ? 'Analyzing Intent...' : 'Standby'}
            </div>
            <div className="mt-2 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full bg-blue-500 transition-all duration-300 ${activeAgent === AgentType.COORDINATOR ? 'w-full animate-pulse' : 'w-0'}`}></div>
            </div>
        </div>

        {/* Logs */}
        <div className="flex-1 min-h-[200px]">
            <ConsoleLog logs={logs} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-h-screen">
        
        {/* Header Visualizer */}
        <div className="p-6 bg-slate-950/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-xs font-mono text-slate-500 mb-4 uppercase tracking-widest">Active Sub-Agents Grid</h2>
                <AgentVisualizer activeAgent={activeAgent} />
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
            <div className="max-w-3xl mx-auto space-y-6">
                {messages.length === 0 && (
                    <div className="text-center mt-20 opacity-50">
                        <Cpu className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                        <p className="text-lg text-slate-400">Command Center Ready.</p>
                        <p className="text-sm text-slate-600">Enter a query to begin triage and delegation.</p>
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            <button onClick={() => setInput("Cek status pasien NIK 3273...")} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-xs text-slate-400 transition-colors">"Cek status pasien..."</button>
                            <button onClick={() => setInput("Jadwalkan temu dengan Dr. Budi")} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-xs text-slate-400 transition-colors">"Jadwal temu..."</button>
                            <button onClick={() => setInput("Berapa tagihan terakhir saya?")} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-xs text-slate-400 transition-colors">"Info tagihan..."</button>
                        </div>
                    </div>
                )}
                
                {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    const agentDef = msg.agentType ? SUB_AGENTS[msg.agentType] : null;

                    return (
                        <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-5 ${
                                isUser 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                            }`}>
                                {!isUser && agentDef && (
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/50">
                                        <div className={`w-2 h-2 rounded-full ${agentDef.color}`}></div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{agentDef.name}</span>
                                        {msg.metadata?.isSecure && (
                                            <ShieldCheck className="w-3 h-3 text-emerald-500 ml-auto" />
                                        )}
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {msg.content}
                                </div>
                                <div className={`text-[10px] mt-2 ${isUser ? 'text-blue-200' : 'text-slate-500'} text-right`}>
                                    {msg.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isProcessing && activeAgent !== AgentType.COORDINATOR && (
                     <div className="flex justify-start">
                        <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                            </div>
                            <span className="text-xs text-slate-400">Sub-agent working...</span>
                        </div>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="max-w-3xl mx-auto flex items-center gap-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Masukkan perintah koordinator..."
                        disabled={isProcessing}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 transition-all placeholder:text-slate-600"
                    />
                </div>
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isProcessing}
                    className="p-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            <div className="text-center mt-2">
                 <p className="text-[10px] text-slate-600">AI Hospital System v2.0 • Powered by Gemini • Strict Delegation Protocol</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;