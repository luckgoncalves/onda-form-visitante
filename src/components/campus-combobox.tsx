'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FormLabel } from '@/components/ui/form';

export type CampusOption = {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
};

interface CampusComboboxProps {
  options: CampusOption[];
  value: string;
  onChange: (campusId: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function CampusCombobox({
  options,
  value,
  onChange,
  placeholder = 'Selecione um campus',
  label = 'Campus',
  disabled = false,
  required = false,
  className,
}: CampusComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCampus = options.find((c) => c.id === value);
  const displayValue = selectedCampus
    ? `${selectedCampus.nome} - ${selectedCampus.cidade}/${selectedCampus.estado}`
    : '';

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <FormLabel>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </FormLabel>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || options.length === 0}
            className={cn(
              'w-full justify-between font-normal h-10',
              !displayValue && 'text-muted-foreground'
            )}
          >
            {displayValue || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar campus..." />
            <CommandList>
              <CommandEmpty>Nenhum campus encontrado.</CommandEmpty>
              <CommandGroup>
                {options.map((campus) => (
                  <CommandItem
                    key={campus.id}
                    value={`${campus.nome} ${campus.cidade} ${campus.estado}`}
                    onSelect={() => {
                      onChange(campus.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === campus.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {campus.nome} - {campus.cidade}/{campus.estado}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
