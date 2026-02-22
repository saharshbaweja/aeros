import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-50 text-brand-600 border border-brand-200",
        success: "bg-emerald-50 text-emerald-600 border border-emerald-200",
        warning: "bg-amber-50 text-amber-600 border border-amber-200",
        danger: "bg-rose-50 text-rose-600 border border-rose-200",
        info: "bg-sky-50 text-sky-600 border border-sky-200",
        neutral: "bg-slate-100 text-slate-600 border border-slate-200",
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
