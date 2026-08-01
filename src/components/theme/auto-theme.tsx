"use client";

import { useEffect } from "react";

const HORA_INICIO_CLARO = 6;
const HORA_INICIO_ESCURO = 18;

function aplicarTemaPorHorario() {
  const hora = new Date().getHours();
  const escuro = hora < HORA_INICIO_CLARO || hora >= HORA_INICIO_ESCURO;
  document.documentElement.classList.toggle("dark", escuro);
}

export function AutoTheme() {
  useEffect(() => {
    aplicarTemaPorHorario();
    const intervalo = setInterval(aplicarTemaPorHorario, 60_000);
    return () => clearInterval(intervalo);
  }, []);

  return null;
}
