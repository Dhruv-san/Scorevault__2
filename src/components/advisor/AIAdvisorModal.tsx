import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Search, 
  BrainCircuit, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight, 
  Bot, 
  User as UserIcon 
} from 'lucide-react';
import { askScorevaultAdvisor, AIAdvisorResponse } from '../../services/aiService';
import { authService } from '../../services/authService';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: any[];
  mode?: 'search_grounded' | 'thinking_high';
}

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am Scorevault's Senior Education Intelligence Counselor.

I can help you navigate Indian admissions, entrance exam cutoffs (JEE, NEET, CAT, CLAT, CBSE/ICSE), real placement medians, and hostel cultures across schools and colleges.

How can I assist your educational journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [useThinking, setUseThinking] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Compare IIT Bombay vs IIT Delhi for AI & ML placements',
    'Best ICSE and CBSE schools in Lucknow for Class 11 Science',
    'Is RVCE Bangalore COMEDK fee worth the ROI compared to private universities?',
    'What are real CAT percentiles and profile criteria for IIM Ahmedabad?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response: AIAdvisorResponse = await askScorevaultAdvisor({
        prompt: query,
        useThinking
      });

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        mode: response.mode
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to connect to intelligence servers right now. Please cross-reference NIRF official documents and authentic reviews on Scorevault.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full h-[90vh] sm:h-[85vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-950 font-display">
                  Scorevault AI Education Counselor
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-800 font-semibold">
                  {useThinking ? 'Gemini High Thinking' : 'Google Search Grounded'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Independent, verified insights for Indian schools, colleges & universities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Thinking Mode Toggle */}
            <button
              onClick={() => setUseThinking(!useThinking)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                useThinking
                  ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Toggle Gemini High Thinking Mode"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
              <span>Deep Reasoning Mode</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-800 border border-slate-200/60 shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{msg.text}</div>

                {/* Sources if present */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs">
                    <span className="font-bold text-slate-700 block mb-1.5">
                      Grounding References:
                    </span>
                    <div className="space-y-1">
                      {msg.sources.map((s, idx) => s.web?.uri ? (
                        <a
                          key={idx}
                          href={s.web.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-blue-600 hover:underline truncate text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{s.web.title || s.web.uri}</span>
                        </a>
                      ) : null)}
                    </div>
                  </div>
                )}

                <div
                  className={`mt-1.5 text-[10px] ${
                    msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-3 border border-slate-200/60 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-500 font-medium ml-1">
                  {useThinking ? 'Reasoning through comparative data...' : 'Grounding with Google Search...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pill Strip */}
        {messages.length < 3 && (
          <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 overflow-x-auto flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Try asking:</span>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="text-[11px] font-medium text-slate-600 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={e => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-blue-600 focus-within:bg-white transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={useThinking ? 'Ask for deep comparative analysis...' : 'Ask about cutoffs, fees, NIRF rank, placements...'}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Powered by Gemini Models + Google Search Grounding</span>
            <span>Always verify official counseling notices for final dates</span>
          </div>
        </div>

      </div>
    </div>
  );
};
