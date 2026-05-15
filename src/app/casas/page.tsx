"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Home,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { AdvisorChat } from "../components/advisor-chat";
import { activeTenant } from "../config/tenants";
import { captureLead } from "../lib/lead-store";
import {
  editableContentDefaults,
  getEditableSectionMap,
  type EditableSection,
} from "../lib/editable-content";

const defaultContentMap = getEditableSectionMap(editableContentDefaults);
type ContentMap = typeof defaultContentMap;

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function HeaderNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030a16]/92 px-5 py-4 text-white backdrop-blur lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
        <Link href="/" className="block w-32 sm:w-44" aria-label={activeTenant.brand}>
          <Image
            src={activeTenant.logoUrl}
            alt={activeTenant.brand}
            width={900}
            height={600}
            className="h-auto w-full object-contain"
          />
        </Link>
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/62">
          <Link href="/#terrenos" className="hidden px-3 py-2 transition hover:text-[#f3d99a] sm:inline-flex">
            Terrenos
          </Link>
          <Link href="/casas" className="border border-[#d8b86f]/45 px-3 py-2 text-[#f3d99a]">
            Casas
          </Link>
          <Link href="/proyectos" className="hidden px-3 py-2 transition hover:text-[#f3d99a] sm:inline-flex">
            Otros proyectos
          </Link>
          <a href="#contacto" className="bg-[#d8b86f] px-3 py-2 text-[#07111f]">
            Contacto
          </a>
        </nav>
      </div>
    </header>
  );
}

function HousesIntro({ section }: { section: EditableSection }) {
  return (
    <section className="relative overflow-hidden bg-[#030a16] px-6 py-20 text-white sm:py-24 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(216,184,111,0.2),transparent_34%),linear-gradient(180deg,#030a16_0%,#071321_100%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <Reveal>
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">
              Casas
            </p>
            <h1 className="text-balance text-5xl font-semibold leading-[1.02] sm:text-7xl">
              {section.title}
            </h1>
            <p className="mt-7 text-lg leading-8 text-white/66">
              {section.copy}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contacto"
                className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#d8b86f] px-6 text-sm font-semibold uppercase tracking-[0.16em] text-[#07111f]"
              >
                Solicitar información
                <ArrowRight size={17} />
              </a>
              <a
                href={activeTenant.contact.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/18 px-6 text-sm font-semibold uppercase tracking-[0.16em] text-white/76 transition hover:border-[#d8b86f]/60 hover:text-[#f3d99a]"
              >
                WhatsApp
                <MessageCircle size={17} />
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative min-h-[430px] overflow-hidden border border-white/12">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${section.image})` }} />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,22,0.04),rgba(3,10,22,0.82))]" />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <p className="max-w-xl text-lg leading-8 text-white/76">{section.pageCopy}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HouseCategories({ contentMap }: { contentMap: ContentMap }) {
  const categories = [
    { id: "familiares", section: contentMap["casas-familiares"] },
    { id: "descanso", section: contentMap["casas-descanso"] },
    { id: "inversion", section: contentMap["casas-inversion"] },
  ];

  return (
    <section className="bg-[#071321] px-6 py-24 text-white sm:py-32 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">
              Opciones
            </p>
            <h2 className="text-balance text-4xl font-semibold leading-tight sm:text-6xl">
              Casas para vivir, descansar o invertir.
            </h2>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {categories.map(({ id, section }, index) => (
            <Reveal key={section.id} delay={index * 0.08}>
              <article id={id} className="group relative min-h-[460px] overflow-hidden border border-white/10 bg-white/[0.03]">
                <div className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${section.image})` }} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,22,0.06),rgba(3,10,22,0.9))]" />
                <div className="relative flex min-h-[460px] flex-col justify-end p-7">
                  <Home className="mb-6 text-[#f3d99a]" size={32} strokeWidth={1.4} />
                  <h3 className="text-3xl font-semibold">{section.title}</h3>
                  <p className="mt-4 text-base leading-7 text-white/68">{section.copy}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PurchaseProcess({ section }: { section: EditableSection }) {
  return (
    <section id="proceso" className="bg-[#030a16] px-6 py-24 text-white sm:py-32 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr]">
        <Reveal>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">
              Proceso
            </p>
            <h2 className="text-balance text-4xl font-semibold leading-tight sm:text-6xl">
              {section.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/64">{section.copy}</p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="space-y-5">
            {[
              "Revisar características y ubicación",
              "Solicitar documentación disponible",
              "Agendar visita o llamada",
              "Confirmar condiciones con trato directo",
            ].map((item) => (
              <div key={item} className="flex gap-5 border-b border-white/10 pb-5 text-lg leading-8 text-white/72">
                <CheckCircle2 className="mt-1 shrink-0 text-[#d8b86f]" size={24} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HousesLeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    captureLead({
      name,
      phone,
      interest: "Casas",
      notes: message,
      source: "Landing",
    });
    setSubmitted(true);
  };

  return (
    <section id="contacto" className="bg-[#071321] px-6 py-24 text-white sm:py-32 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">
              Contacto
            </p>
            <h2 className="text-balance text-4xl font-semibold leading-tight sm:text-6xl">
              Solicita información sobre casas disponibles.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/66">
              Un asesor puede ayudarte a revisar ubicación, condiciones, fotos, documentación y próximos pasos.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          {submitted ? (
            <div className="border border-[#d8b86f]/30 bg-[#d8b86f]/10 p-8 text-center">
              <BadgeCheck className="mx-auto mb-4 size-12 text-[#d8b86f]" />
              <h3 className="text-3xl font-semibold">Gracias, {name}</h3>
              <p className="mt-4 text-white/68">Recibimos tu solicitud de casas. Te contactaremos pronto.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 border border-white/12 bg-white/[0.04] p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="min-h-12 border border-white/12 bg-[#030a16] px-4 text-white outline-none placeholder:text-white/32 focus:border-[#d8b86f]"
                  placeholder="Nombre"
                />
                <input
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="min-h-12 border border-white/12 bg-[#030a16] px-4 text-white outline-none placeholder:text-white/32 focus:border-[#d8b86f]"
                  placeholder="WhatsApp"
                  type="tel"
                />
              </div>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-32 w-full resize-none border border-white/12 bg-[#030a16] px-4 py-3 text-white outline-none placeholder:text-white/32 focus:border-[#d8b86f]"
                placeholder="Qué tipo de casa estás buscando"
              />
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-[#d8b86f] px-6 text-sm font-semibold uppercase tracking-[0.16em] text-[#07111f]"
              >
                Enviar solicitud
                <MessageCircle size={17} />
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

export default function HousesPage() {
  const [contentMap, setContentMap] = useState<ContentMap>(defaultContentMap);
  const intro = contentMap["casas-intro"];
  const process = contentMap["casas-proceso"];
  const pageTitle = useMemo(() => `${intro.title} | ${activeTenant.brand}`, [intro.title]);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

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
    <main className="min-h-screen bg-[#030a16]">
      <HeaderNav />
      <HousesIntro section={intro} />
      <HouseCategories contentMap={contentMap} />
      <PurchaseProcess section={process} />
      <HousesLeadForm />
      <AdvisorChat />
      <footer className="border-t border-white/10 bg-[#030a16] px-6 py-10 text-white/52 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-white">{activeTenant.brand}</p>
            <p className="mt-1 text-sm">{activeTenant.slogan}</p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm">
            <ShieldCheck size={16} className="text-[#d8b86f]" />
            Información editable desde el tablero
          </span>
        </div>
      </footer>
    </main>
  );
}
