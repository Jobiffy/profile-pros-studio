import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { JobiffyLogo } from "@/components/JobiffyLogo";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/builder");
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
      });
      if (error) {
        toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
        setLoading(false);
      }
      // On success the browser navigates away; loading stays true until unmount.
    } catch (e) {
      toast({ title: "Sign in failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setMagicLinkSent(true);
      }
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      {/* Ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl shadow-primary/5">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <JobiffyLogo size="lg" className="mb-4" />
            <h1 className="text-2xl font-bold text-foreground font-space">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to craft your perfect resume
            </p>
          </div>

          <AnimatePresence mode="wait">
            {magicLinkSent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Check your email</h3>
                <p className="text-muted-foreground text-sm">
                  We sent a magic link to <span className="font-medium text-foreground">{email}</span>
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 text-primary"
                  onClick={() => setMagicLinkSent(false)}
                >
                  Use a different email
                </Button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Google Sign In */}
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xl mb-4 text-base transition-all duration-200 hover:shadow-lg"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Continue with Google
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Email Magic Link */}
                <form onSubmit={handleMagicLink} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Send magic link
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-6">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Button variant="link" onClick={() => navigate("/")} className="text-muted-foreground text-sm">
            ← Back to home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
