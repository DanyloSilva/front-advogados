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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const proposalSchema = z.object({
  message: z
    .string()
    .min(10, { message: "Mensagem deve ter no mínimo 10 caracteres." })
    .max(1000, { message: "Mensagem deve ter no máximo 1000 caracteres." }),
  value: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: "Valor deve ser numérico.",
    }),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

interface ProposalFormComponentProps {
  caseId: number;
  onSubmitted?: () => void;
}

export function ProposalFormComponent({ caseId, onSubmitted }: ProposalFormComponentProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      message: "",
      value: undefined,
    },
  });

  async function onSubmit(data: ProposalFormValues) {
    setIsLoading(true);
    if (!token) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Faça login para enviar proposta.",
      });
      setIsLoading(false);
      return;
    }

    const payload: Record<string, unknown> = {
      causaId: caseId,
      mensagem: data.message,
    };
    if (data.value !== undefined) {
      payload["valorSugerido"] = data.value;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/propostas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Falha ao enviar proposta.");
      }

      toast({
        title: "Proposta enviada!",
        description: "Sua proposta foi registrada com sucesso.",
      });
      form.reset();
      if (onSubmitted) onSubmitted();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar proposta",
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
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva sua proposta de atuação"
                  {...field}
                  className="min-h-[120px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Sugerido (opcional)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Enviar Proposta
        </Button>
      </form>
    </Form>
  );
}

export default ProposalFormComponent;
