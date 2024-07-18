import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

export default function StepOne() {
    return (
        <section className={`flex mb-4 flex-col gap-4`}>
            <div>
              <label htmlFor="fullName">Nome completo </label>
              <Input id="fullName" name="fullName" />
            </div>
            <div className="flex flex-col gap-2">
              <h2>Genêro</h2>
              <RadioGroup name="genero" className="flex items-center">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="masculino" className="checked:bg-[#503387] checked:active:bg-[#503387]" value="masculino"/>
                  <label htmlFor="masculino">Masculino</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="femenino" value="femenino" />
                  <label htmlFor="femenino">Femenino</label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <label htmlFor="phone">Telefone</label>
              <Input id="phone" type="tel"  />
            </div>
            <div>
              <label htmlFor="idade">Idade</label>
              <Input id="idade" type="number" pattern="[0-9]*"  inputMode="numeric" accept="number" min={0} />
            </div>
            <div>
              <label htmlFor="bairro">Em que bairro mora ?</label>
              <Input id="bairro" type="text" />
            </div>
            <div className="flex flex-col gap-2">
              <h2>Estado cívil ?</h2>
              <div className="flex gap-4">
              <RadioGroup name="estadoCivil" className="flex flex-wrap items-start sm:items-center">
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
              </div>
            </div>
          </section>
    )
}