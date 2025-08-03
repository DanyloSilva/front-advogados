
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import CaseCard, { type Case } from '@/components/CaseCard';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, SearchX, Search, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';

interface CaseListProps {
}

// Interface for the raw data structure from the API
interface ApiCase {
  id: number;
  titulo?: string | null;
  descricao?: string | null;
  usuario?: {
    id: number;
    nome?: string | null;
  } | null;
  dataCriacao?: string | null;
  createdAt?: string | null; // To handle if API sends createdAt directly
  // Add other fields if the API sends more that might be relevant
}


const CaseList: React.FC<CaseListProps> = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCases = async () => {
      if (!token) {
        setError("Autenticação necessária para visualizar os casos.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/causas`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erro ao buscar casos: ${response.statusText}`);
        }
        const rawData: ApiCase[] = await response.json();

        const processedData: Case[] = rawData.map(item => ({
          id: item.id,
          title: item.titulo || "Título não fornecido",
          description: item.descricao || "Descrição não fornecida",
          usuario: item.usuario ? {
            id: item.usuario.id,
            name: item.usuario.nome || "Usuário Anônimo"
          } : undefined,
          createdAt: item.dataCriacao || item.createdAt || undefined,
        }));
        setCases(processedData);
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Erro ao carregar casos",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [token, toast]);

  const handleViewDetails = (caseId: number) => {
    toast({ title: "Funcionalidade em Desenvolvimento", description: `Detalhes do caso ID ${caseId} serão exibidos em breve.`});
  };

  const filteredCases = cases.filter(caseItem =>
    // title and description are now guaranteed to be strings by processedData
    caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Carregando casos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto my-10 bg-destructive/5 rounded-lg border-destructive/50 p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <AlertTitle className="text-lg font-semibold">Erro ao carregar os casos</AlertTitle>
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-card rounded-xl shadow-card-modern">
        <div className="relative w-full sm:max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por título ou descrição do caso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 text-sm h-11"
            aria-label="Buscar casos"
            maxLength={50}
          />
        </div>
        {searchTerm && (
          <Button onClick={() => setSearchTerm('')} variant="outline" className="text-sm shrink-0 h-11">
            <RotateCcw className="mr-2 h-4 w-4"/> Limpar Busca
          </Button>
        )}
      </div>

      {filteredCases.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl shadow-card-modern">
          <SearchX className="h-20 w-20 text-primary/50 mx-auto mb-6" />
          <p className="text-2xl font-semibold text-muted-foreground">
            {cases.length > 0 && searchTerm ? 'Nenhum caso encontrado com sua busca.' : 'Nenhum caso disponível no momento.'}
          </p>
          {cases.length === 0 && !searchTerm && <p className="text-sm text-muted-foreground mt-2">Volte mais tarde para verificar novos casos ou atualize a página.</p>}
          {cases.length > 0 && searchTerm && <p className="text-sm text-muted-foreground mt-2">Tente palavras-chave diferentes ou limpe a busca.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {filteredCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseData={caseItem}
              onViewDetails={handleViewDetails}
              allowProposal
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseList;
