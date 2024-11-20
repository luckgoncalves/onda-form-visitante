import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { formatPhone } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Label } from "./ui/label";
import { useEffect } from "react";

export default function StepOne({ form }: any) {

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);

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
              <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
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
              <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
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
        name="bairro"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="bairro">Em que bairro mora?</Label>
            <FormControl>
              <Input id="bairro" type="text" {...field} />
            </FormControl>
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
