'use client';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Form, FormField, FormLabel } from "@/components/ui/form";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { save } from "./actions";
import ButtonForm from "@/components/button-form";
import { Input } from "@/components/ui/input";
import { redirect, useRouter } from "next/navigation";


export default function Home() {
  const form = useForm();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  const submitAction = form.handleSubmit(async (formData) => {
    console.log('formData',formData);
    router.push('/list');
  });
  return (
    <main className="flex w-full h-[100%]  min-h-screen flex-col  items-center gap-4 p-4">
      <Card className="p-4 w-full backdrop-blur-sm bg-white/30 mt-10 border-none card-glass">
      <CardHeader className="text-center">
        <h1 className="text-3xl">Você deseja:</h1></CardHeader>
      <CardContent>
        {showLogin && (
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={submitAction}>
            <FormLabel>Username:</FormLabel>
            <FormField 
              control={form.control} 
              name="username" 
              render={({ field }) => <Input {...field} />} />

            <FormLabel>Password:</FormLabel>
            <FormField 
              control={form.control} 
              name="password"
              render={({ field }) => <Input type="password" {...field} />} />
            
            <ButtonForm type="submit" label="Entrar" />
          </form>
        </Form>
        )}
      </CardContent>
      <CardFooter className="w-full">
        <div className="flex flex-wrap md:flex-nowrap gap-4 w-full">
          <ButtonForm type="button" className="w-full md:w-1/2 text-balance bg-transparent border-2 border-[#503387] text-[#503387] hover:bg-[#503387]/90 hover:text-white" onClick={() => router.push('/register')} label="Cadastrar novo Visitante" />
          {!showLogin && <ButtonForm className="w-full md:w-1/2" type="button" onClick={() => setShowLogin(true)} label="Entrar" />}
        </div>
      </CardFooter>
      </Card>
    </main>
  );
}
