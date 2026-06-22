"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useScroll, motion, AnimatePresence } from "framer-motion";

interface WeddingScrollProps {
  images: HTMLImageElement[];
  colors: string[];
}

export default function WeddingScroll({ images, colors }: WeddingScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  const [hintText, setHintText] = useState("Scroll to Unfold the Magic");
  
  // Keep track of the current frame and the last rendered frame using refs 
  // to avoid React re-renders on every single scroll event (which drops FPS).
  const currentFrameIndexRef = useRef<number>(0);
  const lastRenderedFrameRef = useRef<number>(-1);

  // Capture scroll progress of the 500vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Render function to draw image frame on canvas
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !images || images.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = images[index];
    if (!img) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate containment scaling (contain fit)
    const imgWidth = img.width;
    const imgHeight = img.height;
    const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);

    const x = (canvasWidth - imgWidth * scale) / 2;
    const y = (canvasHeight - imgHeight * scale) / 2;

    // Draw the image scaled and centered
    ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
  }, [images]);

  // Set initial background color when colors array is loaded
  useEffect(() => {
    if (colors && colors.length > 0) {
      const mainSec = document.getElementById("scrubber-section");
      if (mainSec) {
        mainSec.style.backgroundColor = colors[0];
      }
    }
  }, [colors]);

  // Listen to scroll progress changes and map to frame index
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const totalFrames = images.length;
      if (totalFrames === 0) return;
      
      // Map scroll progress (0 -> 1) to frame index (0 -> totalFrames - 1)
      const index = Math.min(
        totalFrames - 1,
        Math.max(0, Math.floor(latest * totalFrames))
      );
      currentFrameIndexRef.current = index;

      // Dynamically update the page background color to match the active frame
      if (colors && colors.length > index) {
        const mainSec = document.getElementById("scrubber-section");
        if (mainSec) {
          mainSec.style.backgroundColor = colors[index];
        }
      }

      // Update dynamic scroll hint text
      if (latest < 0.25) {
        setHintText("Scroll to Unfold the Magic");
      } else if (latest < 0.65) {
        setHintText("A Celebration of Love");
      } else if (latest < 0.90) {
        setHintText("Shubham & Prachi");
      } else {
        setHintText("Revealing the Invitation");
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, images.length, colors]);

  // RequestAnimationFrame rendering loop
  useEffect(() => {
    const render = () => {
      const currentIndex = currentFrameIndexRef.current;
      if (currentIndex !== lastRenderedFrameRef.current) {
        drawFrame(currentIndex);
        lastRenderedFrameRef.current = currentIndex;
      }
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [images, drawFrame]);

  // Handle canvas resizing and device pixel ratio adjustments (Retina/4K screen support)
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Set backing store dimensions to match device resolution
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Force drawing of current frame on resize
      drawFrame(currentFrameIndexRef.current);
    };

    // Initialize dimensions
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [images, drawFrame]);

  return (
    <div ref={containerRef} className="relative h-[500vh] w-full">
      {/* Sticky viewport container for the canvas */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-transparent">
        <canvas
          ref={canvasRef}
          className="w-full h-full block object-contain pointer-events-none"
        />

        {/* Dynamic elegant overlay hints */}
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30 select-none text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={hintText}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="bg-[#fdfdfc]/90 backdrop-blur-md border border-[#d4af37]/45 rounded-full px-5 py-2.5 shadow-[0_10px_25px_rgba(92,74,60,0.06)] mb-3 flex items-center justify-center"
            >
              <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-[#2d221b] font-bold font-sans">
                {hintText}
              </span>
            </motion.div>
          </AnimatePresence>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-[1px] h-8 bg-gradient-to-b from-[#d4af37] to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
