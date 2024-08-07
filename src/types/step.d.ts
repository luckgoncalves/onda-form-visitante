import { FieldValues, UseFormProps, UseFormRegister } from "react-hook-form";

export interface stepProps extends UseFormProps<FieldValues> {
    register: UseFormRegister<FieldValues>;
  }