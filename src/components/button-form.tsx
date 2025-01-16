import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonFormProps extends ButtonHTMLAttributes<HTMLButtonElement>{
    label: string;
}

export default function ButtonForm(props: ButtonFormProps) {
    const { pending } = useFormStatus();
    
    return (
        <Button 
            {...props} 
            disabled={pending || props.disabled}
            className={`bg-[#503387] hover:bg-[#503387]/90 text-white ${props.className}`}
        >
            {props.disabled || pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando
                </>
            ) : (
                props.label
            )}
        </Button>
    );
}