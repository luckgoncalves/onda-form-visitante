import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";

export default function StepTwo() {
    return (
        <section className={`flex mb-4 flex-col gap-4`}>
        <div>
          <label htmlFor="howMetUs">Como nos conheceu ? </label>
          <Input name="howMetUs" />
        </div>
        <div>
          <label htmlFor="howGetToUs">Como chegou até nós ? </label>
          <Input id="howGetToUs" name="howGetToUs" />
        </div>
        <div className="flex flex-col gap-2">
          <h2>Frequenta alguma igreja ?</h2>
          <div className="flex gap-4">
            <RadioGroup name="church" className="flex items-center">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="church-yes" className="checked:bg-[#503387] checked:active:bg-[#503387]" value="sim"/>
                  <label htmlFor="church-yes">Sim</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="church-no" value="não" />
                  <label htmlFor="church-no">Não</label>
                </div>
            </RadioGroup>
          </div>
        </div>
        <div>
          <label htmlFor="whatChurch">Se sim, qual ? </label>
          <Input id="whatChurch" name="whatChurch" />
        </div>
        <div>
          <h2>Tem interesse em conhecer:</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
                <Checkbox id="gp" name="interesse" value="gp" />
                <label htmlFor="gp">GP</label>
            </div>
            <div className="flex items-center gap-2">
                <Checkbox id="familiarizando" name="interesse" value="familiarizando" />
                <label htmlFor="familiarizando">Familiarizando</label>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="observations">Observações:</label>
          <Textarea id="observations" rows={5} />
        </div>
      </section>
    )
}