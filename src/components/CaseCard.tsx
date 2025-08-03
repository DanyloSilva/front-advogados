
import type React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CalendarDays, UserCircle, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import ProposalFormComponent from './ProposalFormComponent';
import { useAuth } from '@/contexts/AuthContext';

export interface Case {
  id: number;
  title: string;
  description: string;
  usuario?: {
    id: number;
    name: string;
  };
  createdAt?: string; 
}

interface CaseCardProps {
  caseData: Case;
  onViewDetails?: (caseId: number) => void;
  allowProposal?: boolean;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseData, onViewDetails, allowProposal }) => {
  const { user } = useAuth();
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não informada';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <Card className="flex flex-col h-full bg-card rounded-xl shadow-card-modern hover:shadow-card-modern-hover transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      <CardHeader className="p-5">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-primary/10 rounded-lg mt-0.5">
            <FileText className="h-5 w-5 text-primary shrink-0" />
          </div>
          <div>
            <CardTitle className="text-lg font-headline text-primary leading-tight line-clamp-2 hover:text-primary/80 transition-colors">
              {caseData.title}
            </CardTitle>
            {caseData.usuario && (
              <CardDescription className="text-xs text-muted-foreground flex items-center mt-1.5">
                <UserCircle className="h-3.5 w-3.5 mr-1.5"/> Submetido por: Usuário ID {caseData.usuario.id}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 flex-grow">
        <p className="text-sm text-foreground/80 line-clamp-4 mb-3.5">
          {caseData.description}
        </p>
        {caseData.createdAt && (
          <div className="text-xs text-muted-foreground flex items-center">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            Criado em: {formatDate(caseData.createdAt)}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-border bg-muted/30 flex flex-col space-y-2">
        {onViewDetails && (
          <Button
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-primary group transition-all duration-200"
            onClick={() => onViewDetails(caseData.id)}
            aria-label={`Ver detalhes do caso ${caseData.title}`}
          >
            Ver Detalhes <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-transform"/>
          </Button>
        )}
        {allowProposal && user?.role === 'ADVOGADO' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" variant="default">
                Enviar Proposta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Proposta</DialogTitle>
              </DialogHeader>
              <ProposalFormComponent caseId={caseData.id} />
            </DialogContent>
          </Dialog>
        )}
        {!onViewDetails && !(allowProposal && user?.role === 'ADVOGADO') && (
          <p className="text-xs text-muted-foreground italic w-full text-center">Mais ações em breve</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default CaseCard;
