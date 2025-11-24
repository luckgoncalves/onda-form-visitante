'use client';

import { useState } from 'react';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
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
}: EmpresaFiltersProps) {
  const [open, setOpen] = useState(false);

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
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto justify-between sm:justify-start gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1">
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
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {availableRamos.map(ramo => (
                    <label key={ramo} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        id={`ramo-${ramo}`}
                        checked={selectedRamos.includes(ramo)}
                        onCheckedChange={() => handleRamoToggle(ramo)}
                      />
                      <span className="truncate">{ramo}</span>
                    </label>
                  ))}
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
              <Button className="w-full">
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
              className="gap-1 text-xs"
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
              className="gap-1 text-xs"
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
              className="gap-1 text-xs"
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

