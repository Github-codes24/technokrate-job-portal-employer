import React, { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle, Headphones, Clock } from "lucide-react";

// ─── Hardcoded bot replies ────────────────────────────────────────────────────
const BOT_REPLIES = [
  "Thanks for reaching out! One of our support agents will be with you shortly.",
  "We understand your concern. Can you please provide more details so we can assist you better?",
  "Our team is looking into this for you. Please hold on for a moment.",
  "Thank you for your patience! Is there anything else I can help you with?",
  "Great question! Let me check that for you right away.",
];

let replyIdx = 0;
const getNextReply = () => {
  const reply = BOT_REPLIES[replyIdx % BOT_REPLIES.length];
  replyIdx++;
  return reply;
};

// ─── Single message bubble ────────────────────────────────────────────────────
const Bubble = ({ msg }) => {
  const isUser = msg.sender === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold
          ${isUser ? "bg-purple-600" : "bg-gradient-to-br from-purple-500 to-fuchsia-500"}`}
      >
        {isUser ? "U" : <Headphones className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isUser
            ? "bg-purple-600 text-white rounded-br-sm"
            : "bg-white border border-gray-100 text-gray-700 rounded-bl-sm"
          }`}
      >
        {msg.text}
        <p className={`text-[10px] mt-1 ${isUser ? "text-purple-200 text-right" : "text-gray-400"}`}>
          {msg.time}
        </p>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const ChatSupportModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "support",
      text: "👋 Hi there! Welcome to Technokrate Support. How can we help you today?",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const now = () =>
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: "user", text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate bot typing delay
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const botMsg = {
        id: Date.now() + 1,
        sender: "support",
        text: getNextReply(),
        time: now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[95%] sm:w-[420px] h-[580px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-4 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Chat Support</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-purple-100">Support team is online</span>
              </div>
            </div>
          </div>

          {/* Typical response time */}
          <div className="mt-3 bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-purple-100" />
            <p className="text-[11px] text-purple-100">
              Typical response time: <strong className="text-white">Under 5 minutes</strong>
            </p>
          </div>
        </div>

        {/* ── Chat Body ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
          {messages.map((msg) => (
            <Bubble key={msg.id} msg={msg} />
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex-shrink-0 flex items-center justify-center">
                <Headphones className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input Bar ── */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                placeholder="Type your message..."
                maxLength={300}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none bg-gray-50
                  focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl flex items-center justify-center
                hover:scale-105 active:scale-95 transition-all shadow-md shadow-purple-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">
            Press <kbd className="bg-gray-100 px-1 rounded text-[9px]">Enter</kbd> to send
          </p>
        </div>

      </div>
    </div>
  );
};

export default ChatSupportModal;
