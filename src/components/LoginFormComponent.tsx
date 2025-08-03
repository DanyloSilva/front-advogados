
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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "E-mail inválido." })
    .max(50, { message: "E-mail deve ter no máximo 50 caracteres." }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter no mínimo 6 caracteres." })
    .max(50, { message: "Senha deve ter no máximo 50 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginFormComponent() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const payload = {
        email: data.email,
        senha: data.password, 
      };
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), 
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Falha ao fazer login.");
      }
      
      let userRole = result.role; 
      if (result.user && result.user.role) { 
          userRole = result.user.role;
      } else if (result.authorities && result.authorities.length > 0) {
        const authority = result.authorities[0].authority;
        if (authority === "ROLE_USUARIO") userRole = "USUARIO";
        else if (authority === "ROLE_ADVOGADO") userRole = "ADVOGADO";
      }

      if (!userRole) {
        throw new Error("Não foi possível determinar o papel do usuário.");
      }

      const userData = {
        name: result.nome || result.name || (result.user ? result.user.name : "Usuário"), 
        email: result.email || (result.user ? result.user.email : data.email),
        role: userRole,
        oab: result.oab || (result.user ? result.user.oab : undefined), 
      };

      // If user is USUARIO, attempt to create a default case
      if (userData.role === 'USUARIO' && result.token) {
        try {
          const casePayload = {
            titulo: "Nova Causa Automática", // Default title
            descricao: "Causa criada automaticamente após o login.", // Default description
            status: "ABERTA"
          };
          const caseResponse = await fetch(`${API_BASE_URL}/causas`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${result.token}`, // Use the token obtained from login
            },
            body: JSON.stringify(casePayload),
          });

          if (!caseResponse.ok) {
            const caseErrorResult = await caseResponse.json().catch(() => ({ message: "Erro desconhecido ao criar causa." }));
            console.error("Erro ao criar causa automática:", caseErrorResult.message);
            // Optionally, inform the user with a non-blocking toast:
            // toast({
            //   variant: "destructive",
            //   title: "Aviso",
            //   description: "Não foi possível iniciar uma causa padrão automaticamente.",
            // });
          } else {
            console.log("Causa automática criada com sucesso.");
            // Optionally, inform the user:
            // toast({
            //   title: "Causa padrão criada",
            //   description: "Uma nova causa foi iniciada para você no painel.",
            // });
          }
        } catch (caseError) {
          console.error("Erro de rede ou inesperado ao criar causa automática:", (caseError as Error).message);
        }
      }

      login(result.token, userData); // This will handle storing token, user data, and redirecting

      toast({
        title: "Login bem-sucedido!",
        description: `Bem-vindo(a) de volta, ${userData.name}!`,
      });
      // The redirect is handled by the login function in AuthContext

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no login",
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
                    placeholder="Sua senha"
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
          Entrar
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <Link href="/register/user" className="font-medium text-primary hover:underline">
            Registre-se
          </Link>
        </p>
      </form>
    </Form>
  );
}
