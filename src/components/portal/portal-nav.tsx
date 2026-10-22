"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DollarSign, CheckSquare, Calendar, BarChart2, Trophy, User } from "lucide-react";

const NAV = [
  { href: "/portal/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/portal/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/portal/calendario", label: "Calendário", icon: Calendar },
  { href: "/portal/relatorios", label: "Relatórios", icon: BarChart2 },
  { href: "/portal/ranking", label: "Ranking", icon: Trophy },
  { href: "/portal/perfil", label: "Perfil", icon: User },
];

export function PortalNav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-border">
      <div className="max-w-4xl mx-auto px-6 flex gap-0 overflow-x-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
              pathname.startsWith(href)
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={14} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
