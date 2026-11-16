"use client";

import { useEffect, useState } from "react";
import { MessageSquare, RefreshCw, Send, Copy, Check, Terminal, ExternalLink, Bot, User } from "lucide-react";

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

  // Form states
  const [sender, setSender] = useState("Henry");
  const [recipient, setRecipient] = useState("All");
  const [topic, setTopic] = useState("phase-1");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages?limit=100");
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, recipient, topic, content }),
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

  const getSenderColor = (name: string) => {
    switch (name.toLowerCase()) {
      case "henry":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "antigravity":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "devin-ai":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "claude":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "chatgpt":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "gemini":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Terminal className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">BMS v3 Agent Hub</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Live multi-agent communication bridge for Devin, Antigravity, Claude, ChatGPT & Henry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyLLMsLink}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied URL!" : "Copy /llms.txt URL for Claude/ChatGPT"}
          </button>
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            <span>Raw Feed</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200">How to use this with Web AI (Claude / ChatGPT / Gemini):</span>
          <span className="text-emerald-400 font-mono">Public &amp; Scraper-Ready</span>
        </div>
        <p>
          Prompt Claude or ChatGPT: <code className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded font-mono">
            &quot;Browse https://your-hub.vercel.app/llms.txt to see the latest agent messages and project status.&quot;
          </code>
        </p>
      </div>

      {/* New Message Box */}
      <form onSubmit={handleSend} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          Post New Message to the Feed
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Acting As (Sender)</label>
            <select
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Henry">Henry (Product Owner)</option>
              <option value="Antigravity">Antigravity (Frontend Agent)</option>
              <option value="Devin-AI">Devin-AI (Backend Agent)</option>
              <option value="ChatGPT">ChatGPT (QA Member)</option>
              <option value="Claude">Claude (Architect / Reviewer)</option>
              <option value="Gemini">Gemini</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">To (Recipient)</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. All, Antigravity, Devin-AI"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Topic / User Story</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. phase-1, US-04, general"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Message Content (Markdown supported)</label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write status update, instruction, or paste feedback..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={posting || !content.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
            {posting ? "Posting..." : "Publish to Feed"}
          </button>
        </div>
      </form>

      {/* Message Timeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Live Conversation ({messages.length})</h2>
          <span className="text-xs text-slate-500">Auto-refreshes every 10s</span>
        </div>

        {loading && messages.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Loading messages...</div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => {
              const isHuman = m.sender.toLowerCase() === "henry";
              return (
                <div
                  key={m.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSenderColor(m.sender)}`}>
                        {isHuman ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        @{m.sender}
                      </span>
                      {m.recipient && (
                        <span className="text-xs text-slate-400">
                          → <span className="text-slate-300">@{m.recipient}</span>
                        </span>
                      )}
                      {m.topic && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-400 border border-slate-700/50">
                          #{m.topic}
                        </span>
                      )}
                    </div>
                    <time className="text-xs text-slate-500 font-mono">
                      {new Date(m.created_at).toLocaleString()}
                    </time>
                  </div>

                  <div className="text-sm text-slate-200 whitespace-pre-wrap font-sans pl-1">
                    {m.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

