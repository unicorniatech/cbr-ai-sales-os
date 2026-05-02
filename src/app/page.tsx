"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Lenis from "lenis";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Home as HomeIcon,
  Landmark,
  MapPin,
  MessageCircle,
  Ruler,
  ShieldCheck,
  Trees,
} from "lucide-react";
import { AdvisorChat } from "./components/advisor-chat";

const brand = "Grupo Inmobiliario Castrejón Rodríguez";
const slogan = "Tu inversión segura con la seriedad que nos distingue";

const project = {
  name: "Cumbres de Bendición",
  location: "Ampliación Lázaro Cárdenas, Jojutla, Morelos",
  lots: "200 m2",
  dimensions: "10x20 m",
  description: "Terrenos limpios, delimitados y listos para iniciar patrimonio.",
  downPayment: "$10,000 MXN",
  monthlyPayment: "$2,000 MXN",
  standardPrice: "$85,000 MXN",
  mainStreetPrice: "$95,000 MXN",
};

const storySteps = [
  "Convierte tu terreno en tu futuro hogar",
  "Terrenos, casas e inversiones en Morelos",
  "Compra con claridad, documentación y trato directo",
  "Grupo Inmobiliario Castrejón Rodríguez",
];

const propertyTypes = [
  {
    title: "Lotes residenciales",
    copy: "Superficies de 200 m2 para construir a tu ritmo, con pagos mensuales accesibles.",
    icon: Ruler,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Casas en desarrollo",
    copy: "Opciones habitacionales para compradores que buscan avanzar con claridad y trato directo.",
    icon: HomeIcon,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Terrenos patrimoniales",
    copy: "Ubicaciones con potencial en Morelos para familias, inversionistas y constructores.",
    icon: Trees,
    image:
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Oportunidades de inversión",
    copy: "Activos inmobiliarios con información clara para decidir con confianza.",
    icon: Landmark,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  },
];

const trustItems = [
  "Información documental desde el primer contacto",
  "Terrenos delimitados y ubicaciones verificables",
  "Acompañamiento directo durante la decisión de compra",
  "Pagos claros, enganches definidos y seguimiento formal",
];

const heroVideoEndProgress = 0.9;
const heroVideoSafeTail = 0.12;

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.095,
      wheelMultiplier: 0.98,
      touchMultiplier: 1.35,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
}

function HeroText({
  children,
  progress,
  range,
  className = "",
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number, number, number];
  className?: string;
}) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [16, 0, 0, -16]);
  const scale = useTransform(progress, range, [0.985, 1, 1, 0.992]);

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className={`absolute inset-x-0 top-1/2 mx-auto max-w-5xl -translate-y-1/2 px-6 text-center ${className}`}
    >
      {children}
    </motion.div>
  );
}

