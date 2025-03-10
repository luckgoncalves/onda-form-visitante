import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Label } from "./ui/label";
import { useEffect } from "react";

export default function StepTwo({ form }: any) {
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    
    return (
        <section className={`flex mb-4 flex-col gap-4`}>
        <FormField
            control={form.control}
            name="como_nos_conheceu"
            render={({ field, fieldState }) => (
              <FormItem>
                <Label htmlFor="como_nos_conheceu">Como nos conheceu?</Label>
                <FormControl>
                  <Input id="como_nos_conheceu" {...field} />
                </FormControl>
                {fieldState.error && (
                  <p className="text-red-500 text-base mt-1">{fieldState.error.message}</p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="como_chegou_ate_nos"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="como_chegou_ate_nos">Como chegou até nós?</Label>
                <FormControl>
                  <Input id="como_chegou_ate_nos" defaultValue={""} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequenta_igreja"
            render={({ field }) => (
              <FormItem>
                <Label>Frequenta alguma igreja?</Label>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem id="church-yes" value="sim" />
                      </FormControl>
                      <Label htmlFor="church-yes">Sim</Label>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem id="church-no" value="não" />
                      </FormControl>
                      <Label htmlFor="church-no">Não</Label>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="qual_igreja"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="qual_igreja">Se sim, qual?</Label>
                <FormControl>
                  <Input id="qual_igreja" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interesse_em_conhecer"
            render={({ field }) => (
              <FormItem>
                <Label>Tem interesse em conhecer:</Label>
                <FormControl>
                  <div className="flex gap-4">
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          id="gp"
                          checked={field.value?.includes("gp")}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, "gp"])
                              : field.onChange(field.value.filter((value: string) => value !== "gp"))
                          }}
                        />
                      </FormControl>
                      <Label htmlFor="gp">GP</Label>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          id="familiarizando"
                          checked={field.value?.includes("familiarizando")}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, "familiarizando"])
                              : field.onChange(field.value.filter((value: string) => value !== "familiarizando"))
                          }}
                        />
                      </FormControl>
                      <Label htmlFor="familiarizando">Familiarizando</Label>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          id="nao_tem_interesse"
                          checked={field.value?.includes("nao_tem_interesse")}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, "nao_tem_interesse"])
                              : field.onChange(field.value.filter((value: string) => value !== "nao_tem_interesse"))
                          }}
                        />
                      </FormControl>
                      <Label htmlFor="nao_tem_interesse">Não tem interesse</Label>
                    </FormItem>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observacao"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="observations">Observações:</Label>
                <FormControl>
                  <Textarea id="observations" rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>
    )
}
