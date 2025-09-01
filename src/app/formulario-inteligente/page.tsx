"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  type: z.enum(["Civil","Trabalhista","Penal","Outro"]).default("Civil"),
  context: z.record(z.any()).optional(),
})

type Values = z.infer<typeof schema>

export default function FormularioInteligentePage() {
  const { toast } = useToast();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", type: "Civil", context: {} }
  })

  const onSubmit = (data: Values) => {
    console.log('mock submit', data)
    toast({ title: 'Caso salvo (mock)', description: 'Formulário inteligente processado.' })
    form.reset({ title: "", description: "", type: "Civil", context: {} })
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Formulário Inteligente (mock)</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="title" render={({field}) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({field}) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl><Textarea {...field} className="min-h-40" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({field}) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full border rounded h-10 px-3 bg-background">
                      <option value="Civil">Civil</option>
                      <option value="Trabalhista">Trabalhista</option>
                      <option value="Penal">Penal</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </FormControl>
                </FormItem>
              )} />

              {form.watch('type') === 'Trabalhista' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name={"context.empregadoOuEmpresa" as any} render={({field}) => (
                    <FormItem>
                      <FormLabel>Você é</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full border rounded h-10 px-3 bg-background">
                          <option value="empregado">Empregado</option>
                          <option value="empresa">Empresa</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={"context.tempoServico" as any} render={({field}) => (
                    <FormItem>
                      <FormLabel>Tempo de serviço (anos)</FormLabel>
                      <FormControl><Input type="number" min={0} step={1} {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              )}

              {form.watch('type') === 'Civil' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name={"context.valorEstimado" as any} render={({field}) => (
                    <FormItem>
                      <FormLabel>Valor estimado (R$)</FormLabel>
                      <FormControl><Input type="number" min={0} step={100} {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={"context.possuiContrato" as any} render={({field}) => (
                    <FormItem>
                      <FormLabel>Existe contrato?</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full border rounded h-10 px-3 bg-background">
                          <option value="nao">Não</option>
                          <option value="sim">Sim</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              )}

              <Button type="submit" className="w-full">Salvar (mock)</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