function StickyHero() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoDurationRef = useRef(0);
  const videoReadyRef = useRef(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const videoScale = useTransform(scrollYProgress, [0, 0.55, 1], [1.055, 1.025, 1]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.86, 1], [1, 1, 0.5]);
  const ctaOpacity = useTransform(scrollYProgress, [0.86, 0.89], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.86, 0.89], [16, 0]);

  useEffect(() => {
    let animationFrame = 0;
    let nextProgress = scrollYProgress.get();

    const syncVideo = () => {
      const video = videoRef.current;
      const duration = videoDurationRef.current || video?.duration || 0;

      if (!video || !videoReadyRef.current || !Number.isFinite(duration) || duration <= 0) {
        animationFrame = 0;
        return;
      }

      if (!video.paused) {
        video.pause();
      }

      const scrubProgress = Math.min(1, Math.max(0, nextProgress / heroVideoEndProgress));
      const safeDuration = Math.max(0, duration - heroVideoSafeTail);
      const targetTime = Math.min(safeDuration, scrubProgress * safeDuration);

      if (Math.abs(video.currentTime - targetTime) > 0.01) {
        video.currentTime = targetTime;
      }

      animationFrame = 0;
    };

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      nextProgress = latest;

      if (!animationFrame) {
        animationFrame = requestAnimationFrame(syncVideo);
      }
    });

    return () => {
      unsubscribe();

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [scrollYProgress]);

  return (
    <section ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#030a16]">
        <motion.video
          ref={videoRef}
          style={{ scale: videoScale, opacity: videoOpacity }}
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/CBR-introvideo.mp4"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            videoDurationRef.current = video.duration;
            videoReadyRef.current = true;
            video.pause();
            video.currentTime = 0;
          }}
          onPlay={(event) => {
            event.currentTarget.pause();
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(204,164,88,0.22),transparent_32%),linear-gradient(115deg,rgba(3,10,22,0.95)_0%,rgba(3,10,22,0.72)_42%,rgba(3,10,22,0.5)_100%)]" />
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5 text-sm text-white/80 sm:px-10">
          <a href="#inicio" className="block w-32 sm:w-44" aria-label={brand}>
            <Image
              src="/brand/CBR-LOGO.webp"
              alt={brand}
              width={900}
              height={600}
              priority
              className="h-auto w-full object-contain drop-shadow-[0_18px_45px_rgba(216,184,111,0.24)]"
            />
          </a>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 border border-white/18 bg-white/[0.07] px-4 py-2 text-xs uppercase tracking-[0.24em] text-white backdrop-blur transition hover:border-[#d7b56d]/70 hover:text-[#f3d99a]"
          >
            Contacto
            <ChevronRight size={14} aria-hidden="true" />
          </a>
        </div>

        <HeroText progress={scrollYProgress} range={[0.015, 0.045, 0.19, 0.22]}>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.42em] text-[#f3d99a]">
            Morelos real estate
          </p>
          <h1 className="text-balance text-5xl font-semibold leading-[0.98] text-white sm:text-7xl lg:text-8xl">
            {storySteps[0]}
          </h1>
        </HeroText>
        <HeroText progress={scrollYProgress} range={[0.24, 0.27, 0.41, 0.44]}>
          <h2 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            {storySteps[1]}
          </h2>
        </HeroText>
        <HeroText progress={scrollYProgress} range={[0.465, 0.495, 0.635, 0.665]}>
          <h2 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            {storySteps[2]}
          </h2>
        </HeroText>
        <HeroText progress={scrollYProgress} range={[0.69, 0.72, 0.855, 0.885]}>
          <p className="mx-auto mb-5 max-w-2xl text-base uppercase tracking-[0.36em] text-[#f3d99a]/90">
            {slogan}
          </p>
          <h2 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            {storySteps[3]}
          </h2>
        </HeroText>

        <motion.div
          style={{ opacity: ctaOpacity, y: ctaY }}
          className="absolute inset-x-0 bottom-14 z-20 flex flex-col items-center justify-center gap-3 px-6 sm:flex-row"
        >
          <a
            href="#propiedades"
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-3 bg-[#d8b86f] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#07111f] transition hover:bg-[#f3d99a] sm:w-auto"
          >
            Ver propiedades
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a
            href="#asesor-ia"
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-3 border border-white/24 bg-white/[0.08] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white backdrop-blur transition hover:border-[#f3d99a]/70 hover:text-[#f3d99a] sm:w-auto"
          >
            Hablar con asesor IA
            <Bot size={18} aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">
        {eyebrow}
      </p>
      <h2 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-pretty text-base leading-8 text-white/62 sm:text-lg">
        {copy}
      </p>
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function FeaturedProject() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-[#030a16] py-28 sm:py-36">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#030a16_0%,#071321_52%,#030a16_100%)]" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-10">
        <Reveal>
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">
              Proyecto destacado
            </p>
            <h2 className="max-w-3xl text-balance text-5xl font-semibold leading-[1.02] text-white sm:text-7xl">
              {project.name}
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/66">
              {project.description} Una oportunidad patrimonial en Jojutla con
              enganche accesible y mensualidades pensadas para avanzar sin ruido.
            </p>
            <div className="mt-10 grid gap-5 text-white/78 sm:grid-cols-2">
              {[
                ["Ubicación", project.location],
                ["Superficie", `${project.lots} · ${project.dimensions}`],
                ["Enganche", project.downPayment],
                ["Mensualidad", project.monthlyPayment],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-white/12 pt-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#d8b86f]/80">
                    {label}
                  </p>
                  <p className="mt-2 text-xl font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="relative min-h-[520px] overflow-hidden border border-white/12 bg-white/[0.04]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=82)",
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,22,0.12),rgba(3,10,22,0.86))]" />
            <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-9">
              <p className="mb-3 inline-flex items-center gap-2 bg-[#07111f]/70 px-3 py-2 text-xs uppercase tracking-[0.22em] text-[#f3d99a] backdrop-blur">
                <MapPin size={14} aria-hidden="true" />
                Jojutla, Morelos
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="bg-white/[0.09] p-5 backdrop-blur">
                  <p className="text-sm text-white/58">Precio estandar</p>
                  <p className="mt-1 text-3xl font-semibold text-white">
                    {project.standardPrice}
                  </p>
                </div>
                <div className="bg-white/[0.09] p-5 backdrop-blur">
                  <p className="text-sm text-white/58">Avenida principal</p>
                  <p className="mt-1 text-3xl font-semibold text-white">
                    {project.mainStreetPrice}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PropertyCards() {
  return (
    <section id="propiedades" className="bg-[#030a16] py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionIntro
          eyebrow="Portafolio inicial"
          title="Propiedades para vivir, construir e invertir con perspectiva."
          copy="La experiencia está preparada para crecer hacia inventario dinámico, CRM, Supabase y seguimiento con asesor IA sin rehacer la interfaz."
        />
        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {propertyTypes.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
              <article className="group relative min-h-[430px] overflow-hidden border border-white/10 bg-white/[0.035]">
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,22,0.12),rgba(3,10,22,0.88))]" />
                <div className="relative flex h-full min-h-[430px] flex-col justify-end p-7 sm:p-9">
                  <item.icon className="mb-7 text-[#f3d99a]" size={34} strokeWidth={1.4} />
                  <h3 className="text-3xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-4 max-w-xl text-base leading-7 text-white/68">
                    {item.copy}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationSection() {
  return (
    <section className="relative overflow-hidden bg-[#071321] py-28 sm:py-36">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgba(216,184,111,0.18),transparent_36%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-10">
        <Reveal>
          <div className="sticky top-24">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">
              Ubicación
            </p>
            <h2 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Jojutla, Morelos: vida local, conexión y plusvalía regional.
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="grid gap-8">
            <div className="relative min-h-[440px] overflow-hidden border border-white/12">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1300&q=80)",
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,19,33,0.72),rgba(7,19,33,0.18))]" />
              <div className="absolute bottom-0 left-0 max-w-xl p-8">
                <p className="text-lg leading-8 text-white/76">
                  Ampliación Lázaro Cárdenas ofrece un punto de entrada claro
                  para compradores que buscan terreno, orden y precio definido.
                </p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {["Acceso regional", "Entorno habitacional", "Potencial patrimonial"].map(
                (item) => (
                  <div key={item} className="border-t border-white/12 pt-5">
                    <CheckCircle2 className="mb-4 text-[#d8b86f]" size={22} />
                    <p className="text-lg font-medium text-white">{item}</p>
                  </div>
                ),
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="bg-[#030a16] py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1fr] lg:px-10">
        <Reveal>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">
              Claridad legal
            </p>
            <h2 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Seriedad inmobiliaria para comprar con calma.
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="space-y-5">
            {trustItems.map((item) => (
              <div
                key={item}
                className="flex gap-5 border-b border-white/10 pb-5 text-lg leading-8 text-white/72"
              >
                <FileCheck2 className="mt-1 shrink-0 text-[#d8b86f]" size={24} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AdvisorSection() {
  return (
    <section id="asesor-ia" className="relative overflow-hidden bg-[#071321] py-28 sm:py-36">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(216,184,111,0.16),transparent_28%,rgba(28,82,102,0.2)_70%,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="grid gap-12 border-y border-white/12 py-16 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <span className="inline-flex size-14 items-center justify-center border border-[#d8b86f]/50 bg-[#d8b86f]/10 text-[#f3d99a]">
                <Bot size={28} aria-hidden="true" />
              </span>
            </div>
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">
                Asesor IA proximamente
              </p>
              <h2 className="max-w-4xl text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl">
                Un asistente comercial para resolver dudas, calificar leads y
                acelerar el siguiente paso.
              </h2>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-white/66">
                La interfaz ya reserva el espacio para integrar el agente
                después: preguntas sobre precios, ubicación, documentación,
                disponibilidad y seguimiento personalizado.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function LeadForm() {
  const interestOptions = useMemo(
    () => ["Terreno", "Casa", "Inversión", "Cumbres de Bendición"],
    [],
  );

  return (
    <section id="contacto" className="bg-[#030a16] py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <Reveal>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">
              Contacto
            </p>
            <h2 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Agenda una conversación seria sobre tu próxima inversión.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/66">
              Este formulario queda listo para conectarse después a Supabase,
              CRM o al asesor IA. Por ahora entrega una experiencia frontal
              completa y responsiva.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <form className="space-y-5 border border-white/12 bg-white/[0.04] p-6 backdrop-blur sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-white/68">
                Nombre
                <input
                  className="min-h-12 w-full border border-white/12 bg-[#071321] px-4 text-white outline-none transition placeholder:text-white/32 focus:border-[#d8b86f]"
                  placeholder="Tu nombre"
                  type="text"
                />
              </label>
              <label className="space-y-2 text-sm text-white/68">
                Telefono
                <input
                  className="min-h-12 w-full border border-white/12 bg-[#071321] px-4 text-white outline-none transition placeholder:text-white/32 focus:border-[#d8b86f]"
                  placeholder="WhatsApp"
                  type="tel"
                />
              </label>
            </div>
            <label className="space-y-2 text-sm text-white/68">
              Interés principal
              <select className="min-h-12 w-full border border-white/12 bg-[#071321] px-4 text-white outline-none transition focus:border-[#d8b86f]">
                {interestOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-white/68">
              Mensaje
              <textarea
                className="min-h-32 w-full resize-none border border-white/12 bg-[#071321] px-4 py-3 text-white outline-none transition placeholder:text-white/32 focus:border-[#d8b86f]"
                placeholder="Cuéntanos qué estás buscando"
              />
            </label>
            <button
              type="button"
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-[#d8b86f] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#07111f] transition hover:bg-[#f3d99a]"
            >
              Solicitar asesoría
              <MessageCircle size={18} aria-hidden="true" />
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  useLenis();

  return (
    <main className="min-h-screen bg-[#030a16] text-white">
      <AnimatePresence>
        <StickyHero />
      </AnimatePresence>
      <FeaturedProject />
      <PropertyCards />
      <LocationSection />
      <TrustSection />
      <AdvisorSection />
      <LeadForm />
      <AdvisorChat />
      <footer className="border-t border-white/10 bg-[#030a16] px-6 py-10 text-white/52 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-white">{brand}</p>
            <p className="mt-1 text-sm">{slogan}</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#d8b86f]" />
              Claridad documental
            </span>
            <span className="inline-flex items-center gap-2">
              <BadgeCheck size={16} className="text-[#d8b86f]" />
              Trato directo
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
