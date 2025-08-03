
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const userRegisterSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nome deve ter no mínimo 3 caracteres." })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres." }),
  email: z
    .string()
    .email({ message: "E-mail inválido." })
    .max(50, { message: "E-mail deve ter no máximo 50 caracteres." }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter no mínimo 6 caracteres." })
    .max(50, { message: "Senha deve ter no máximo 50 caracteres." }),
});

type UserRegisterFormValues = z.infer<typeof userRegisterSchema>;

export function UserRegisterFormComponent() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserRegisterFormValues>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: UserRegisterFormValues) {
    setIsLoading(true);
    try {
      const payload = {
        nome: data.name, // Changed from name to nome
        email: data.email,
        senha: data.password,
        role: "USUARIO",
      };
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Falha ao registrar usuário.");
      }

      toast({
        title: "Registro bem-sucedido!",
        description: "Sua conta de usuário foi criada. Faça login para continuar.",
      });
      router.push("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no registro",
        description: (error as Error).message || "Ocorreu um erro. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" maxLength={50} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="seuemail@exemplo.com" maxLength={50} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                 <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha forte"
                    maxLength={50}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Registrar
        </Button>
         <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </Form>
  );
}
