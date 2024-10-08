import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Controller } from "react-hook-form";
import { formatPhone } from "@/lib/utils";

export default function StepOne(props: any) {
    return (
        <section className={`flex mb-4 flex-col gap-4`}>
            <div>
              <label htmlFor="fullName">Nome completo </label>
              <Input id="fullName" {...props.register("nome")} />
            </div>
            <div className="flex flex-col gap-2">
              <h2>Genêro</h2>
              <Controller
                control={props.control}
                name="genero"
                render={({ field }) => (
                  <RadioGroup {...field} onValueChange={field.onChange} className="flex items-center">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="masculino" className="checked:bg-[#503387] checked:active:bg-[#503387]" value="masculino"/>
                      <label htmlFor="masculino">Masculino</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="femenino" value="femenino" />
                      <label htmlFor="femenino">Femenino</label>
                    </div>
                  </RadioGroup>
                )}
               />
            </div>
            <div>
              <label htmlFor="phone">Telefone</label>
              <Input  
              {...props.register("telefone")}
              onChange={
                (e) => {
                  const mask  = formatPhone(e.target.value);
                  props.setValue("telefone", mask);
                }
              }
               id="phone" type="tel"  />
            </div>
            <div>
              <label htmlFor="idade">Idade</label>
              <Input {...props.register("idade")} id="idade" type="number" pattern="[0-9]*"  inputMode="numeric" accept="number" min={0} />
            </div>
            <div>
              <label htmlFor="bairro">Em que bairro mora ?</label>
              <Input {...props.register('bairro')} id="bairro" type="text" />
            </div>
            <div className="flex flex-col gap-2">
              <h2>Estado cívil ?</h2>
              <div className="flex gap-4">
                <Controller
                control={props.control}
                name="estado_civil"
                render={({field}) => (
                  <RadioGroup {...field} onValueChange={field.onChange} className="flex flex-wrap items-start sm:items-center">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="solteiro" className="checked:bg-[#503387] checked:active:bg-[#503387]" value="solteiro"/>
                      <label htmlFor="solteiro">Solteiro(a)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="casado" value="casado" />
                      <label htmlFor="casado">Casado(a)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="viuvo" value="viuvo" />
                      <label htmlFor="viuvo">Víuvo(a)</label>
                    </div>
                  </RadioGroup>

                )}/>
              </div>
            </div>
          </section>
    )
}