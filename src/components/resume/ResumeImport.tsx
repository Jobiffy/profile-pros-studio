import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, CheckCircle2, X, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResumeData } from "@/types/resume";
import { toast } from "@/hooks/use-toast";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

// pdf.js (~1.5 MB) and mammoth (~300 KB) are loaded only when the user
// actually imports a resume — keeps them out of the initial bundle.
async function extractTextFromPdf(file: File): Promise<string> {
  const [pdfjsLib, workerModule] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

async function extractTextFromDocx(file: File): Promise<string> {
  const { default: mammoth } = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (data: ResumeData, fileName?: string) => void;
}

export function ResumeImport({ open, onClose, onImport }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parseFile = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      toast({
        title: "File too large",
        description: `Max size is 5 MB. "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`,
        variant: "destructive",
      });
      return;
    }
    setFileName(file.name);
    setParsing(true);
    setProgress(10);

    try {
      let text = "";
      const name = file.name.toLowerCase();

      if (name.endsWith(".pdf") || file.type === "application/pdf") {
        text = await extractTextFromPdf(file);
      } else if (
        name.endsWith(".docx") ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        text = await extractTextFromDocx(file);
      } else if (name.endsWith(".doc") || file.type === "application/msword") {
        try {
          text = await extractTextFromDocx(file);
        } catch {
          throw new Error(
            "Legacy .doc format is not fully supported. Please save as .docx or .pdf and try again."
          );
        }
      } else {
        text = await file.text();
      }

      if (!text || text.trim().length < 30) {
        throw new Error(
          "Could not extract enough text from the file. Please try a different format (.docx or .pdf)."
        );
      }

      setProgress(30);

      const { data, error } = await supabase.functions.invoke("resume-ai", {
        body: { action: "parse-resume", rawText: text },
      });

      setProgress(90);

      if (error) throw error;
      if (!data) throw new Error("No data returned from AI");

      setProgress(100);
      await new Promise((r) => setTimeout(r, 500));

      onImport(data, file.name);
      toast({
        title: "Resume imported!",
        description: `Successfully parsed "${file.name}"`,
      });
      onClose();
    } catch (e: any) {
      console.error("Import error:", e);
      toast({
        title: "Import failed",
        description:
          e.message || "Could not parse the resume. Try a .docx or .pdf format.",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
      setProgress(0);
      setFileName("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
    e.target.value = "";
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              Import Resume
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {!parsing ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <motion.div
                animate={
                  dragOver ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }
                }
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <Upload size={28} className="text-primary" />
              </motion.div>
              <p className="text-sm font-medium text-foreground mb-1">
                Drop your resume here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, DOCX, TXT, MD • Max 5MB
              </p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear",
                }}
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <Loader2 size={28} className="text-primary" />
              </motion.div>
              <p className="text-sm font-medium text-foreground mb-1">
                Parsing "{fileName}"
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                AI is extracting your resume data...
              </p>
              <div className="w-full max-w-xs mx-auto h-2 rounded-full bg-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="mt-4 space-y-2">
                {[
                  "Reading file content",
                  "Extracting sections",
                  "Structuring data",
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: progress > (i + 1) * 25 ? 1 : 0.3,
                      x: 0,
                    }}
                    transition={{ delay: i * 0.3 }}
                    className="flex items-center gap-2 text-xs text-muted-foreground justify-center"
                  >
                    {progress > (i + 1) * 25 ? (
                      <CheckCircle2 size={12} className="text-primary" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-border" />
                    )}
                    {step}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border/30">
            <AlertCircle
              size={14}
              className="text-muted-foreground shrink-0 mt-0.5"
            />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Our AI will parse your resume and map it to the selected template.
              For best results, use a well-structured resume. You can edit any
              field after import.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
