
"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LogoIcon from '@/components/icons/LogoIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, UserCircle, LogOut, LayoutDashboard, FileText, Briefcase, UserPlus } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isLoading && !isClient) {
    return (
      <header className="bg-card text-foreground shadow-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 h-[var(--navbar-height)] flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl">
            <LogoIcon className="h-7 w-7 text-primary" />
            <span className="font-headline text-primary">Advogados Solidários</span>
          </Link>
          <div className="h-8 w-24 bg-muted animate-pulse rounded-md"></div>
        </div>
      </header>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItemBaseClasses = "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";
  const navItemIdleClasses = "text-muted-foreground hover:text-primary hover:bg-primary/10";
  const navItemActiveClasses = "text-primary bg-primary/10 font-semibold shadow-inner";

  return (
    <header className="bg-card text-foreground sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 h-[var(--navbar-height)] flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl">
          <LogoIcon className="h-7 w-7 text-primary" />
          <span className="font-headline text-primary">Advogados Solidários</span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-3">
          {isClient && isAuthenticated && user ? (
            <>
              <Link href="/dashboard" className={`${navItemBaseClasses} ${pathname === '/dashboard' ? navItemActiveClasses : navItemIdleClasses}`}>
                <LayoutDashboard className="inline-block mr-1.5 h-4 w-4" />Painel
              </Link>
              {user.role === 'USUARIO' && (
                <Link href="/submit-case" className={`${navItemBaseClasses} ${pathname === '/submit-case' ? navItemActiveClasses : navItemIdleClasses}`}>
                  <FileText className="inline-block mr-1.5 h-4 w-4" />Submeter Caso
                </Link>
              )}
              <Link href="/causas/historico" className={`${navItemBaseClasses} ${pathname === '/causas/historico' ? navItemActiveClasses : navItemIdleClasses}`}>Histórico</Link>
              {user.role === 'ADVOGADO' && (
                <Link href="/cases" className={`${navItemBaseClasses} ${pathname === '/cases' ? navItemActiveClasses : navItemIdleClasses}`}>
                  <Briefcase className="inline-block mr-1.5 h-4 w-4" />Ver Casos
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1.5 hover:bg-accent/10 text-foreground focus:ring-ring px-2 py-1.5 md:px-3">
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium hidden sm:inline">{user.name}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card text-foreground border-border shadow-lg w-56 rounded-lg mt-1.5">
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : isClient && !isAuthenticated ? (
            <>
              <Button asChild variant="ghost" className={`${navItemBaseClasses} ${navItemIdleClasses}`}>
                <Link href="/login">Entrar</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-ring transition-transform duration-150 hover:scale-105">
                    Registrar <UserPlus className="ml-1.5 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card text-foreground border-border shadow-lg rounded-lg mt-1.5">
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent/10 focus:text-accent-foreground">
                    <Link href="/register/user">Como Usuário</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent/10 focus:text-accent-foreground">
                    <Link href="/register/lawyer">Como Advogado</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null }
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
