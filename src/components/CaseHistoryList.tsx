"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HistoryCase {
  id: number;
  title: string;
  status: string;
  createdAt?: string;
}

interface Proposal {
  id: number;
  mensagem: string;
  valorSugerido?: number;
  advogado?: { id: number; nome?: string | null } | null;
}

const CaseHistoryList: React.FC = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [cases, setCases] = useState<HistoryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposalCaseId, setProposalCaseId] = useState<number | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/causas/historico`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || "Erro ao buscar histórico.");
        }
        const data = await response.json();
        const processed: HistoryCase[] = data.map((item: any) => ({
          id: item.id,
          title: item.titulo || "Sem título",
          status: item.status || "",
          createdAt: item.dataCriacao || item.createdAt,
        }));
        setCases(processed);
      } catch (err) {
        const msg = (err as Error).message;
        setError(msg);
        toast({ variant: "destructive", title: "Erro", description: msg });
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token, toast]);

  const openProposals = async (caseId: number) => {
    if (!token) return;
    setProposalCaseId(caseId);
    setLoadingProposals(true);
    try {
      const response = await fetch(`${API_BASE_URL}/propostas?causa_id=${caseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Erro ao buscar propostas.");
      }
      const data = await response.json();
      const processed: Proposal[] = data.map((item: any) => ({
        id: item.id,
        mensagem: item.mensagem,
        valorSugerido: item.valorSugerido,
        advogado: item.advogado,
      }));
      setProposals(processed);
    } catch (err) {
      toast({ variant: "destructive", title: "Erro", description: (err as Error).message });
    } finally {
      setLoadingProposals(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString("pt-BR");
    } catch {
      return date;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-center">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 px-1">Título</th>
            <th className="py-2 px-1">Status</th>
            {user?.role === "USUARIO" && <th className="py-2 px-1">Propostas</th>}
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} className="border-b last:border-0">
              <td className="py-2 px-1">{c.title}</td>
              <td className="py-2 px-1">{c.status}</td>
              {user?.role === "USUARIO" && (
                <td className="py-2 px-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => openProposals(c.id)}>
                        Ver Propostas
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Propostas Recebidas</DialogTitle>
                      </DialogHeader>
                      {loadingProposals ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : (
                        <ul className="space-y-4 max-h-60 overflow-y-auto">
                          {proposals.map((p) => (
                            <li key={p.id} className="border-b pb-2">
                              <p className="font-medium">{p.advogado?.nome || `Advogado ${p.id}`}</p>
                              <p className="text-sm mt-1">- <b>{p.mensagem}</b></p>
                              {p.valorSugerido !== undefined && (
                                <p className="text-sm mt-1">Valor da proposta: R$ {p.valorSugerido.toFixed(2)}</p>
                              )}
                            </li>
                          ))}
                          {proposals.length === 0 && <p>Nenhuma proposta enviada.</p>}
                        </ul>
                      )}
                    </DialogContent>
                  </Dialog>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CaseHistoryList;
