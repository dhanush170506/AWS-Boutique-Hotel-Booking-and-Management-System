import React from 'react';

export default function SectionTitle({ eyebrow, title, description, align = "center" }) {
  return (
    <div className={`mx-auto mb-10 max-w-3xl ${align === "center" ? "text-center" : ""}`}>
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-champagne">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-bold text-ivory md:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-8 text-ivory/68">{description}</p>}
    </div>
  );
}
