"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import usePexelsImages from "@/hooks/usePexelsImages";

type SliderProps = {
  query?: string;
  title?: string;
};

// Reusable slider komponenta za prikaz slika.
export default function Slider({
  query = "modern real estate",
  title = "Featured Properties Inspiration",
}: SliderProps) {
  // Koristimo custom hook za učitavanje slika.
  const { images, loading, error } = usePexelsImages(query);

  // Čuvamo indeks trenutno aktivne slike.
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatska promena slike na svake 3 sekunde.
  useEffect(() => {
    if (!images.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((previous) =>
        previous === images.length - 1 ? 0 : previous + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  // Ručno pomeranje na prethodnu sliku.
  const handlePrevious = () => {
    setCurrentIndex((previous) =>
      previous === 0 ? images.length - 1 : previous - 1
    );
  };

  // Ručno pomeranje na sledeću sliku.
  const handleNext = () => {
    setCurrentIndex((previous) =>
      previous === images.length - 1 ? 0 : previous + 1
    );
  };

  if (loading) {
    return (
      <div className="app-card-accent">
        <h2 style={{ fontSize: "26px", fontWeight: "800", marginBottom: "12px" }}>
          {title}
        </h2>
        <p className="text-soft">Loading slider images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-card-accent">
        <h2 style={{ fontSize: "26px", fontWeight: "800", marginBottom: "12px" }}>
          {title}
        </h2>
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="app-card-accent">
        <h2 style={{ fontSize: "26px", fontWeight: "800", marginBottom: "12px" }}>
          {title}
        </h2>
        <p className="text-soft">No images available.</p>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="app-card-accent">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ fontSize: "26px", fontWeight: "800" }}>{title}</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handlePrevious} className="secondary-button">
            Prev
          </button>
          <button onClick={handleNext} className="secondary-button">
            Next
          </button>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "360px",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Image
          src={currentImage.src.large}
          alt={currentImage.alt || "Slider image"}
          fill
          priority
          style={{
            objectFit: "cover",
          }}
        />
      </div>

      <div style={{ marginTop: "14px" }}>
        <p className="text-soft" style={{ lineHeight: "1.7" }}>
          {currentImage.alt || "Modern real estate inspiration image."}
        </p>
      </div>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background:
                index === currentIndex
                  ? "#ffb15c"
                  : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}