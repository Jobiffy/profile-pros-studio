import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { useNavigate } from "react-router-dom";
import { JobiffyLogo } from "@/components/JobiffyLogo";
import {
  Coins, Plus, ArrowLeft, LogOut, User, Zap, MessageSquare, Target, Briefcase,
  TrendingUp, TrendingDown, Gift, CreditCard, Loader2, Sparkles, Crown, Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const topUpOptions = [
  { amount: 25, price: "₹49", popular: false },
  { amount: 50, price: "₹89", popular: false },
  { amount: 100, price: "₹149", popular: true },
  { amount: 250, price: "₹299", popular: false },
];

const featureIcons: Record<string, React.ReactNode> = {
  ai_chat: <MessageSquare size={14} className="text-violet-500" />,
  jd_match: <Briefcase size={14} className="text-blue-500" />,
  ats_check: <Target size={14} className="text-emerald-500" />,
  topup: <CreditCard size={14} className="text-primary" />,
  signup_bonus: <Gift size={14} className="text-amber-500" />,
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const { balance, transactions, loading, addCredits, CREDIT_COSTS } = useCredits();
  const navigate = useNavigate();
  const [topUpLoading, setTopUpLoading] = useState<number | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Precedence: user upload first (sticky across re-auth), then OAuth claims.
  const avatarUrl =
    user?.user_metadata?.custom_avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  const handleTopUp = async (amount: number) => {
    if (topUpLoading !== null) return;
    setTopUpLoading(amount);
    try {
      await addCredits(amount, `Top-up: +${amount} credits`);
    } finally {
      setTopUpLoading(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      toast({ title: "Sign out failed", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
      return;
    }
    navigate("/");
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input so picking the same file twice still fires onChange.
    e.target.value = "";
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please choose an image.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast({ title: "File too large", description: "Max 2MB.", variant: "destructive" });
      return;
    }

    setAvatarUploading(true);
    try {
      // Path is namespaced by user id; storage RLS gates writes by the
      // first segment matching auth.uid().
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = publicData.publicUrl;
      if (!publicUrl) throw new Error("Could not resolve public URL.");

      // Stored under custom_avatar_url so a future Google re-auth doesn't
      // overwrite it (Supabase refreshes avatar_url from the OAuth claim).
      const { error: updateError } = await supabase.auth.updateUser({
        data: { custom_avatar_url: publicUrl },
      });
      if (updateError) throw updateError;

      toast({ title: "Photo updated" });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/builder")} className="gap-2 text-muted-foreground">
              <ArrowLeft size={16} /> Back to Builder
            </Button>
          </div>
          <JobiffyLogo size="md" />
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground hover:text-destructive">
            <LogOut size={16} /> Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10"
        >
          <div className="relative group">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl shadow-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70"
              title="Change photo"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100">
                {avatarUploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground font-space">Your Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Credit Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="relative bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/20 rounded-3xl p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Coins size={16} className="text-primary" />
                  Credit Balance
                </div>
                <motion.div
                  key={balance}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-bold text-foreground font-space"
                >
                  {balance ?? 0}
                </motion.div>
                <p className="text-xs text-muted-foreground mt-2">credits available</p>
              </div>
            </div>

            {/* Credit Costs */}
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap size={14} className="text-primary" /> Credit Costs
              </h3>
              <div className="space-y-3">
                {[
                  { label: "AI Chat Message", cost: CREDIT_COSTS.ai_chat, icon: <MessageSquare size={14} className="text-violet-500" /> },
                  { label: "JD Match Analysis", cost: CREDIT_COSTS.jd_match, icon: <Briefcase size={14} className="text-blue-500" /> },
                  { label: "ATS Score Check", cost: CREDIT_COSTS.ats_check, icon: <Target size={14} className="text-emerald-500" /> },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/30">
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{item.cost} credits</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Top-Up & Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Top-Up Section */}
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2 font-space">
                <Crown size={18} className="text-primary" /> Top Up Credits
              </h3>
              <p className="text-sm text-muted-foreground mb-6">Choose a pack to continue using AI features</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {topUpOptions.map(opt => (
                  <motion.button
                    key={opt.amount}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleTopUp(opt.amount)}
                    disabled={topUpLoading !== null}
                    className={`relative flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-200 ${
                      opt.popular
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5"
                    } disabled:opacity-50`}
                  >
                    {opt.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                    {topUpLoading === opt.amount ? (
                      <Loader2 size={24} className="animate-spin text-primary mb-2" />
                    ) : (
                      <Sparkles size={24} className="text-primary mb-2" />
                    )}
                    <span className="text-2xl font-bold text-foreground font-space">{opt.amount}</span>
                    <span className="text-xs text-muted-foreground">credits</span>
                    <span className="mt-2 text-sm font-semibold text-primary">{opt.price}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 font-space">
                <TrendingUp size={18} className="text-primary" /> Transaction History
              </h3>

              {transactions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Coins size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No transactions yet</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-2">
                    {transactions.map((tx, i) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          tx.amount > 0 ? "bg-primary/10" : "bg-destructive/10"
                        }`}>
                          {featureIcons[tx.feature || "topup"] || <Coins size={14} className="text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span className={`text-sm font-bold ${tx.amount > 0 ? "text-primary" : "text-destructive"}`}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
