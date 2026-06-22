"use client";

import React, { useState, useEffect, useRef } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import WeddingScroll from "@/components/WeddingScroll";
import FinalInvitation from "@/components/FinalInvitation";
import Navbar from "@/components/Navbar";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Initialize audio file
  useEffect(() => {
    // Configure background audio
    audioRef.current = new Audio("/audio/music.mp3");
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleLoadingComplete = (loadedImages: HTMLImageElement[], loadedColors: string[]) => {
    setImages(loadedImages);
    setColors(loadedColors);
    setLoading(false);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.warn("Audio playback was blocked or failed: ", error);
          alert("Please place your background music MP3 at 'public/audio/music.mp3' to enable playback.");
        });
    }
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

      {/* Luxury Music Control (Top Right) */}
      {!loading || prefersReducedMotion ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="fixed top-6 right-6 z-40"
        >
          <button
            onClick={toggleMusic}
            className="flex items-center space-x-2 px-3 py-2 bg-[#fdfdfc]/80 backdrop-blur-sm border border-[#d4af37]/35 hover:border-[#d4af37] text-[#5c4a3c] rounded-full shadow-sm hover:shadow-md transition-all duration-300 group"
            title={isPlaying ? "Mute Background Music" : "Play Background Music"}
          >
            <span className="relative flex h-2 w-2 items-center justify-center">
              {isPlaying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]"></span>
            </span>
            
            {isPlaying ? (
              <Volume2 className="w-4 h-4 text-[#d4af37] transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#a39081] transition-transform duration-300 group-hover:scale-110" />
            )}
            
            <span className="text-[10px] tracking-wider uppercase pr-1 font-semibold hidden md:inline">Music</span>
          </button>
        </motion.div>
      ) : null}

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
