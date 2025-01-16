import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { FormControl, FormField, FormItem } from "./ui/form";
import { useEffect } from "react";

export default function StepZero({ form }: any) {
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  return (
    <section className={`flex mb-4 flex-col gap-4`}>
      <h2>Culto</h2>
      <FormField
        control={form.control}
        name="culto"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col sm:flex-row items-start sm:items-center"
              >
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem id="sabado" value="sabado" />
                  <label htmlFor="sabado">Sábado</label>
                </div>
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem id="domingo-m" value="domingo-manha" />
                  <label htmlFor="domingo-m">Domingo manhã</label>
                </div>
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem id="domingo-n" value="domingo-noite" />
                  <label htmlFor="domingo-n">Domingo noite</label>
                </div>
              </RadioGroup>
            </FormControl>
            {fieldState.error && (
              <p className="text-red-500 text-base mt-1">{fieldState.error.message}</p>
            )}
          </FormItem>
        )}
      />
    </section>
  )
}
