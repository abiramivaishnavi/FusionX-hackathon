import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, MessageSquare, X, Send, Loader2 } from 'lucide-react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("Security Analyst");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    // In background fetch snippet of threats to pass to advisor
    axios.get("http://localhost:5000/api/threats")
      .then(r => setThreats(r.data.slice(0, 5)))
      .catch(() => {});
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:5000/api/advisor", {
        question: input,
        role: role,
        threats: threats
      });
      setMessages(prev => [...prev, { role: "ai", text: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Failed to get response. The advisor endpoint may be offline or rate-limited." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[2000] w-[56px] h-[56px] bg-primary text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(94,210,156,0.5)] hover:scale-105 hover:bg-emerald-400 transition-all"
        aria-label="Open Chatbot"
      >
        <MessageSquare className="w-6 h-6" fill="black" />
      </button>

      {open && (
        <div className="fixed bottom-0 right-0 sm:bottom-24 sm:right-6 sm:rounded-2xl z-[2000] w-full sm:w-[380px] h-screen sm:h-[600px] max-h-screen bg-[#070b0a] sm:bg-[#13131a] sm:border border-white/10 flex flex-col shadow-2xl animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Bot className="text-primary w-5 h-5" />
              <h3 className="text-white font-bold font-grift tracking-wide text-lg">Advisor</h3>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10"><X size={20}/></button>
          </div>
          
          <div className="px-4 py-3 bg-black/20 border-b border-white/5">
            <select
              value={role}
              onChange={e => { setRole(e.target.value); setMessages([]); }}
              className="w-full bg-white/5 border border-white/10 rounded-lg text-white/90 p-2 text-sm focus:outline-none focus:border-primary cursor-pointer"
            >
              {["Security Analyst", "Threat Researcher", "SOC Manager", "Admin", "CISO"].map(r => (
                <option key={r} value={r} className="bg-[#13131a]">{r}</option>
              ))}
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="text-sm text-center text-slate-500 m-auto">
                <Bot className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Hello! I am your AI assistant.<br/>Ask me about the latest vulnerabilities based on your role context.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-primary text-black self-end rounded-br-sm' : 'bg-white/10 text-white/90 self-start rounded-bl-sm whitespace-pre-line'}`}>
                  {msg.text}
                </div>
              ))
            )}
            {loading && (
              <div className="max-w-[85%] bg-white/5 rounded-xl px-4 py-3 text-sm self-start rounded-bl-sm text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Processing...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask a question..."
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-primary text-black px-4 py-2 rounded-lg font-bold disabled:opacity-50 hover:bg-emerald-500 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
