import { motion } from "motion/react";
import type { ReactNode } from "react";

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function MaskLine({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={`block overflow-hidden pb-1 ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "112%" }}
        animate={{ y: "0%" }}
        transition={{ delay, duration: 0.9, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration: 0.7, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  kicker,
  title,
  copy,
}: {
  kicker: string;
  title: ReactNode;
  copy?: string;
}) {
  return (
    <FadeIn className="mb-14 max-w-2xl">
      <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
        {kicker}
      </p>
      <h2 className="font-heading text-3xl font-black uppercase leading-none tracking-tight text-slate-100 sm:text-4xl">
        {title}
      </h2>
      {copy && <p className="mt-4 leading-relaxed text-slate-400">{copy}</p>}
    </FadeIn>
  );
}
