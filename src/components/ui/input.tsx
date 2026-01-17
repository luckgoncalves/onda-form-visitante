import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 pl-2 pr-0 w-full border rounded-md border-gray-300 focus:border-onda-darkBlue focus:ring-onda-darkBlue bg-transparent py-2 text-sm ring-0 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-slate-950 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-transparent dark:ring-0 dark:placeholder:text-slate-400 dark:focus-visible:ring-0",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
