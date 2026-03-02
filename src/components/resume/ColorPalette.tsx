import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, X } from "lucide-react";
import { ResumeColorPalette, COLOR_PALETTES } from "@/types/resume";

interface Props {
  open: boolean;
  onClose: () => void;
  current: ResumeColorPalette;
  onSelect: (palette: ResumeColorPalette) => void;
  customColor: string;
  onCustomColor: (hex: string) => void;
}

export function ColorPalettePanel({ open, onClose, current, onSelect, customColor, onCustomColor }: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [tempColor, setTempColor] = useState(customColor);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Palette size={20} className="text-primary" /> Color Theme
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {COLOR_PALETTES.map((palette, i) => (
              <motion.button
                key={palette.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect(palette)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  current.id === palette.id
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/30 hover:border-border/60 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg" style={{ background: palette.accent }} />
                  <div className="w-4 h-8 rounded" style={{ background: palette.accentLight }} />
                  <div className="w-4 h-8 rounded" style={{ background: palette.accentDark }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{palette.name}</p>
                  <p className="text-[10px] text-muted-foreground">{palette.accent}</p>
                </div>
                {current.id === palette.id && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check size={16} className="text-primary" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Custom Color */}
          <div className="mt-4 pt-4 border-t border-border/40">
            <button
              onClick={() => setShowCustom(!showCustom)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                current.id === "custom"
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/30 hover:border-border/60 hover:bg-muted/30"
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg border border-border/30"
                style={{ background: `linear-gradient(135deg, ${customColor}, ${customColor}88)` }}
              />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Custom Color</p>
                <p className="text-[10px] text-muted-foreground">Pick your own brand color</p>
              </div>
              {current.id === "custom" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check size={16} className="text-primary" />
                </motion.div>
              )}
            </button>

            <AnimatePresence>
              {showCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 flex items-center gap-3">
                    <input
                      type="color"
                      value={tempColor}
                      onChange={e => setTempColor(e.target.value)}
                      className="w-12 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={tempColor}
                      onChange={e => setTempColor(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-lg text-sm bg-muted/50 border border-border/60 text-foreground font-mono"
                      placeholder="#000000"
                    />
                    <button
                      onClick={() => onCustomColor(tempColor)}
                      className="px-4 h-10 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      Apply
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
