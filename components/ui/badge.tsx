import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-500/20 text-brand-300 border border-brand-500/30",
        success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        danger: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
        info: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
        neutral: "bg-surface-400 text-gray-300 border border-surface-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
