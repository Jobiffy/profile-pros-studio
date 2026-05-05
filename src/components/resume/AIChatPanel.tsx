import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/hooks/useResumeAI";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Bot, User, Sparkles, Zap, Mic, MicOff, CheckCircle2, ArrowUpRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

interface SpeechRecognitionResultEvent {
  results: ArrayLike<{ 0: { transcript: string } }>;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => void;
  resumeName?: string;
}

const suggestions = [
  { text: "Make my summary more impactful with metrics", emoji: "✨" },
  { text: "Add stronger action verbs to my first experience", emoji: "💪" },
  { text: "Move skills section above experience", emoji: "🔀" },
  { text: "Improve all bullet points with quantified results", emoji: "📊" },
  { text: "Hide the leadership section", emoji: "🙈" },
  { text: "Add a new project about my open source work", emoji: "➕" },
  { text: "Rewrite my summary for a Senior PM role", emoji: "🎯" },
  { text: "Add 'Python, Docker, Kubernetes' to my skills", emoji: "⭐" },
];

export function AIChatPanel({ messages, loading, onSend, resumeName }: Props) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  // Defensive teardown: detach listeners before stop() so a late onresult /
  // onend / onerror that fires after stop can't hit a state setter on an
  // unmounted component. Some browsers fire one trailing event post-stop.
  // .stop() can throw InvalidStateError if already stopped — swallow it.
  const teardownRecognition = () => {
    const r = recognitionRef.current;
    if (!r) return;
    r.onresult = null;
    r.onend = null;
    r.onerror = null;
    try { r.stop(); } catch { /* already stopped */ }
    recognitionRef.current = null;
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    if (isListening) {
      teardownRecognition();
      setIsListening(false);
      return;
    }
    // Tear down any prior instance before starting a new one so we don't
    // leak event handlers from a previous start/stop cycle.
    teardownRecognition();

    const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      const results = event.results as ArrayLike<{ 0: { transcript: string } }>;
      const transcript = Array.from(results).map((result) => result[0].transcript).join("");
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  useEffect(() => {
    return () => { teardownRecognition(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <h3 className="text-sm font-semibold text-foreground">Jobiffy AI Resume Coach</h3>
            <p className="text-[10px] text-muted-foreground">
              {resumeName ? `Editing: ${resumeName}` : "Edit, reorder, improve — just ask"}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="text-center py-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-primary/20 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/10"
                >
                  <Zap size={28} className="text-violet-500" />
                </motion.div>
                <p className="text-sm font-semibold text-foreground">Hi! I'm your Jobiffy AI Resume Coach</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto">
                  I can modify content, reorder sections, add/remove items, and optimize your resume — all changes appear instantly
                </p>
              </div>

              {/* Capability pills */}
              <div className="flex flex-wrap gap-1.5 justify-center px-2">
                {["Edit Content", "Reorder Sections", "Add Items", "Hide Sections", "Improve Bullets"].map(cap => (
                  <span key={cap} className="text-[9px] px-2 py-1 rounded-full bg-primary/8 text-primary border border-primary/15 font-medium">
                    {cap}
                  </span>
                ))}
              </div>

              {/* Suggestions grid */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1">Try these</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.04 }}
                      onClick={() => onSend(s.text)}
                      className="text-left p-2.5 rounded-lg text-[11px] text-foreground bg-muted/40 border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all leading-snug flex items-center gap-2 group"
                    >
                      <span>{s.emoji}</span>
                      <span className="flex-1">{s.text}</span>
                      <ArrowUpRight size={10} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    <div>
                      {/* Applied actions banner */}
                      {msg.appliedActions && msg.appliedActions.length > 0 && (
                        <div className="mb-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              {msg.appliedActions.length} change{msg.appliedActions.length > 1 ? "s" : ""} applied
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {msg.appliedActions.map((action, j) => (
                              <div key={j} className="text-[10px] text-emerald-700 dark:text-emerald-300">
                                <ReactMarkdown
                                  rehypePlugins={[rehypeSanitize]}
                                  components={{
                                    p: ({ children }) => <span>{children}</span>,
                                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                  }}
                                >{action}</ReactMarkdown>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {msg.content && (
                        <div className="prose prose-xs max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 [&_code]:text-[10px] [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded">
                          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{msg.content}</ReactMarkdown>
                        </div>
                      )}
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
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/40">
                <Loader2 size={12} className="animate-spin text-violet-500" />
                <span className="text-[10px] text-muted-foreground">Thinking & applying changes...</span>
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-3 border-t border-border/50 bg-card/50">
        <div className="flex gap-1.5">
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
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isListening ? "Listening..." : "e.g. 'Rewrite my summary for a PM role'"}
            rows={1}
            className="flex-1 min-h-[36px] max-h-[120px] px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border/50 focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground resize-none overflow-y-auto"
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
