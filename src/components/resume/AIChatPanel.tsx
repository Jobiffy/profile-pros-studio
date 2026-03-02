import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/hooks/useResumeAI";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, Bot, User, Sparkles, Zap, Mic, MicOff } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => void;
}

const suggestions = [
  { text: "Make my summary more impactful", emoji: "✨" },
  { text: "Add stronger action verbs to my experience", emoji: "💪" },
  { text: "Tailor my resume for a Product Manager role", emoji: "🎯" },
  { text: "Improve my bullet points with metrics", emoji: "📊" },
  { text: "Optimize for ATS systems", emoji: "🤖" },
  { text: "Make my skills section stand out", emoji: "⭐" },
];

export function AIChatPanel({ messages, loading, onSend }: Props) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const hasSpeech = typeof window !== "undefined" && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Sparkles size={16} className="text-violet-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Resume Coach</h3>
            <p className="text-[10px] text-muted-foreground">Your personal resume improvement assistant</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Hero */}
              <div className="text-center py-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-primary/20 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/10"
                >
                  <Zap size={28} className="text-violet-500" />
                </motion.div>
                <p className="text-sm font-semibold text-foreground">Hi! I'm your AI resume coach</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
                  I can rewrite sections, add metrics, tailor for specific roles, and make your resume stand out
                </p>
              </div>

              {/* Suggestions grid */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1">Quick prompts</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.06 }}
                      onClick={() => { setInput(s.text); }}
                      className="text-left p-2.5 rounded-lg text-[11px] text-foreground bg-muted/40 border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all leading-snug"
                    >
                      <span className="mr-1">{s.emoji}</span> {s.text}
                    </motion.button>
                  ))}
                </div>
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
                  <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-violet-500" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted/50 border border-border/40 text-foreground rounded-bl-sm"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-xs max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 [&_code]:text-[10px] [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-accent-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Bot size={14} className="text-violet-500" />
              </div>
              <div className="flex gap-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/40">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-3 border-t border-border/50 bg-card/50">
        <div className="flex gap-1.5">
          {/* Voice button */}
          {hasSpeech && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleVoice}
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                isListening
                  ? "bg-destructive/10 text-destructive border border-destructive/30 animate-pulse"
                  : "bg-muted/50 text-muted-foreground border border-border/50 hover:text-foreground hover:bg-muted"
              }`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            </motion.button>
          )}
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={isListening ? "Listening..." : "Ask me to improve your resume..."}
            className="flex-1 h-9 px-3 rounded-lg text-sm bg-muted/50 border border-border/50 focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
          >
            <Send size={14} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
