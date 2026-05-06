import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Sun, Moon, LogOut, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          title="Account"
        >
          <User size={16} />
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
