"use client";

import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CaseHistoryList from '@/components/CaseHistoryList';
import { Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CaseHistoryPage() {
  const { user, isLoading, isAuthenticated } = useAuthRedirect({ requiredAuth: true });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen-content p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen-content p-6 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">Erro ao carregar dados</h1>
        <Button asChild>
          <Link href="/login">Ir para Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 min-h-screen-content">
      <Card className="mb-8 shadow-card-modern bg-card rounded-xl border-l-4 border-primary/30">
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="text-2xl md:text-3xl font-headline text-primary">Histórico de Causas</CardTitle>
        </CardHeader>
        <CardContent>
          <CaseHistoryList />
        </CardContent>
      </Card>
    </div>
  );
}
