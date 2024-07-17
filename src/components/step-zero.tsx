import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

export default function StepZero() {
    return (
        <section className={`flex mb-4 flex-col gap-4`}>
            <h2>Culto</h2>
            <div className="flex  gap-4">
                <RadioGroup name="culto" className="flex flex-col sm:flex-row imtems-start sm:items-center">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="sabado" className="checked:bg-[#503387] checked:active:bg-[#503387]" value="sabado"/>
                    <label htmlFor="sabado">Sábado</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="domingo-m" value="domingo-m" />
                    <label htmlFor="domingo-m">Domingo manhã</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="domingo-n" value="domingo-n" />
                    <label htmlFor="domingo-n">Domingo noite</label>
                  </div>
                </RadioGroup>
            </div>
          </section>
    )
}