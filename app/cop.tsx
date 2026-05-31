'use client'

import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import FluidBackground from "./components/FluidBcakground";
import Link from "next/link";
import { Environment, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { easing } from 'maath';

// ─── FONTS ───────────────────────────────────────────────────────────────────
// Add to your layout.tsx or globals.css:
// @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Tenor+Sans&family=Space+Mono:wght@400;700&display=swap');

useGLTF.preload('ring/scene.gltf');

// ─── 3D RING MODEL ───────────────────────────────────────────────────────────
const Model = () => {
  const { scene } = useGLTF('ring/scene.gltf');
  const modelRef = useRef<THREE.Group>(null!);
  const { viewport } = useThree();
  const { scrollYProgress } = useScroll();

  // Mouse tracking for parallax tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const targetRotX = useRef(0);
  const targetRotY = useRef(0);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      // Normalise to -1 → 1
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.transparent = false;
      }
    });
  }, [scene]);

  // Idle oscillation time tracker
  const clock = useRef(0);

  useFrame((state, delta) => {
    if (!modelRef.current) return;
    clock.current += delta;

    const scroll = scrollYProgress.get();

    // ── Idle breathing (replaces auto-rotate) ──
    // Gentle Y oscillation ±5°, slow Z drift
    const idleY = Math.sin(clock.current * 0.4) * 0.087; // ~5deg
    const idleX = Math.sin(clock.current * 0.25) * 0.035;
    const idleFloat = Math.sin(clock.current * 0.3) * 0.004;

    // ── Cursor parallax tilt ──
    targetRotX.current = mouseY.get() * 0.14;  // ±8deg
    targetRotY.current = mouseX.get() * 0.14;

    // ── Lerp everything smoothly ──
    modelRef.current.rotation.x += (idleX + targetRotX.current - modelRef.current.rotation.x) * 0.04;
    modelRef.current.rotation.y += (idleY + targetRotY.current - modelRef.current.rotation.y) * 0.04;

    // ── Scroll: drift ring up and away ──
    if (scroll > 0) {
      easing.damp3(
        modelRef.current.position,
        [mouseX.get() * 0.05, idleFloat + scroll * -0.15, 0],
        0.6,
        delta
      );
    } else {
      easing.damp3(
        modelRef.current.position,
        [mouseX.get() * 0.05, idleFloat, 0],
        0.6,
        delta
      );
    }
  });

  return (
    <primitive
      object={scene}
      ref={modelRef}
      position={[0, 0, 0]}
      rotation={[-0.1, -0.4, 0]}
    />
  );
};

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────
const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    const over = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, [data-hover]')) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);

    let raf: number;
    const animate = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.08;
      current.current.y += (pos.current.y - current.current.y) * 0.08;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${current.current.x}px, ${current.current.y}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{ willChange: 'transform' }}
    >
      <div
        style={{
          width: hovered ? 40 : 16,
          height: hovered ? 40 : 16,
          marginLeft: hovered ? -20 : -8,
          marginTop: hovered ? -20 : -8,
          border: '1px solid #C9A84C',
          borderRadius: '50%',
          background: hovered ? 'rgba(201,168,76,0.08)' : 'transparent',
          transition: 'width 0.3s ease, height 0.3s ease, margin 0.3s ease, background 0.3s ease',
        }}
      />
    </div>
  );
};

// ─── ANIMATED TEXT LINE ───────────────────────────────────────────────────────
const FadeLine = ({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── SECTION DIVIDER ──────────────────────────────────────────────────────────
const Divider = () => (
  <div className="w-full flex items-center gap-6 my-16">
    <div className="flex-1 h-px bg-white/10" />
    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.35em', color: '#C9A84C', textTransform: 'uppercase' }}>
      ONYX
    </span>
    <div className="flex-1 h-px bg-white/10" />
  </div>
);

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
const ProductCard = ({
  num, name, material, desc, delay
}: { num: string; name: string; material: string; desc: string; delay: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative border border-white/[0.06] p-8 cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.015)' }}
      whileHover={{ borderColor: 'rgba(201,168,76,0.3)', y: -4 }}
    >
      <div className="mb-8">
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.35em',
          color: '#C9A84C',
          textTransform: 'uppercase',
          opacity: 0.7
        }}>{num}</span>
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 28,
        fontWeight: 300,
        letterSpacing: '0.04em',
        color: '#F5F0E8',
        marginBottom: 6,
        lineHeight: 1.1
      }}>{name}</div>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 9,
        letterSpacing: '0.2em',
        color: '#C9A84C',
        textTransform: 'uppercase',
        marginBottom: 20,
        opacity: 0.8
      }}>{material}</div>
      <p style={{ fontSize: 13, color: '#8A8A8A', lineHeight: 1.75, marginBottom: 32 }}>
        {desc}
      </p>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10 group-hover:bg-[#C9A84C]/30 transition-colors duration-500" />
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.25em',
          color: '#C9A84C',
          textTransform: 'uppercase',
          opacity: 0
        }} className="group-hover:opacity-100 transition-opacity duration-300">
          View piece →
        </span>
      </div>
    </motion.div>
  );
};

