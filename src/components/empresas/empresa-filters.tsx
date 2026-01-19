'use client';

import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, X, Loader2, Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { EmpresaContactChannel } from '@/types/empresa';

interface EmpresaFiltersProps {
  availableRamos: string[];
  availableChannels: EmpresaContactChannel[];
  selectedRamos: string[];
  selectedChannels: EmpresaContactChannel[];
  ownerName: string;
  onRamosChange: (next: string[]) => void;
  onChannelsChange: (next: EmpresaContactChannel[]) => void;
  onOwnerNameChange: (value: string) => void;
  onClearAll: () => void;
  isFetchingOptions?: boolean;
  onRefreshFilters?: () => void;
}

const channelLabelMap: Record<EmpresaContactChannel, string> = {
  site: 'Site',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
};

export function EmpresaFilters({
  availableRamos,
  availableChannels,
  selectedRamos,
  selectedChannels,
  ownerName,
  onRamosChange,
  onChannelsChange,
  onOwnerNameChange,
  onClearAll,
  isFetchingOptions = false,
  onRefreshFilters,
}: EmpresaFiltersProps) {
  const [open, setOpen] = useState(false);
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Recarregar filtros quando o Sheet é aberto para pegar novos ramos
    if (isOpen && onRefreshFilters) {
      onRefreshFilters();
    }
  };
  const [ramosPopoverOpen, setRamosPopoverOpen] = useState(false);
  const [ramosSearchValue, setRamosSearchValue] = useState('');
  const ramosDropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ramosDropdownRef.current && !ramosDropdownRef.current.contains(event.target as Node)) {
        setRamosPopoverOpen(false);
        setRamosSearchValue('');
      }
    };

    if (ramosPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ramosPopoverOpen]);

  const handleRamoToggle = (ramo: string) => {
    const exists = selectedRamos.includes(ramo);
    const next = exists
      ? selectedRamos.filter(item => item !== ramo)
      : [...selectedRamos, ramo];
    onRamosChange(next);
  };

  const handleChannelToggle = (channel: EmpresaContactChannel) => {
    const exists = selectedChannels.includes(channel);
    const next = exists
      ? selectedChannels.filter(item => item !== channel)
      : [...selectedChannels, channel];
    onChannelsChange(next);
  };

  const handleOwnerInputChange = (value: string) => {
    onOwnerNameChange(value);
  };

  const handleClear = () => {
    onClearAll();
    setOpen(false);
  };

  const hasActiveFilters =
    selectedRamos.length > 0 ||
    selectedChannels.length > 0 ||
    Boolean(ownerName);

  const activeCount =
    selectedRamos.length +
    selectedChannels.length +
    (ownerName ? 1 : 0);

  return (
    <div className="flex flex-col gap-3">
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto justify-between sm:justify-start gap-2 border-onda-darkBlue/20 hover:bg-onda-darkBlue/10 hover:border-onda-darkBlue/40 text-onda-darkBlue"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-onda-darkBlue text-white">
                {activeCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-6 overflow-y-auto bg-white sm:max-w-md border-l"
        >
          <SheetHeader>
            <SheetTitle>Filtros das empresas</SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3">Ramo de atuação</p>
              {isFetchingOptions ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Carregando opções...
                </div>
              ) : availableRamos.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Cadastre empresas para habilitar esta filtragem.
                </p>
              ) : (
                <div className="relative" ref={ramosDropdownRef}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const willOpen = !ramosPopoverOpen;
                      setRamosPopoverOpen(willOpen);
                      if (willOpen) {
                        setRamosSearchValue('');
                        // Recarregar filtros ao abrir dropdown para pegar novos ramos
                        if (onRefreshFilters) {
                          onRefreshFilters();
                        }
                      }
                    }}
                    className="w-full justify-between bg-white border-gray-300 hover:bg-gray-50 text-left font-normal"
                  >
                    <span className="truncate">
                      {selectedRamos.length > 0
                        ? `${selectedRamos.length} ramo${selectedRamos.length > 1 ? 's' : ''} selecionado${selectedRamos.length > 1 ? 's' : ''}`
                        : 'Selecione os ramos...'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                  {ramosPopoverOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                      <div className="p-2 border-b space-y-2">
                        <Input
                          placeholder="Buscar ramo..."
                          value={ramosSearchValue}
                          onChange={(e) => setRamosSearchValue(e.target.value)}
                          className="w-full"
                          autoFocus
                        />
                        {selectedRamos.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onRamosChange([]);
                            }}
                            className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Limpar tudo
                          </Button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {availableRamos
                          .filter(ramo => 
                            ramo.toLowerCase().includes(ramosSearchValue.toLowerCase())
                          )
                          .length === 0 ? (
                          <div className="p-4 text-sm text-center text-gray-500">
                            Nenhum ramo encontrado.
                          </div>
                        ) : (
                          <div className="p-1">
                            {availableRamos
                              .filter(ramo => 
                                ramo.toLowerCase().includes(ramosSearchValue.toLowerCase())
                              )
                              .map((ramo) => {
                                const isSelected = selectedRamos.includes(ramo);
                                return (
                                  <div
                                    key={ramo}
                                    onClick={() => {
                                      handleRamoToggle(ramo);
                                    }}
                                    className={cn(
                                      "flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-gray-100",
                                      isSelected && "bg-onda-darkBlue/10"
                                    )}
                                  >
                                    <Check
                                      className={cn(
                                        "h-4 w-4",
                                        isSelected ? "opacity-100 text-onda-darkBlue" : "opacity-0"
                                      )}
                                    />
                                    <span>{ramo}</span>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-3">Canais digitais</p>
              {availableChannels.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum canal disponível no momento.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableChannels.map(channel => (
                    <label key={channel} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        id={`channel-${channel}`}
                        checked={selectedChannels.includes(channel)}
                        onCheckedChange={() => handleChannelToggle(channel)}
                      />
                      <span>{channelLabelMap[channel]}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-3">Responsável</p>
              <Input
                value={ownerName}
                onChange={(event) => handleOwnerInputChange(event.target.value)}
                placeholder="Buscar por nome..."
                className="bg-white"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Digite parte do nome do responsável.
              </p>
            </div>
          </div>

          <SheetFooter className="flex flex-col gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={handleClear}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            )}
            <SheetClose asChild>
              <Button className="w-full bg-onda-darkBlue hover:bg-onda-darkBlue/90 text-white">
                Fechar
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedRamos.map(ramo => (
            <Badge
              key={`ramo-${ramo}`}
              variant="secondary"
              className="gap-1 text-xs bg-onda-darkBlue/10 text-onda-darkBlue border-onda-darkBlue/20"
            >
              {ramo}
              <button
                type="button"
                onClick={() => handleRamoToggle(ramo)}
                className="ml-1 hover:opacity-80"
                aria-label={`Remover filtro ${ramo}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {selectedChannels.map(channel => (
            <Badge
              key={`channel-${channel}`}
              variant="secondary"
              className="gap-1 text-xs bg-onda-darkBlue/10 text-onda-darkBlue border-onda-darkBlue/20"
            >
              {channelLabelMap[channel]}
              <button
                type="button"
                onClick={() => handleChannelToggle(channel)}
                className="ml-1 hover:opacity-80"
                aria-label={`Remover filtro ${channelLabelMap[channel]}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {ownerName && (
            <Badge
              key="owner-name"
              variant="secondary"
              className="gap-1 text-xs bg-onda-darkBlue/10 text-onda-darkBlue border-onda-darkBlue/20"
            >
              Responsável: {ownerName}
              <button
                type="button"
                onClick={() => onOwnerNameChange('')}
                className="ml-1 hover:opacity-80"
                aria-label="Remover filtro de responsável"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

