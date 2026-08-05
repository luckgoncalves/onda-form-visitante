"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date | null;
  setDate: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ date = null, setDate, placeholder = "Selecione uma data", className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      {/* Renderiza sem Portal para evitar conflito com o Sheet (Dialog) no mobile */}
      <PopoverPrimitive.Content
        align="start"
        sideOffset={4}
        className={cn(
          "z-50 w-auto rounded-md border border-slate-200 bg-white p-0 text-slate-950 shadow-md outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        )}
      >
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={(selectedDate: Date | undefined) => setDate(selectedDate ?? null)}
          initialFocus
        />
      </PopoverPrimitive.Content>
    </Popover>
  )
}
