"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Trophy,
  FileText,
  Settings,
  ChevronLeft,
  DollarSign,
  CalendarDays,
  X,
} from "lucide-react";
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

function NavLink({
  item,
  expanded,
  onClick,
}: {
  item: (typeof navItems)[0];
  expanded: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      onClick={onClick}
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
}

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-sidebar-border p-3">
          <span className="text-sm font-semibold px-1">Social Advance</span>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-sidebar-accent"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-2 pt-2">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} expanded onClick={onClose} />
          ))}
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
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
              className={cn(
                "transition-transform",
                !expanded && "rotate-180"
              )}
            />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) =>
            expanded ? (
              <NavLink key={item.href} item={item} expanded />
            ) : (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <NavLink item={item} expanded={false} />
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          )}
        </nav>
      </aside>
    </>
  );
}
