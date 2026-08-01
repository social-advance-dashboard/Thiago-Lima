"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Trophy, FileText, Settings, ChevronLeft, DollarSign, CalendarDays } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Empresas", href: "/empresas", icon: Building2 },
  { label: "Ranking", href: "/ranking", icon: Trophy },
  { label: "Financeiro", href: "/financeiro", icon: DollarSign },
  { label: "Agendamentos", href: "/agendamentos", icon: CalendarDays },
  { label: "Relatórios", href: "/relatorios", icon: FileText },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200",
        expanded ? "w-[200px]" : "w-[64px]"
      )}
    >
      <div className="flex items-center justify-between p-3">
        {expanded && (
          <span className="text-sm font-semibold px-1">Social Advance</span>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-auto rounded-md p-1.5 hover:bg-sidebar-accent"
        >
          <ChevronLeft
            size={16}
            className={cn("transition-transform", !expanded && "rotate-180")}
          />
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {expanded && <span>{item.label}</span>}
            </Link>
          );

          if (expanded) return <div key={item.href}>{linkContent}</div>;

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
}