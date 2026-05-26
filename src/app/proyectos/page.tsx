"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, ChevronRight, MapPin, Menu, MessageCircle, ShieldCheck, X } from "lucide-react";
import { AdvisorChat } from "../components/advisor-chat";
import { VistaDevCredit } from "../components/vistadev-credit";
import { activeTenant } from "../config/tenants";
import {
  editableContentDefaults,
  getVisiblePageCopy,
  getEditableSectionMap,
  type EditableSection,
} from "../lib/editable-content";

const defaultContentMap = getEditableSectionMap(editableContentDefaults);
type ContentMap = typeof defaultContentMap;

function HeaderNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030a16]/92 px-5 py-4 text-white backdrop-blur lg:px-10">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-5">
        <Link href="/" className="whitespace-nowrap text-[11px] font-semibold uppercase leading-none tracking-[0.12em] text-[#f3d99a] sm:text-xs lg:text-sm lg:tracking-[0.16em]" aria-label={activeTenant.brand}>
          Castrejon Bienes y Raices
        </Link>
        <nav className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/62 lg:flex">
          <Link href="/#terrenos" className="px-3 py-2 transition hover:text-[#f3d99a]">
            Terrenos
          </Link>
          <Link href="/proyectos" className="border border-[#d8b86f]/45 px-3 py-2 text-[#f3d99a]">
            Terrenos
          </Link>
        </nav>
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="grid size-10 place-items-center border border-white/18 bg-white/[0.08] text-[#f3d99a] backdrop-blur lg:hidden"
        >
          {mobileMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
        </button>
        {mobileMenuOpen ? (
          <div className="absolute right-0 top-12 w-56 border border-white/12 bg-[#030a16]/96 p-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/72 shadow-2xl backdrop-blur lg:hidden">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center justify-between border-b border-white/10 px-4 transition hover:text-[#f3d99a]"
            >
              Inicio
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
            <a
              href={activeTenant.contact.whatsappHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center justify-between px-4 transition hover:text-[#f3d99a]"
            >
              Contacto
              <ChevronRight size={14} aria-hidden="true" />
            </a>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default function ProjectsPage() {
  const [contentMap, setContentMap] = useState<ContentMap>(defaultContentMap);
  const section = contentMap["otros-proyectos-intro"];
  const landSections = Object.values(contentMap).filter(
    (item) => item.id === "proyecto" || item.id.startsWith("terreno-"),
  );

  useEffect(() => {
    let isMounted = true;

    fetch("/api/content", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { sections?: EditableSection[] }) => {
        if (!isMounted) return;
        setContentMap(getEditableSectionMap(data.sections ?? editableContentDefaults));
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#030a16] text-white">
      <HeaderNav />
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(216,184,111,0.2),transparent_34%),linear-gradient(180deg,#030a16_0%,#071321_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">
              Próximamente
            </p>
            <h1 className="text-balance text-5xl font-semibold leading-[1.02] sm:text-7xl">
              {section.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/66">
              {section.copy}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#terrenos"
                className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#d8b86f] px-6 text-sm font-semibold uppercase tracking-[0.16em] text-[#07111f]"
              >
                Ver terrenos
                <ArrowRight size={17} />
              </Link>
              <a
                href={activeTenant.contact.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/18 px-6 text-sm font-semibold uppercase tracking-[0.16em] text-white/76 transition hover:border-[#d8b86f]/60 hover:text-[#f3d99a]"
              >
                Consultar por WhatsApp
                <MessageCircle size={17} />
              </a>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}>
            <div className="overflow-hidden border border-white/12 bg-white/[0.035]">
              <div className="relative min-h-[450px] overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${section.image})` }} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,22,0.04),rgba(3,10,22,0.24))]" />
                <div className="absolute bottom-6 left-6 grid size-14 place-items-center border border-[#d8b86f]/35 bg-[#030a16]/72 text-[#f3d99a] backdrop-blur">
                  <Building2 size={28} strokeWidth={1.4} />
                </div>
              </div>
              <div className="border-t border-white/10 bg-[#071321] p-6 sm:p-8">
                <p className="max-w-2xl text-lg leading-8 text-white/68">{getVisiblePageCopy(section)}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <section id="terrenos" className="bg-[#030a16] px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">
              Locaciones
            </p>
            <h2 className="text-balance text-4xl font-semibold leading-tight sm:text-6xl">
              Terrenos en Morelos, Jojutla y zona sur con información completa.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/62">
              Encuentra terrenos en Morelos, terrenos en Jojutla, terrenos zona sur y
              oportunidades para construir casas o invertir cerca de Tequesquitengo,
              Zacatepec y Tlaquiltenango. Cada publicación puede incluir precio,
              dirección, superficie, planos, fotos y videos.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {landSections.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.04 }}
                className="group relative min-h-[430px] overflow-hidden border border-white/10 bg-white/[0.035]"
              >
                <Link href={item.link} className="absolute inset-0 z-10" aria-label={`Ver ${item.title}`} />
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${item.image || section.image})` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,22,0.1),rgba(3,10,22,0.9))]" />
                <div className="relative flex min-h-[430px] flex-col justify-end p-7 sm:p-9">
                  <MapPin className="mb-6 text-[#f3d99a]" size={32} strokeWidth={1.4} />
                  <h3 className="text-3xl font-semibold">{item.title}</h3>
                  <p className="mt-4 max-w-xl text-base leading-7 text-white/68">{item.copy}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm text-[#f3d99a]">
                    Ver información del terreno
                    <ArrowRight size={16} />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
      <AdvisorChat />
      <footer className="border-t border-white/10 bg-[#030a16] px-6 py-10 text-white/52 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-white">{activeTenant.brand}</p>
            <span className="inline-flex items-center gap-2 text-sm">
              <ShieldCheck size={16} className="text-[#d8b86f]" />
              Preparado para crecer
            </span>
          </div>
          <VistaDevCredit />
        </div>
      </footer>
    </main>
  );
}
