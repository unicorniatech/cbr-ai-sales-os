"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
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
  ChevronDown,
  FileCheck2,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { AdvisorChat } from "./components/advisor-chat";
import { captureLead } from "./lib/lead-store";
import { activeTenant, formatCurrency } from "./config/tenants";

const brand = activeTenant.brand;
const slogan = activeTenant.slogan;
const project = activeTenant.project;
const storySteps = activeTenant.storySteps;
const propertyTypes = activeTenant.propertyTypes;
const trustItems = activeTenant.trustItems;
const contact = activeTenant.contact;

const heroVideoEndProgress = 0.98;
const heroVideoSafeTail = 0.08;

function getHeroVideoTargetTime(progress: number, duration: number) {
  const scrubProgress = Math.min(1, Math.max(0, progress / heroVideoEndProgress));
  const safeDuration = Math.max(0, duration - heroVideoSafeTail);

  return Math.min(safeDuration, scrubProgress * safeDuration);
}

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.12,
      wheelMultiplier: 1.2,
      touchMultiplier: 1.5,
      smoothWheel: true,
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
  const mobileVideoPreparedRef = useRef(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const videoScale = useTransform(scrollYProgress, [0, 0.55, 1], [1.055, 1.025, 1]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.86, 1], [1, 1, 0.5]);
  const ctaOpacity = useTransform(scrollYProgress, [0.86, 0.89], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.86, 0.89], [16, 0]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scrollIndicatorY = useTransform(scrollYProgress, [0, 0.15], [0, 30]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const unsubscribe = scrollYProgress.on("change", (latest: number) => {
      const duration = videoDurationRef.current || video.duration || 0;
      if (!videoReadyRef.current || !Number.isFinite(duration) || duration <= 0) return;

      if (!video.paused) {
        video.pause();
      }

      const targetTime = getHeroVideoTargetTime(latest, duration);

      // Only update if difference is significant (reduces jitter)
      if (Math.abs(video.currentTime - targetTime) > 0.05) {
        video.currentTime = targetTime;
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  useEffect(() => {
    const prepareMobileVideo = () => {
      const video = videoRef.current;

      if (!video || mobileVideoPreparedRef.current) {
        return;
      }

      mobileVideoPreparedRef.current = true;
      video.muted = true;
      video.playsInline = true;
      video.load();

      const playAttempt = video.play();

      if (playAttempt) {
        playAttempt
          .then(() => {
            video.pause();
            video.currentTime = getHeroVideoTargetTime(
              scrollYProgress.get(),
              videoDurationRef.current || video.duration || 0,
            );
          })
          .catch(() => {
            video.pause();
          });
      }
    };

    window.addEventListener("touchstart", prepareMobileVideo, {
      once: true,
      passive: true,
    });
    window.addEventListener("pointerdown", prepareMobileVideo, {
      once: true,
      passive: true,
    });
    window.addEventListener("scroll", prepareMobileVideo, {
      once: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("touchstart", prepareMobileVideo);
      window.removeEventListener("pointerdown", prepareMobileVideo);
      window.removeEventListener("scroll", prepareMobileVideo);
    };
  }, [scrollYProgress]);

  return (
    <section ref={ref} className="relative h-[240svh] md:h-[240vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#030a16] md:h-screen">
        <motion.div
          style={{ scale: videoScale, opacity: videoOpacity }}
          className="absolute inset-0 bg-[url('/videos/CBR-intro-poster.jpg')] bg-cover bg-center"
          aria-hidden="true"
        />
        <motion.video
          ref={videoRef}
          style={{ scale: videoScale, opacity: videoOpacity }}
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/CBR-introvideo.mp4"
          muted
          playsInline
          disablePictureInPicture
          poster="/videos/CBR-intro-poster.jpg"
          preload="auto"
          disableRemotePlayback
          onLoadedMetadata={(event: React.SyntheticEvent<HTMLVideoElement>) => {
            const video = event.currentTarget;
            videoDurationRef.current = video.duration;
            videoReadyRef.current = true;
            video.pause();
            video.currentTime = getHeroVideoTargetTime(scrollYProgress.get(), video.duration);
          }}
          onCanPlay={(event) => {
            const video = event.currentTarget;
            videoReadyRef.current = true;
            video.pause();
          }}
          onPlay={(event: React.SyntheticEvent<HTMLVideoElement>) => {
            event.currentTarget.pause();
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(204,164,88,0.22),transparent_32%),linear-gradient(115deg,rgba(3,10,22,0.95)_0%,rgba(3,10,22,0.72)_42%,rgba(3,10,22,0.5)_100%)]" />
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5 text-sm text-white/80 sm:px-10">
          <a href="#inicio" className="block w-32 sm:w-44" aria-label={brand}>
            <Image
              src={activeTenant.logoUrl}
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

        <HeroText progress={scrollYProgress} range={[0.02, 0.06, 0.22, 0.28]}>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.42em] text-[#f3d99a]">
            Terrenos en Morelos
          </p>
          <h1 className="text-balance text-5xl font-semibold leading-[0.98] text-white sm:text-7xl lg:text-8xl">
            {storySteps[0]}
          </h1>
        </HeroText>
        <HeroText progress={scrollYProgress} range={[0.32, 0.38, 0.52, 0.58]}>
          <h2 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            {storySteps[1]}
          </h2>
        </HeroText>
        <HeroText progress={scrollYProgress} range={[0.62, 0.68, 0.78, 0.84]}>
          <h2 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            {storySteps[2]}
          </h2>
        </HeroText>
        <HeroText progress={scrollYProgress} range={[0.88, 0.92, 0.97, 0.995]}>
          <p className="mx-auto mb-5 max-w-2xl text-base uppercase tracking-[0.36em] text-[#f3d99a]/90">
            {slogan}
          </p>
          <h2 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            {storySteps[3]}
          </h2>
        </HeroText>

        {/* Scroll Down Indicator - appears at start, fades on scroll */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity, y: scrollIndicatorY }}
          className="absolute inset-x-0 bottom-28 z-20 flex flex-col items-center gap-2 px-6"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-white/60">Desplaza</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="grid size-10 place-items-center border border-white/20 bg-white/[0.08] text-[#d8b86f] backdrop-blur"
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>

        <motion.div
          style={{ opacity: ctaOpacity, y: ctaY }}
          className="absolute inset-x-0 bottom-10 z-20 flex flex-col items-center justify-center gap-3 px-6 sm:flex-row"
        >
          <a
            href="#terrenos"
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-3 bg-[#d8b86f] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#07111f] transition hover:bg-[#f3d99a] sm:w-auto"
          >
            Ver terrenos
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
              {activeTenant.subtitle}
            </p>
            <div className="mt-10 grid gap-5 text-white/78 sm:grid-cols-2">
              {[
                ["Ubicación", project.location],
                ["Superficie", `${project.lots} · ${project.dimensions}`],
                ["Enganche", formatCurrency(project.downPayment)],
                ["Mensualidad", formatCurrency(project.monthlyPayment)],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-white/12 pt-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#d8b86f]/80">
                    {label}
                  </p>
                  <p className="mt-2 text-xl font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
            <Link
              href="/secciones/cumbres-de-bendicion"
              className="mt-10 inline-flex items-center gap-3 border border-[#d8b86f]/45 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3d99a] transition hover:bg-[#d8b86f] hover:text-[#07111f]"
            >
              Ver detalles del proyecto
              <ArrowRight size={16} />
            </Link>
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
                    {formatCurrency(project.standardPrice)}
                  </p>
                </div>
                <div className="bg-white/[0.09] p-5 backdrop-blur">
                  <p className="text-sm text-white/58">Avenida principal</p>
                  <p className="mt-1 text-3xl font-semibold text-white">
                    {formatCurrency(project.mainStreetPrice)}
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

function MissionVisionSection() {
  return (
    <section className="bg-[#071321] py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionIntro
          eyebrow="Identidad"
          title="Seriedad, legalidad y compromiso con tu patrimonio familiar."
          copy="Grupo Inmobiliario Castrejón Rodríguez trabaja con un proceso claro para que cada comprador entienda qué adquiere, cómo paga y qué documentación puede revisar."
        />
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {[
            ["Misión", activeTenant.mission, "/secciones/mision"],
            ["Visión", activeTenant.vision, "/secciones/vision"],
          ].map(([title, copy, href], index) => (
            <Reveal key={title} delay={index * 0.08}>
              <article className="border border-white/10 bg-white/[0.035] p-7 sm:p-9">
                <p className="text-xs uppercase tracking-[0.26em] text-[#d8b86f]">{title}</p>
                <p className="mt-5 text-lg leading-8 text-white/70">{copy}</p>
                <a href={href} className="mt-7 inline-flex items-center gap-2 text-sm text-[#f3d99a]">
                  Leer más
                  <ChevronRight size={16} />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activeTenant.values.map((value, index) => (
            <Reveal key={value} delay={index * 0.04}>
              <div className="border-t border-[#d8b86f]/35 pt-5">
                <ShieldCheck className="mb-4 text-[#d8b86f]" size={22} />
                <p className="text-lg font-medium text-white">{value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PropertyCards() {
  return (
    <section id="terrenos" className="bg-[#030a16] py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionIntro
          eyebrow="Terrenos disponibles"
          title="Lotes limpios, delimitados y con precio claro."
          copy="Por ahora el portafolio público se enfoca únicamente en terrenos dentro del proyecto Cumbres de Bendición."
        />
        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {propertyTypes.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
              <article className="group relative min-h-[430px] overflow-hidden border border-white/10 bg-white/[0.035]">
                <Link href={`/secciones/${index === 0 ? "lotes-200m2" : index === 1 ? "calle-principal" : index === 2 ? "terrenos-patrimoniales" : "claridad-documental"}`} className="absolute inset-0 z-10" aria-label={`Ver más sobre ${item.title}`} />
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
                  <span className="mt-6 inline-flex items-center gap-2 text-sm text-[#f3d99a]">
                    Más información
                    <ChevronRight size={16} />
                  </span>
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
              Jojutla, Morelos: ubicación clara para invertir en terreno.
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
                  {project.location} ofrece un punto de entrada claro
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
                El asesor digital está preparado para responder preguntas sobre
                precios, ubicación, medidas, documentación y próximos pasos de contacto.
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
    () => ["Terreno", activeTenant.project.name, "Lote sobre calle principal", "Documentación"],
    [],
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(interestOptions[0]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    captureLead({
      name,
      phone,
      interest,
      notes: message,
      source: "Landing",
    });
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <section id="contacto" className="bg-[#030a16] py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="border border-[#d8b86f]/30 bg-[#d8b86f]/10 p-8 text-center backdrop-blur">
              <BadgeCheck className="mx-auto mb-4 size-12 text-[#d8b86f]" />
              <h2 className="text-3xl font-semibold text-white">¡Gracias, {name}!</h2>
              <p className="mt-4 text-lg text-white/70">
                Hemos recibido tu información. Un asesor te contactará pronto.
              </p>
              <p className="mt-2 text-sm text-white/50">
                También puedes usar el asesor IA en la esquina inferior derecha.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

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
              Déjanos tus datos o escríbenos directamente por WhatsApp. Atendemos
              desde {contact.address}.
            </p>
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-3 border border-[#d8b86f]/45 px-5 py-3 text-sm font-semibold text-[#f3d99a] transition hover:bg-[#d8b86f] hover:text-[#07111f]"
            >
              WhatsApp: {contact.whatsapp}
              <MessageCircle size={18} />
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <form onSubmit={handleSubmit} className="space-y-5 border border-white/12 bg-white/[0.04] p-6 backdrop-blur sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-white/68">
                Nombre *
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-12 w-full border border-white/12 bg-[#071321] px-4 text-white outline-none transition placeholder:text-white/32 focus:border-[#d8b86f]"
                  placeholder="Tu nombre"
                  type="text"
                />
              </label>
              <label className="space-y-2 text-sm text-white/68">
                WhatsApp *
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="min-h-12 w-full border border-white/12 bg-[#071321] px-4 text-white outline-none transition placeholder:text-white/32 focus:border-[#d8b86f]"
                  placeholder="Tu número"
                  type="tel"
                />
              </label>
            </div>
            <label className="space-y-2 text-sm text-white/68">
              Interés principal
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="min-h-12 w-full border border-white/12 bg-[#071321] px-4 text-white outline-none transition focus:border-[#d8b86f]"
              >
                {interestOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-white/68">
              Mensaje (opcional)
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-32 w-full resize-none border border-white/12 bg-[#071321] px-4 py-3 text-white outline-none transition placeholder:text-white/32 focus:border-[#d8b86f]"
                placeholder="Cuéntanos qué estás buscando"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !phone.trim()}
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-[#d8b86f] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#07111f] transition hover:bg-[#f3d99a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Solicitar asesoría"}
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
      <MissionVisionSection />
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
            <p className="mt-1 text-sm">{contact.address}</p>
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
