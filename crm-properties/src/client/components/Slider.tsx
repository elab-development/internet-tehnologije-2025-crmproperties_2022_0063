// src/client/components/Slider.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

// Reusable slider koji prikazuje slike iz /public foldera.
// Ocekivane slike: /public/slide1.jpg ... /public/slide5.jpg
import type { SliderProps } from "../types/sliderProps";

export default function Slider({
  className = "",
  intervalMs = 4000,
  showDots = true,
}: SliderProps) {
  // Lista slika (fiksno, zbog pocetnika i jednostavnosti).
  const slides = useMemo(
    () => ["/slide1.jpg", "/slide2.jpg", "/slide3.jpg", "/slide4.jpg", "/slide5.jpg"],
    []
  );

  const [index, setIndex] = useState(0);

  // Auto-play: na svakih intervalMs menjamo sliku.
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, slides.length]);

  function goPrev() {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }

  function goNext() {
    setIndex((prev) => (prev + 1) % slides.length);
  }

  return (
    <div className={["relative overflow-hidden rounded-3xl", className].join(" ")}>
      {/* Slika */}
      <div className="relative h-[520px] w-full">
        <Image
          key={slides[index]} // key koristimo da se slika lakse “zameni” pri prelazu.
          src={slides[index]}
          alt={`Slide ${index + 1}`}
          fill
          priority={index === 0}
          className="object-cover"
        />

        {/* Gradient overlay da tekst (ako bude) bude citljiv */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/0" />
      </div>

      {/* Kontrole (levo/desno) */}
      <button
        type="button"
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/35 px-3 py-2 text-sm text-white backdrop-blur hover:bg-black/45"
        aria-label="Previous slide"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/35 px-3 py-2 text-sm text-white backdrop-blur hover:bg-black/45"
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Tackice */}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={[
                "h-2.5 w-2.5 rounded-full border border-white/25 transition",
                i === index ? "bg-white" : "bg-white/25 hover:bg-white/40",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
