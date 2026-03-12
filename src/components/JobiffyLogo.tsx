import React from "react";

interface JobiffyLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-5xl",
};

export const JobiffyLogo: React.FC<JobiffyLogoProps> = ({ size = "md", className = "" }) => (
  <span className={`font-space font-bold tracking-tight select-none ${sizeMap[size]} ${className}`}>
    <span className="text-foreground">Job</span>
    <span className="text-primary">iffy</span>
  </span>
);
