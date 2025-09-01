"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function CadastroSimplificadoPage() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'USUARIO'|'ADVOGADO'>('USUARIO');

  const submit = () => {
    if (!name || !email) return;
    const token = `mock-${Date.now()}`
    login(token, { name, email, role })
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro Simplificado (mock)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Nome" value={name} onChange={(e)=>setName(e.target.value)} />
          <Input placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-1">
              <input type="radio" name="role" checked={role==='USUARIO'} onChange={()=>setRole('USUARIO')} /> Usuário
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="role" checked={role==='ADVOGADO'} onChange={()=>setRole('ADVOGADO')} /> Advogado
            </label>
          </div>
          <Button className="w-full" onClick={submit}>Criar e Entrar</Button>
        </CardContent>
      </Card>
    </div>
  )
}

