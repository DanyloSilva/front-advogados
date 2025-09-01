"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/config/api";

type Item = { id:number; causaId:number; mensagem:string; valorSugerido?:number|null; status:string }

export default function MinhasPropostasPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const resp = await fetch(`${API_BASE_URL}/propostas/minhas`, { headers: { Authorization: `Bearer ${token}` } })
        if (!resp.ok) throw new Error('Falha ao carregar do backend')
        const data = await resp.json()
        setItems(data)
      } catch (e) {
        // fallback mock
        setError('Mostrando dados mockados')
        setItems([
          { id:1, causaId:101, mensagem:'Posso ajudar, já atuei no tema.', valorSugerido:500, status:'ENVIADA' },
          { id:2, causaId:102, mensagem:'Proponho acordo inicial.', valorSugerido:350, status:'ENVIADA' },
        ])
      }
    }
    load()
  }, [token])

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Minhas Propostas</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-xs text-muted-foreground mb-2">{error}</div>}
          <ul className="space-y-3">
            {items.map(p => (
              <li key={p.id} className="border rounded p-3">
                <div className="text-sm">Causa #{p.causaId} • <span className="font-medium">{p.status}</span></div>
                <div className="text-sm">{p.mensagem}</div>
                {typeof p.valorSugerido === 'number' && <div className="text-sm">Valor: R$ {p.valorSugerido.toFixed(2)}</div>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

