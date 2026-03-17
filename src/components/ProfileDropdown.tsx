import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Coins, LogOut, FileText, User, Mail, Phone, Edit2, Check, X, ArrowRight,
} from "lucide-react";

export const ProfileDropdown: React.FC = () => {
  const { user, signOut } = useAuth();
  const credits = useCredits();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const balance = credits.balance;
  const loading = credits.loading;
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.name || ""
  );
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "");

  if (!user) return null;

  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;
  const email = user.email || "";
  const initials =
    (user.user_metadata?.full_name || user.user_metadata?.name || email)
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <Avatar className="h-10 w-10 border-2 border-primary/30 group-hover:border-primary transition-colors duration-200 shadow-md shadow-primary/10">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Profile" />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Online dot */}
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-[360px] p-0 rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/5 overflow-hidden"
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Profile header */}
            <div className="relative bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-6 pb-5">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-6 -mt-6 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-lg">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile" /> : null}
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <div className="space-y-1.5">
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="h-8 text-sm"
                      />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number"
                        className="h-8 text-sm"
                      />
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditing(false)}>
                          <X size={14} />
                        </Button>
                        <Button size="sm" className="h-7 px-3 text-xs" onClick={() => setEditing(false)}>
                          <Check size={14} className="mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground truncate text-sm">
                          {displayName || "Set your name"}
                        </h3>
                        <button
                          onClick={() => setEditing(true)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Mail size={11} />
                        <span className="truncate">{email}</span>
                      </div>
                      {phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Phone size={11} />
                          <span>{phone}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Credits */}
            <div className="px-5 py-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Coins size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Credits Remaining</p>
                    <p className="text-lg font-bold text-foreground font-space">
                      {loading ? "..." : (balance ?? 0)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs border-primary/30 hover:bg-primary/5 hover:border-primary"
                  onClick={() => { setOpen(false); navigate("/profile"); }}
                >
                  Top Up
                </Button>
              </div>
            </div>

            {/* Default Resume */}
            <div className="px-5 py-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                    <FileText size={16} className="text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Default Resume</p>
                    <p className="text-sm font-medium text-foreground">No resume uploaded</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => { setOpen(false); navigate("/builder"); }}
                >
                  Build
                  <ArrowRight size={12} className="ml-1" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 space-y-1">
              <button
                onClick={() => { setOpen(false); navigate("/profile"); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                <User size={16} className="text-muted-foreground" />
                Manage Profile & Credits
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
};
