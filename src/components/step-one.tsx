import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { formatPhone } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { getBairrosCuritiba } from "@/app/actions";
import { getEstados, getCidadesPorNomeEstado, Estado, Cidade } from "@/lib/dados-brasil";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { CommandList } from "cmdk";

interface Bairro {
  id: string;
  nome: string;
}

export default function StepOne({ form }: any) {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [openEstado, setOpenEstado] = useState(false);
  const [openCidade, setOpenCidade] = useState(false);
  const [openBairro, setOpenBairro] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null);
  const [selectedCidade, setSelectedCidade] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Carregar estados dos dados locais
    const estadosLocais = getEstados();
    setEstados(estadosLocais);
    
    // Definir valores padrão para Paraná e Curitiba
    const parana = estadosLocais.find(estado => estado.nome === 'Paraná');
    if (parana) {
      setSelectedEstado(parana);
      form.setValue('estado', parana.nome);
      form.setValue('cidade', 'Curitiba');
      setSelectedCidade('Curitiba');
    }
  }, [form]);

  useEffect(() => {
    if (selectedEstado?.nome) {
      // Carregar cidades do estado selecionado dos dados locais
      const cidadesLocais = getCidadesPorNomeEstado(selectedEstado.nome);
      setCidades(cidadesLocais);
    }
  }, [selectedEstado]);

  useEffect(() => {
    if (selectedCidade?.toLowerCase() === 'curitiba') {
      // Carregar bairros de Curitiba
      getBairrosCuritiba().then((data) => {
        setBairros(data);
      });
    } else {
      setBairros([]);
      // Limpar o valor do bairro quando mudar de cidade
      form.setValue('bairro', '');
    }
  }, [selectedCidade, form]);

  return (
    <section className={`flex mb-4 flex-col gap-4`}>
      <FormField
        control={form.control}
        name="nome"
        render={({ field, fieldState }) => (
          <div>
            <Label htmlFor="fullName">Nome completo</Label>
            <FormControl>
              <Input id="fullName" {...field} />
            </FormControl>
            {fieldState.error && (
              <p className="text-red-500 text-base mt-1">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />

      <FormField
        control={form.control}
        name="genero"
        render={({ field, fieldState }) => (
          <FormItem>
            <Label>Gênero</Label>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex items-center"
              >
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem id="masculino" value="masculino" />
                  <label htmlFor="masculino">Masculino</label>
                </div>
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem id="feminino" value="feminino" />
                  <label htmlFor="feminino">Feminino</label>
                </div>
              </RadioGroup>
            </FormControl>
            {fieldState.error && (
              <p className="text-red-500 text-base mt-1">{fieldState.error.message}</p>
            )}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="phone">Telefone</Label>
            <FormControl>
              <Input
                id="phone"
                type="tel"
                {...field}
                onChange={(e) => {
                  const mask = formatPhone(e.target.value);
                  field.onChange(mask);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="idade"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="idade">Idade</Label>
            <FormControl>
              <Input id="idade" type="number" pattern="[0-9]*" inputMode="numeric" accept="number" min={0} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estado"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <Label>Estado</Label>
            <Popover open={openEstado} onOpenChange={setOpenEstado}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openEstado}
                    className="justify-between"
                  >
                    {field.value
                      ? estados.find((estado) => estado.nome === field.value)?.nome
                      : "Selecione um estado"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Buscar estado..." />
                  <CommandList>
                  <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {estados.map((estado) => (
                      <CommandItem
                        key={estado.id}
                        value={estado.nome}
                        onSelect={() => {
                          field.onChange(estado.nome);
                          setSelectedEstado(estado);
                          setOpenEstado(false);
                          form.setValue('cidade', '');
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === estado.sigla ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {estado.nome}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cidade"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <Label>Cidade</Label>
            <Popover open={openCidade} onOpenChange={setOpenCidade}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCidade}
                    className="justify-between"
                    disabled={!selectedEstado}
                  >
                    {field.value
                      ? cidades.find((cidade) => cidade.nome === field.value)?.nome
                      : "Selecione uma cidade"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Buscar cidade..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {cidades.map((cidade) => (
                        <CommandItem
                          key={cidade.nome}
                          value={cidade.nome}
                          onSelect={() => {
                            field.onChange(cidade.nome);
                            setSelectedCidade(cidade.nome);
                            setOpenCidade(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === cidade.nome ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {cidade.nome}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bairro"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <Label>Bairro</Label>
            {selectedCidade?.toLowerCase() === 'curitiba' ? (
              <Popover open={openBairro} onOpenChange={setOpenBairro}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openBairro}
                      className="justify-between"
                    >
                      {field.value
                        ? bairros.find((bairro) => bairro.nome === field.value)?.nome
                        : "Selecione um bairro"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Buscar bairro..." />
                    <CommandList>
                      <CommandEmpty>Nenhum bairro encontrado.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-auto">
                        {bairros.map((bairro) => (
                          <CommandItem
                            key={bairro.id}
                            value={bairro.nome}
                            onSelect={() => {
                              field.onChange(bairro.nome);
                              setOpenBairro(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === bairro.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {bairro.nome}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <FormControl>
                <Input 
                  placeholder="Digite o nome do bairro"
                  {...field}
                  disabled={!selectedCidade}
                />
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estado_civil"
        render={({ field }) => (
          <FormItem>
            <Label>Estado civil</Label>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap items-start sm:items-center"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem id="solteiro" value="solteiro" />
                  </FormControl>
                  <Label htmlFor="solteiro">Solteiro(a)</Label>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem id="casado" value="casado" />
                  </FormControl>
                  <Label htmlFor="casado">Casado(a)</Label>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem id="viuvo" value="viuvo" />
                  </FormControl>
                  <Label htmlFor="viuvo">Viúvo(a)</Label>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  )
}
