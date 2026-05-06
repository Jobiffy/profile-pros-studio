import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, LogOut, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface BuilderProfileMenuProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onSignOut: () => void | Promise<void>;
}

// Compact profile menu for the /builder toolbar. Folds the standalone
// theme toggle and "Profile" button into one entry point and surfaces
// Sign Out, which had no UI on this page.
export const BuilderProfileMenu: React.FC<BuilderProfileMenuProps> = ({
  darkMode,
  onToggleTheme,
  onSignOut,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Precedence: user upload first (sticky across re-auth), then OAuth
  // claims. avatar_url is what Supabase populates from Google, picture is
  // a legacy fallback some providers used.
  const avatarUrl =
    user?.user_metadata?.custom_avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  const email = user?.email || "";
  const fullName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const initials =
    (fullName || email)
      .split(/[\s@]/)
      .filter(Boolean)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          title="Account"
        >
          <Avatar className="h-8 w-8 border border-border/60 hover:border-primary/40 transition-colors">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile" /> : null}
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-[11px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-48">
        <DropdownMenuItem onSelect={onToggleTheme} className="gap-2 cursor-pointer">
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          <span>{darkMode ? "Light mode" : "Dark mode"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => navigate("/profile")}
          className="gap-2 cursor-pointer"
        >
          <UserCircle size={14} />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => { void onSignOut(); }}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
