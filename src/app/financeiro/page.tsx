"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFinancialStats } from "@/lib/mockApi";
import { useAuth } from "@/contexts/AuthContext";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function FinanceiroPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{months:string[]; values:number[]} | null>(null);

  useEffect(() => {
    getFinancialStats(user?.role || 'ADVOGADO').then(setData);
  }, [user?.role]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Financeiro (mock)</CardTitle>
        </CardHeader>
        <CardContent>
          {!data ? (
            <div>Carregando...</div>
          ) : (
            <ChartContainer
              config={{}}
              className="min-h-[220px] w-full"
            >
              <svg viewBox="0 0 100 30" className="w-full h-56">
                {data.values.map((v, i) => {
                  const x = (i / (data.values.length - 1)) * 100;
                  const y = 30 - (v / Math.max(...data.values)) * 28 - 1;
                  return <circle key={i} cx={x} cy={y} r={0.9} fill="currentColor" />
                })}
              </svg>
              <ChartTooltip>
                <ChartTooltipContent />
              </ChartTooltip>
            </ChartContainer>
          )}
          {data && (
            <div className="mt-4 text-sm text-muted-foreground">
              Total no ano: R$ {data.values.reduce((a,b)=>a+b,0).toLocaleString('pt-BR')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

