"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { processPayment, type PaymentMethod } from "@/lib/mockApi";
import { Loader2 } from "lucide-react";

interface PaymentCheckoutProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  amount: number;
  onSuccess: (result: any) => void;
}

export default function PaymentCheckout({ open, onOpenChange, amount, onSuccess }: PaymentCheckoutProps) {
  const [method, setMethod] = useState<PaymentMethod>('cartao')
  const [name, setName] = useState("")
  const [number, setNumber] = useState("")
  const [exp, setExp] = useState("")
  const [cvc, setCvc] = useState("")
  const [cpf, setCpf] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  const formatted = useMemo(() => amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), [amount])

  const submit = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await processPayment({ method, amount, card: method==='cartao' ? { name, number, exp, cvc } : undefined })
      setResult(res)
      onSuccess(res)
    } catch (e:any) {
      setError(e.message || 'Falha no pagamento (mock)')
    } finally {
      setLoading(false)
    }
  }

  const resetAndClose = () => {
    setResult(null); setError(null); setLoading(false); setName(""); setNumber(""); setExp(""); setCvc(""); setCpf(""); setMethod('cartao'); onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkout de Pagamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm">Total a pagar: <b>{formatted}</b></div>

          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="method" checked={method==='cartao'} onChange={()=>setMethod('cartao')} /> Cartão
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="method" checked={method==='boleto'} onChange={()=>setMethod('boleto')} /> Boleto
            </label>
          </div>

          {method === 'cartao' ? (
            <div className="space-y-2">
              <Input placeholder="Nome no cartão" value={name} onChange={e=>setName(e.target.value)} />
              <Input placeholder="Número do cartão" value={number} onChange={e=>setNumber(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Validade (MM/AA)" value={exp} onChange={e=>setExp(e.target.value)} />
                <Input placeholder="CVC" value={cvc} onChange={e=>setCvc(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Input placeholder="Nome completo" value={name} onChange={e=>setName(e.target.value)} />
              <Input placeholder="CPF (opcional)" value={cpf} onChange={e=>setCpf(e.target.value)} />
            </div>
          )}

          {error && <div className="text-sm text-destructive">{error}</div>}

          {!result ? (
            <Button className="w-full" onClick={submit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Confirmar Pagamento (mock)
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="text-sm">
                Sucesso! Transação: <b>{result.transactionId}</b>
              </div>
              {result.method === 'boleto' && (
                <div className="text-xs break-all bg-muted p-2 rounded">
                  Código do boleto: {result.boleto.code}
                </div>
              )}
              <Button className="w-full" onClick={resetAndClose}>Concluir</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

