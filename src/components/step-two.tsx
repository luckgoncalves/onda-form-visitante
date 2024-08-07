import { stepProps } from "@/types/step";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Controller } from "react-hook-form";

export default function StepTwo(props: any) {
    return (
        <section className={`flex mb-4 flex-col gap-4`}>
        <div>
          <label htmlFor="como_nos_conheceu">Como nos conheceu ? </label>
          <Input {...props.register('como_nos_conheceu')} id="como_nos_conheceu" />
        </div>
        <div>
          <label htmlFor="como_chegou_ate_nos">Como chegou até nós ? </label>
          <Input id="como_chegou_ate_nos" {...props.register('como_chegou_ate_nos')} />
        </div>
        <div className="flex flex-col gap-2">
          <h2>Frequenta alguma igreja ?</h2>
          <div className="flex gap-4">
            <Controller 
            control={props.control}
            name="frequenta_igreja"
            render={({ field }) => (
            <RadioGroup onValueChange={field.onChange} className="flex items-center">
                <div className="flex items-center gap-2">
                  <RadioGroupItem  id="church-yes" key={"sim"} value="sim"/>
                  <label htmlFor="church-yes">Sim</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="church-no" key={"nao"} value="nao" />
                  <label htmlFor="church-no">Não</label>
                </div>
            </RadioGroup>
            )}
            />
          </div>
        </div>
        <div>
          <label htmlFor="qual_igreja">Se sim, qual ? </label>
          <Input {...props.register('qual_igreja')} id="qual_igreja"/>
        </div>
        <div>
          <h2>Tem interesse em conhecer:</h2>
          <div className="flex gap-4">
            <FormField 
              control={props.control} 
              name="interesse_em_conhecer" 
              render={({field}) => (
                <FormItem>
                  <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                    id="gp" 
                    checked={field.value?.includes("gp")}
                    onCheckedChange={(checked) => {
                      return checked 
                      ? field.onChange([...field.value, "gp"]) 
                      : field.onChange(field.value.filter((value: string) => value !== "gp"))
                    }} />
                    <label htmlFor="gp">GP</label>
                  </div>
                  </FormControl>
                </FormItem>
              )}/>
              <FormField 
              control={props.control} 
              name="interesse_em_conhecer" 
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2">
                        <Checkbox 
                        id="familiarizando" 
                        checked={field.value?.includes("familiarizando")}
                        onCheckedChange={(checked) => {
                          return checked 
                          ? field.onChange([...field.value, "familiarizando"]) 
                          : field.onChange(field.value.filter((value: string) => value !== "familiarizando"))
                        }} />
                        <label htmlFor="familiarizando">Familiarizando</label>
                    </div>
                    </FormControl>
                </FormItem>
              )}/>
            </div>
        </div>
        <div>
          <label htmlFor="observations">Observações:</label>
          <Textarea {...props.register('observacao')} id="observations" rows={5} />
        </div>
      </section>
    )
}