import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/hooks/useResumeAI";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => void;
}

const suggestions = [
  "Make my summary more impactful",
  "Add stronger action verbs to my experience",
  "Tailor my resume for a Product Manager role",
  "Improve my bullet points with metrics",
];

export function AIChatPanel({ messages, loading, onSend }: Props) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageSquare size={16} className="text-primary" /> AI Resume Assistant
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">Chat to improve your resume in real-time</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} className="text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Hi! I'm your AI resume coach</p>
                <p className="text-xs text-muted-foreground mt-1">Ask me to improve any section of your resume</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Try asking:</p>
                {suggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    onClick={() => { setInput(s); }}
                    className="w-full text-left p-2.5 rounded-lg text-xs text-foreground bg-muted/50 border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                  >
                    "{s}"
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-primary" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 border border-border/40 text-foreground"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-xs prose-green max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 [&_code]:text-[10px] [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-accent-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot size={14} className="text-primary" />
              </div>
              <div className="flex gap-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border/50">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask me to improve your resume..."
            className="flex-1 h-9 px-3 rounded-lg text-sm bg-muted/50 border border-border/60 focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