// ─── PROCESS STEP ─────────────────────────────────────────────────────────────
const ProcessStep = ({
  num, title, body, delay
}: { num: string; title: string; body: string; delay: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className="py-10 border-b border-white/[0.06]"
    >
      <div className="flex gap-10 items-start">
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.3em',
          color: '#C9A84C',
          opacity: 0.5,
          paddingTop: 6,
          minWidth: 40
        }}>{num}</div>
        <div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 26,
            fontWeight: 300,
            color: '#F5F0E8',
            marginBottom: 12,
            letterSpacing: '0.04em'
          }}>{title}</div>
          <p style={{ fontSize: 14, color: '#8A8A8A', lineHeight: 1.8, maxWidth: 480 }}>{body}</p>
        </div>
      </div>
    </motion.div>
  );
};


// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const { scrollYProgress } = useScroll();

  // Ring canvas fades out on scroll
  const ringOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const ringScale = useTransform(scrollYProgress, [0, 0.18], [1, 0.88]);

  // Hero copy enters after brief delay
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="bg-[#050505] text-[#F5F0E8]" style={{ cursor: 'none' }}>
      <Cursor />

      {/* ── FIXED BACKGROUND ── */}
      <div className="fixed inset-0 z-0">
        <Canvas>
          <FluidBackground />
        </Canvas>
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* ── FIXED 3D RING ── */}
      <motion.div
        className="fixed inset-0 z-10"
        style={{ opacity: ringOpacity, scale: ringScale }}
      >
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            precision: "lowp",
            alpha: true,
            stencil: true,
            depth: true,
          }}
          camera={{ position: [0, 0, 0.3], fov: 50 }}
        >
          <Suspense fallback={null}>
            <Model />
            <Environment files="studio.exr" environmentIntensity={0.3} />
          </Suspense>
        </Canvas>
      </motion.div>

      {/* ── NAV ── */}
      <nav className="fixed z-[200] inset-x-0 top-0 h-16 px-6 sm:px-10 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            color: '#F5F0E8'
          }}
        >
          ONYX
        </motion.div>

        {/* Desktop links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="hidden sm:flex items-center gap-3"
          style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase' }}
        >
          {['Collections', 'Atelier', 'Archive'].map((label, i) => (
            <>
              {i > 0 && <span key={`dot-${i}`} style={{ width: 3, height: 3, borderRadius: '50%', background: '#C9A84C', opacity: 0.5, display: 'inline-block' }} />}
              <Link
                key={label}
                href={`#${label.toLowerCase()}`}
                className="text-white/60 hover:text-[#C9A84C] transition-colors duration-300"
                style={{ letterSpacing: '0.3em' }}
              >
                {label}
              </Link>
            </>
          ))}
        </motion.div>

        {/* Mobile menu toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="sm:hidden text-white/60 hover:text-[#C9A84C] transition-colors"
          style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, lineHeight: 1 }}
        >
          +
        </motion.button>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-20 h-screen flex flex-col justify-end pb-24 px-6 sm:px-14">

        {/* Wordmark — centred, mid-screen */}
        <motion.div
          className="absolute inset-x-0 top-1/2 -translate-y-[60%] flex justify-center gap-[0.4em] sm:gap-[0.6em]"
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(64px, 13vw, 160px)',
            fontWeight: 300,
            letterSpacing: '0.1em',
            color: '#F5F0E8',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <span>O</span>
          <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>N</span>
          <span>Y</span>
          <span>X</span>
        </motion.div>

        {/* Bottom-left hero copy */}
        <div className="max-w-xs sm:max-w-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={mounted ? { opacity: 0.6 } : {}}
            transition={{ duration: 1, delay: 0.1, ease: 'easeOut' }}
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              marginBottom: 16
            }}
          >
            Fine Jewellery · Est. Present
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 300,
              lineHeight: 1.15,
              letterSpacing: '0.02em',
              marginBottom: 20
            }}
          >
            Some things are<br />
            <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>not made for daylight.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 13, color: '#8A8A8A', lineHeight: 1.85, marginBottom: 32 }}
          >
            A jewellery house built in shadow. Each piece forged in precious metal, finished by hand. This is jewellery that doesn't need an occasion.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={mounted ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Link
              href="#collections"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                border: '1px solid rgba(201,168,76,0.4)',
                padding: '12px 24px',
                display: 'inline-block',
                transition: 'all 0.3s ease',
              }}
              className="hover:border-[#C9A84C] hover:bg-[rgba(201,168,76,0.05)]"
            >
              View the work
            </Link>
          </motion.div>
        </div>

        {/* Bottom centre pagination — your existing pill, refined */}
        <motion.div
          className="absolute bottom-8 inset-x-0 flex justify-center"
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="flex items-center gap-2.5"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.4em', textTransform: 'uppercase' }}>
            <span style={{ color: '#444' }}>+</span>
            <span style={{ color: '#C9A84C' }}>01</span>
            <span style={{ color: '#666' }}>Home</span>
            <span style={{ color: '#444' }}>+</span>
          </div>
        </motion.div>
      </section>


      {/* ── BRAND STATEMENT ── */}
      <section className="relative z-30 bg-[#050505] py-36 px-6 sm:px-14">
        <div className="max-w-4xl mx-auto">
          <FadeLine className="mb-6">
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.4em',
              color: '#C9A84C',
              textTransform: 'uppercase',
              opacity: 0.7,
              marginBottom: 32
            }}>The House</div>
          </FadeLine>
          <FadeLine delay={0.1}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(28px, 4.5vw, 54px)',
              fontWeight: 300,
              lineHeight: 1.25,
              letterSpacing: '0.02em',
              color: '#B5B5B5',
              marginBottom: 48
            }}>
              We believe a piece of jewellery should{' '}
              <em style={{ fontStyle: 'italic', color: '#F5F0E8' }}>stop time</em>
              {' '}— not mark it.
            </p>
          </FadeLine>
          <FadeLine delay={0.2}>
            <p style={{ fontSize: 15, color: '#8A8A8A', lineHeight: 1.9, maxWidth: 560 }}>
              Every ring, every chain, every setting that leaves the ONYX atelier carries the hours of a person who chose not to rush. We don't produce collections on a calendar. We work when the work is ready.
            </p>
          </FadeLine>
        </div>
      </section>


      {/* ── FEATURED COLLECTION ── */}
      <section id="collections" className="relative z-30 bg-[#050505] py-24 px-6 sm:px-14">
        <Divider />

        <div className="max-w-6xl mx-auto">
          <FadeLine className="mb-16">
            <div className="flex items-baseline gap-6">
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.3em',
                color: '#C9A84C',
                opacity: 0.5
              }}>02</span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(30px, 5vw, 52px)',
                fontWeight: 300,
                letterSpacing: '0.04em'
              }}>
                Not a catalogue.{' '}
                <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>A considered body of work.</em>
              </h2>
            </div>
          </FadeLine>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px">
            <ProductCard
              num="Piece 001"
              name="The Lucent"
              material="18k White Gold · VS Diamond Pavé"
              desc="White gold pavé band with an oval centre stone chosen for the particular way it holds light, not refracts it. A ring that glows from within."
              delay={0}
            />
            <ProductCard
              num="Piece 002"
              name="The Meridian"
              material="Oxidised Silver · Black Diamond"
              desc="A thin chain necklace with a single raw-cut black diamond. No setting. The stone is suspended by its own weight in a hand-formed loop."
              delay={0.12}
            />
            <ProductCard
              num="Piece 003"
              name="The Seal"
              material="18k Black Gold · Onyx Signet"
              desc="Flat-faced ring. Engraved surface at the client's discretion. Dark, architectural, meant to be read as a statement of refusal as much as ownership."
              delay={0.24}
            />
          </div>

          <FadeLine delay={0.3}>
            <div className="mt-12 flex justify-end">
              <Link
                href="#"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  color: '#8A8A8A',
                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                  paddingBottom: 6,
                  transition: 'color 0.3s, border-color 0.3s'
                }}
                className="hover:text-[#C9A84C] hover:border-[#C9A84C]"
              >
                View all pieces →
              </Link>
            </div>
          </FadeLine>
        </div>
      </section>


      {/* ── ATELIER TEASER ── */}
      <section id="atelier" className="relative z-30 bg-[#080808] py-36 px-6 sm:px-14 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-20 items-center">

          <div>
            <FadeLine>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.4em',
                color: '#C9A84C',
                textTransform: 'uppercase',
                opacity: 0.7,
                marginBottom: 24
              }}>The Atelier</div>
            </FadeLine>
            <FadeLine delay={0.1}>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(32px, 5vw, 52px)',
                fontWeight: 300,
                lineHeight: 1.15,
                letterSpacing: '0.02em',
                marginBottom: 28
              }}>
                The work happens<br />
                <em style={{ fontStyle: 'italic', color: '#C9A84C' }}>before the work happens.</em>
              </h2>
            </FadeLine>
            <FadeLine delay={0.2}>
              <p style={{ fontSize: 14, color: '#8A8A8A', lineHeight: 1.85, marginBottom: 40 }}>
                The ONYX atelier is not a factory. It is three people in a room who disagree about millimetres. Everything that leaves here has been held, questioned, and held again. We accept a small number of bespoke commissions each year.
              </p>
            </FadeLine>
            <FadeLine delay={0.3}>
              <Link
                href="#"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  border: '1px solid rgba(201,168,76,0.35)',
                  padding: '12px 24px',
                  display: 'inline-block',
                  transition: 'all 0.3s ease'
                }}
                className="hover:border-[#C9A84C] hover:bg-[rgba(201,168,76,0.04)]"
              >
                Write to the Atelier
              </Link>
            </FadeLine>
          </div>

          {/* Process steps */}
          <div>
            <ProcessStep
              num="01"
              title="The Conversation"
              body="We begin with a call or a letter. Tell us what you're carrying. What you want to mark, or refuse to mark. We'll listen more than we speak."
              delay={0}
            />
            <ProcessStep
              num="02"
              title="The Sketch"
              body="Three sketches. Never more. We find that too many options produce compromise. You'll know which one is right before we finish the sentence."
              delay={0.1}
            />
            <ProcessStep
              num="03"
              title="The Making"
              body="Eight to fourteen weeks. We'll send one update at the midpoint. Not because we're hiding anything — we simply don't believe in progress theatre."
              delay={0.2}
            />
            <ProcessStep
              num="04"
              title="The Delivery"
              body="Wrapped in matte black. No ribbon. No tissue paper confetti. Yours, with a handwritten note and nothing else."
              delay={0.3}
            />
          </div>
        </div>
      </section>


      {/* ── MANIFESTO QUOTE ── */}
      <section className="relative z-30 bg-[#050505] py-40 px-6 sm:px-14 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto text-center">
          <FadeLine>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(24px, 4vw, 44px)',
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1.4,
              color: '#B5B5B5',
              letterSpacing: '0.02em',
              marginBottom: 32
            }}>
              "We don't make jewellery for every occasion.<br />
              We make jewellery that{' '}
              <span style={{ color: '#F5F0E8' }}>becomes the occasion.</span>"
            </div>
          </FadeLine>
          <FadeLine delay={0.2}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.4em',
              color: '#C9A84C',
              textTransform: 'uppercase',
              opacity: 0.6
            }}>
              ONYX · House Statement
            </div>
          </FadeLine>
        </div>
      </section>


      {/* ── FOOTER ── */}
      <footer className="relative z-30 border-t border-white/[0.06] py-16 px-6 sm:px-14">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:items-end justify-between gap-10">

          <div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 36,
              fontWeight: 300,
              letterSpacing: '0.25em',
              marginBottom: 12
            }}>
              O<span style={{ color: '#C9A84C', fontStyle: 'italic' }}>N</span>YX
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.3em',
              color: '#444',
              textTransform: 'uppercase'
            }}>
              All pieces made to order
            </div>
          </div>

          <div className="flex items-center gap-8" style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.25em',
            textTransform: 'uppercase'
          }}>
            <Link href="#" className="text-white/30 hover:text-[#C9A84C] transition-colors">Collections</Link>
            <Link href="#" className="text-white/30 hover:text-[#C9A84C] transition-colors">Atelier</Link>
            <Link href="#" className="text-white/30 hover:text-[#C9A84C] transition-colors">Archive</Link>
          </div>

          <div className="flex items-center gap-6" style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#444'
          }}>
            <Link href="#" className="hover:text-[#C9A84C] transition-colors">Instagram</Link>
            <span>·</span>
            <Link href="mailto:atelier@onyx.com" className="hover:text-[#C9A84C] transition-colors">atelier@onyx.com</Link>
          </div>

        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/[0.04] flex justify-between items-center">
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.2em', color: '#333', textTransform: 'uppercase' }}>
            © {new Date().getFullYear()} ONYX
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: '0.2em', color: '#333', textTransform: 'uppercase' }}>
            Made to order · Finished by hand
          </span>
        </div>
      </footer>

    </main>
  );
}