"use client";

import { useEffect, useState, useRef } from "react";
import { RefreshCw, Send, Copy, Check, ExternalLink, Bot, User, Globe } from "lucide-react";

interface AgentMessage {
  id: string;
  sender: string;
  recipient?: string;
  content: string;
  topic?: string;
  created_at: string;
}

export default function Home() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Form states - acting as user by default, sent to everyone in group
  const [sender, setSender] = useState("Henry");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("phase-1");
  const [posting, setPosting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages?limit=200");
      const data = await res.json();
      if (data.messages) {
        // Group chat displays in chronological order (oldest to newest)
        const sorted = [...data.messages].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // 5s auto-poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, recipient: "Group", topic, content }),
      });
      if (res.ok) {
        setContent("");
        await fetchMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const copyLLMsLink = () => {
    const url = `${window.location.origin}/llms.txt`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAgentBadge = (name: string) => {
    switch (name.toLowerCase()) {
      case "henry":
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          bubble: "bg-emerald-950/40 border-emerald-800/40 text-emerald-50",
          label: "Product Owner",
        };
      case "antigravity":
        return {
          bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          bubble: "bg-cyan-950/40 border-cyan-800/40 text-cyan-50",
          label: "Frontend Agent",
        };
      case "devin-ai":
        return {
          bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
          bubble: "bg-indigo-950/40 border-indigo-800/40 text-indigo-50",
          label: "Backend Agent",
        };
      case "claude":
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          bubble: "bg-amber-950/40 border-amber-800/40 text-amber-50",
          label: "Architect",
        };
      case "chatgpt":
        return {
          bg: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
          bubble: "bg-fuchsia-950/40 border-fuchsia-800/40 text-fuchsia-50",
          label: "QA Member",
        };
      case "gemini":
        return {
          bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          bubble: "bg-blue-950/40 border-blue-800/40 text-blue-50",
          label: "Research",
        };
      default:
        return {
          bg: "bg-slate-800 text-slate-300 border-slate-700",
          bubble: "bg-slate-900 border-slate-800 text-slate-200",
          label: "Member",
        };
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto bg-slate-950 border-x border-slate-800/80 shadow-2xl">
      {/* WhatsApp / Group Chat Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-white text-base leading-tight">BMS v3 Team &amp; Agent Hub</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Group Chat
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Henry (PO), Devin-AI, Antigravity, Claude, ChatGPT, Gemini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyLLMsLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy /llms.txt for AI"}
          </button>
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <span>Raw</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Group Chat Messages Timeline */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/60">
        <div className="text-center my-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
            Messages are shared publicly to all agents and team members
          </span>
        </div>

        {loading && messages.length === 0 ? (
          <div className="text-center py-20 text-slate-500">Connecting to group feed...</div>
        ) : (
          messages.map((m) => {
            const isHenry = m.sender.toLowerCase() === "henry";
            const badge = getAgentBadge(m.sender);

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isHenry ? "items-end" : "items-start"} space-y-1`}
              >
                {/* Sender Identity & Role */}
                <div className="flex items-center gap-2 px-1 text-xs">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium border ${badge.bg}`}>
                    {isHenry ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    {m.sender}
                  </span>
                  <span className="text-[11px] text-slate-500">({badge.label})</span>
                  {m.topic && (
                    <span className="text-[10px] font-mono text-slate-400">#{m.topic}</span>
                  )}
                  <time className="text-[10px] text-slate-500 font-mono">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </time>
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-3.5 border shadow-sm ${badge.bubble} ${
                    isHenry ? "rounded-tr-none" : "rounded-tl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap font-sans leading-relaxed select-text">
                    {m.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* WhatsApp-style Input Footer */}
      <footer className="p-3 bg-slate-900/95 border-t border-slate-800 backdrop-blur">
        <form onSubmit={handleSend} className="space-y-2">
          {/* Controls: Sender & Topic Selection */}
          <div className="flex items-center gap-2 px-1 text-xs text-slate-400">
            <span>Send as:</span>
            <select
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="Henry">Henry (Product Owner)</option>
              <option value="Antigravity">Antigravity (Frontend Agent)</option>
              <option value="Devin-AI">Devin-AI (Backend Agent)</option>
              <option value="ChatGPT">ChatGPT (QA)</option>
              <option value="Claude">Claude (Architect)</option>
              <option value="Gemini">Gemini (Research)</option>
            </select>

            <span className="ml-2">Topic:</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. phase-1, US-04"
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs w-28 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Text Input Row */}
          <div className="flex items-end gap-2">
            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type message to the group... (Enter to send, Shift+Enter for new line)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              required
            />
            <button
              type="submit"
              disabled={posting || !content.trim()}
              className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Send</span>
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
