"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Calendar, Mail } from "lucide-react";

export default function Navbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("story");

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Expand navigation menu if scrolled past 25% of viewport
      if (scrollY > viewportHeight * 0.25) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }

      // Robust Scroll Spy logic: find which section top is closest to the viewport active zone
      const sections = [
        { id: "scrubber-section", name: "story" },
        { id: "invitation-section", name: "invitation" },
        { id: "events-timeline", name: "schedule" },
        { id: "rsvp-section", name: "rsvp" }
      ];

      let currentActive = "story";
      let minDistance = Infinity;

      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(rect.top);
          // Highlight the section closest to the top of the viewport
          if (rect.top <= viewportHeight * 0.45 && distance < minDistance) {
            minDistance = distance;
            currentActive = section.name;
          }
        }
      });

      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial run
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavClick = (sectionName: string, targetId: string) => {
    setActiveSection(sectionName);
    scrollToSection(targetId);
  };

  const navItems = [
    // Removed the icon for Story (icon: null)
    { label: "Story", section: "story", targetId: "scrubber-section", icon: null },
    { label: "Details", section: "invitation", targetId: "invitation-section", icon: Heart },
    { label: "Schedule", section: "schedule", targetId: "events-timeline", icon: Calendar },
    { label: "RSVP", section: "rsvp", targetId: "rsvp-section", icon: Mail }
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 select-none">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* COLLAPSED STATE: A tiny glowing gold emblem */
          <motion.button
            key="collapsed-emblem"
            initial={{ opacity: 0, scale: 0.7, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 15 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsExpanded(true)}
            className="w-12 h-12 rounded-full bg-[#fdfdfc]/90 backdrop-blur-md border border-[#d4af37]/45 flex items-center justify-center shadow-[0_10px_25px_rgba(212,175,55,0.2)] hover:border-[#d4af37] transition-all duration-300 relative group"
            title="Expand Navigation"
          >
            <span className="absolute inset-0 rounded-full border border-[#d4af37]/20 animate-ping opacity-40 scale-105 pointer-events-none" />
            <Heart className="w-5 h-5 text-[#d4af37] fill-[#d4af37]/10 group-hover:fill-[#d4af37]/20 transition-all" />
          </motion.button>
        ) : (
          /* EXPANDED STATE: Sleek glassmorphic menu bar */
          <motion.nav
            key="expanded-bar"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#fdfdfc]/90 backdrop-blur-md border border-[#d4af37]/45 rounded-full px-5 py-2.5 shadow-[0_15px_35px_rgba(92,74,60,0.09)] flex items-center space-x-1 md:space-x-2 text-[10px] md:text-xs uppercase tracking-widest font-semibold font-sans text-[#4a3b32]"
            onMouseLeave={() => {
              if (window.scrollY < window.innerHeight * 0.25) {
                setIsExpanded(false);
              }
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.section;

              return (
                <button
                  key={item.section}
                  onClick={() => handleNavClick(item.section, item.targetId)}
                  className={`relative px-3.5 py-2 rounded-full transition-colors duration-300 flex items-center space-x-1.5 active:scale-95 ${
                    isActive ? "text-[#1c140e] font-extrabold" : "hover:text-[#1c140e] hover:font-bold"
                  }`}
                >
                  {/* Active background pill highlight capsule */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-[#d4af37]/20 rounded-full border border-[#d4af37]/45 -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {/* Conditionally render icon if defined */}
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#b8901c]" : "text-[#7c6655]"}`} />}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
