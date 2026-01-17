'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Buscar...",
  className = "w-full max-w-xl"
}: SearchInputProps) {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={`relative mb-6 ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 bg-white border rounded-md border-gray-300 focus:border-onda-darkBlue focus:ring-onda-darkBlue w-full"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-onda-darkBlue" size={20} />
    </div>
  );
} 