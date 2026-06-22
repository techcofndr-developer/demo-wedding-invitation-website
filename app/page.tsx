"use client";

import React, { useState, useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import WeddingScroll from "@/components/WeddingScroll";
import FinalInvitation from "@/components/FinalInvitation";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Detect user preferences for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMotionPreferenceChange);
    return () => mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
  }, []);

  const handleLoadingComplete = (loadedImages: HTMLImageElement[], loadedColors: string[]) => {
    setImages(loadedImages);
    setColors(loadedColors);
    setLoading(false);
  };

  return (
    <main 
      id="scrubber-section" 
      className="relative min-h-screen bg-[#fdf7d5] overflow-x-clip selection:bg-[#d4af37]/20 selection:text-[#5c4a3c]"
      style={{ transition: "background-color 0.8s ease" }}
    >
      <Navbar />
      <AnimatePresence mode="wait">
        {/* Loading Screen */}
        {loading && !prefersReducedMotion && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-50"
          >
            <LoadingScreen onComplete={handleLoadingComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Layout */}
      {prefersReducedMotion ? (
        // Render final invitation immediately if user prefers reduced motion
        <div className="pt-16">
          <FinalInvitation />
        </div>
      ) : (
        // Standard scrollytelling path
        <>
          {images.length > 0 && <WeddingScroll images={images} colors={colors} />}
          <div className="relative z-20 shadow-[0_-20px_40px_rgba(92,74,60,0.08)]">
            <FinalInvitation />
          </div>
        </>
      )}
    </main>
  );
}
