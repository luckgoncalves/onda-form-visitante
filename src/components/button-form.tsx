import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { ButtonHTMLAttributes } from "react";

interface ButtonFormProps extends ButtonHTMLAttributes<HTMLButtonElement>{
    label: string;
}
export default function ButtonForm(props: ButtonFormProps) {
    const {pending} = useFormStatus();
    return (
        <Button {...props } disabled={pending} className={`bg-[#503387] hover:bg-[#503387]/90 text-white ${props.className}`}>{props.label}</Button>
    );
}