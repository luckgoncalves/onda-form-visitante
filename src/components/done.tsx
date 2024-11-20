import ButtonForm from "./button-form";
import { useEffect } from "react";

export default function Done() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="flex w-full h-[100%]  min-h-screen flex-col  items-center gap-4 p-4">
            <h1>Ficha concluída com sucesso</h1>
            <ButtonForm type="button" onClick={() => window.location.reload()} label="Novo Visitante" />
        </div>
    );
}