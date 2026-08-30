import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-slate-950 text-white shadow-sm hover:bg-slate-800 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400",
        secondary:
          "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-950 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white",
        accent:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400",
        danger: "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-400/10 dark:text-rose-300 dark:hover:bg-rose-400/20",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
