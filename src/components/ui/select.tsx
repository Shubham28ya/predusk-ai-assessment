import React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-xl border border-border/50 bg-secondary/40 backdrop-blur-xl px-4 py-2 text-sm font-medium shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all hover:bg-secondary/60 hover:shadow-md cursor-pointer",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-4 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none transition-transform group-hover:text-foreground" />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
