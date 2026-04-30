"use client";

import { useEffect, useState } from "react";

// Tip za jednu Pexels sliku.
type PexelsImage = {
  id: number;
  alt: string;
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
  };
};

// Custom hook za učitavanje slika sa Pexels API-ja.
export default function usePexelsImages(query: string = "modern real estate") {
  // Čuvamo slike sa jasnim tipom.
  const [images, setImages] = useState<PexelsImage[]>([]);

  // Čuvamo loading stanje.
  const [loading, setLoading] = useState(true);

  // Čuvamo grešku.
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(
            query
          )}&per_page=6`,
          {
            headers: {
              Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || "",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch images from Pexels.");
        }

        const data = await response.json();
        setImages(data.photos || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load images.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [query]);

  return { images, loading, error };
}