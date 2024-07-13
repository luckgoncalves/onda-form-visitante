'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Home() {
  const [step, setStep ] = useState(0);
  return (
    <main className="flex w-full flex-1 flex-col items-center justify-between gap-4 p-4">
      <h1>Formulário de visitantes</h1>
      <Card className="p-4 w-full">
        <form>
          <section className={`flex mb-4 flex-col gap-4 ${step === 0 ? "block" : "hidden"}`}>
            <h2>Culto</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Input id="sabado" name="culto" type="radio" className="w-3" />
                <label htmlFor="sabado">Sábado</label>
              </div>
              <div className="flex items-center gap-2">
                <Input id="domingo-m" name="culto" type="radio" className="w-3" />
                <label htmlFor="domingo-m">Domingo manhã</label>
              </div>
              <div className="flex items-center gap-2">
                <Input id="domingo-n" name="culto" type="radio" className="w-3" />
                <label htmlFor="domingo-n">Domingo noite</label>
              </div>
            </div>
          </section>
          <section className={`flex mb-4 flex-col gap-4 ${step === 1 ? "block" : "hidden"}`}>
            <div>
              <label>Nome completo </label>
              <Input name="name" />
            </div>
            <div>
              <h2 >Genêro</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Input type="radio" className="w-3" name="genero" />
                  <label>Masculino</label>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="radio" className="w-3" name="genero" />
                  <label>Femenino</label>
                </div>

              </div>
            </div>
            <div>
              <label>Telefone</label>
              <Input type="tel"  />
            </div>
            <div>
              <label>Idade</label>
              <Input type="number" min={0} />
            </div>
            <div>
              <label>Em que bairro mora ?</label>
              <Input type="text" />
            </div>
            <div>
              <h2>Estado cívil ?</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Input type="radio" className="w-3" name="estadoCivil" />
                  <label>Solteiro (a)</label>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="radio" className="w-3" name="estadoCivil" />
                  <label>Casado (a)</label>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="radio" className="w-3" name="estadoCivil" />
                  <label>Víuvo (a)</label>
                </div>
              </div>
            </div>
          </section>
          <section className={`flex flex-col mb-4 gap-4 ${step === 2 ? "block" : "hidden"}`}>
            <div>
              <label>Como chegou até nós ?</label>
              <Input  type="text"/>
            </div>
            <div>
              <h2>Frequenta alguma igreja ?</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Input className="w-3" type="radio"/>
                  <label>Sim</label>
                </div>
                <div className="flex items-center gap-2">
                  <Input className="w-3" type="radio"/>
                  <label>Não</label>
                </div>
              </div>
              <div>
                <label htmlFor="">Se sim, qual ?</label>
                <Input type="text" />
              </div>
            </div>
            <div>
              <h2 >Tem interesse em conhecer</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Input className="w-3" type="checkbox" />
                  <label>GP</label>
                </div>
                <div className="flex items-center gap-2">
                  <Input className="w-3" type="checkbox" />
                  <label>Familiarizando</label>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="">Observação</label>
              <Input type="text" />
            </div>
          </section>
          {step === 2 && (
            <Button type="submit">Enviar</Button>
          )}
          {step < 2 && (
          <Button type="button" onClick={() => setStep(step + 1)}>Próximo</Button>
          )}
        </form>
      </Card>
    </main>
  );
}
