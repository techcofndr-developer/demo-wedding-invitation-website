"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Phone, Heart, Mail, Check, Sparkles, Clock, ChevronDown } from "lucide-react";

interface Petal {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
}

// TODO: Replace with the couple's WhatsApp number (including country code, e.g., '91' for India)
const RSVP_PHONE_NUMBER = "916354281300";

// TODO: Replace with your Google Apps Script Web App URL to enable background Google Sheet logging
const RSVP_GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbx9TS1_FGl1Z1gjc0T-jDGPouB3RVq_sR00JhlpjiDkyL_AnHk9hzzGVBxdEOQdNtF_/exec";

export default function FinalInvitation() {
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    attendance: "yes",
    guests: "1",
    message: ""
  });
  const [petals, setPetals] = useState<Petal[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close custom dropdown on click outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClose = () => setIsDropdownOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [isDropdownOpen]);

  // Generate falling flower petals on client mount
  useEffect(() => {
    const generatedPetals = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage width
      size: Math.random() * 14 + 10, // size in px
      delay: Math.random() * 8, // delay start
      duration: Math.random() * 10 + 8, // duration to fall
      rotate: Math.random() * 360
    }));
    setPetals(generatedPetals);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    const attendanceText = 
      formData.attendance === "yes" ? "Yes, attending gladly" : 
      formData.attendance === "no" ? "No, regrettably cannot attend" : "Unsure, will confirm soon";

    const guestsText = formData.attendance !== "no" ? `${formData.guests} Guest(s)` : "None";
    const wishesText = formData.message.trim() ? formData.message : "Sending love and blessings!";

    const payload = {
      name: formData.name,
      attendance: attendanceText,
      guests: guestsText,
      message: wishesText
    };

    if (RSVP_GOOGLE_SHEETS_URL && RSVP_GOOGLE_SHEETS_URL.startsWith("http")) {
      try {
        await fetch(RSVP_GOOGLE_SHEETS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("Error submitting RSVP to Google Sheets:", err);
      }
    } else {
      console.warn("Google Sheets URL is not configured. Logged RSVP data locally:", payload);
    }

    setIsSubmitting(false);
    setRsvpSubmitted(true);
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent("Wedding of Shubham & Prachi");
    const dates = "20250223T130000Z/20250223T180000Z";
    const details = encodeURIComponent("Together with their families, Shubham & Prachi invite you to celebrate their wedding.");
    const location = encodeURIComponent("Kantam Party Plot, Sindhubhavan Road, PRL Colony, Thaltej, Ahmedabad, Gujarat 380058");
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    window.open(gcalUrl, "_blank");
  };

  const handleViewLocation = () => {
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent("Kantam Party Plot, Sindhubhavan Road, Thaltej, Ahmedabad, Gujarat")}`;
    window.open(mapsUrl, "_blank");
  };

  const handleVenueMap = (venueQuery: string) => {
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(venueQuery)}`;
    window.open(mapsUrl, "_blank");
  };

  const handleContactUs = () => {
    const whatsappUrl = `https://wa.me/${RSVP_PHONE_NUMBER}?text=${encodeURIComponent("Hi, reaching out regarding the wedding celebrations of Shubham Shah & Prachi Sanghavi.")}`;
    window.open(whatsappUrl, "_blank");
  };

  const fadeInVariant: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  // Schedule events list for Shubham & Prachi with specific map search terms
  const events = [
    {
      title: "Carnival-e-Mehendi",
      date: "Friday, 21 February 2025",
      time: "04:30 PM onwards",
      desc: "Delicate henna patterns, folk music, and vibrant colors to kickstart the celebrations.",
      venue: "Mansarovar Farm, Telav",
      mapQuery: "Mansarovar Farm, Telav, Ahmedabad, Gujarat",
      notes: "Followed by Dinner"
    },
    {
      title: "Ganesh & Haldi Jashn",
      subtitle: "(Peele Phoolo Ka Jashn)",
      date: "Saturday, 22 February 2025",
      time: "08:30 AM onwards",
      desc: "An auspicious morning smeared with yellow turmeric and fresh marigold showers.",
      venue: "Riviera Antilia, Corporate Road, Prahlad Nagar, Ahmedabad",
      mapQuery: "Riviera Antilia, Corporate Road, Prahlad Nagar, Ahmedabad, Gujarat 380015",
      invitedBy: "Rachana Shah & Jolly Shah",
      notes: "Followed by Lunch"
    },
    {
      title: "Bollywood Evening",
      subtitle: '"Dil Dhadakne Do"',
      date: "Saturday, 22 February 2025",
      time: "06:30 PM onwards",
      desc: "Put on your dancing shoes for a glam-filled evening of music and dance.",
      venue: "Jade Luxury Banquet, SG Highway, Bodakdev, Ahmedabad",
      mapQuery: "Jade Luxury Banquet, 1, Sarkhej–Gandhinagar Highway, Bodakdev, Ahmedabad, Gujarat 380054",
      invitedBy: "Jainam Nirav Shah & Kavya Kiran Shah",
      notes: "Followed by Dinner"
    },
    {
      title: "Wedding Mahotsava",
      date: "Sunday, 23 February 2025",
      time: "06:30 PM onwards",
      desc: "Bless the bride and groom as they walk around the holy fire. Hast Melap at 6:30 PM.",
      venue: "Kantam Party Plot, Sindhubhavan Road, Thaltej, Ahmedabad",
      mapQuery: "Kantam Party Plot, Sindhubhavan Road, Thaltej, Ahmedabad, Gujarat 380058",
      invitedBy: "Rachana & Nirav Shah"
    },
    {
      title: "The Reception Gala",
      subtitle: "Blooming Together",
      date: "Monday, 24 February 2025",
      time: "07:00 PM onwards",
      desc: "Celebrate the union of the newlyweds with a grand dinner reception.",
      venue: "Anokhi Greens, PRL Colony, Thaltej, Ahmedabad",
      mapQuery: "Anokhi Greens, Thaltej, Ahmedabad, Gujarat 380058",
      invitedBy: "Rachana & Nirav Shah"
    }
  ];
  return (
    <div className="w-full bg-transparent text-[#5c4a3c] font-serif overflow-hidden select-none pb-24 relative">
      {/* Falling Flower Petals Rain */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            className="absolute rounded-full bg-gradient-to-tr from-[#f9d976] to-[#e6ab23] opacity-[0.22] shadow-[0_2px_4px_rgba(212,175,55,0.1)]"
            style={{
              left: `${petal.x}%`,
              width: petal.size,
              height: petal.size,
              top: -30,
            }}
            animate={{
              y: ["0vh", "380vh"],
              x: [
                `${petal.x}%`,
                `${petal.x + Math.sin(petal.id) * 6}%`,
                `${petal.x + Math.cos(petal.id) * 12}%`,
                `${petal.x + Math.sin(petal.id + 2) * 6}%`
              ],
              rotate: [petal.rotate, petal.rotate + 360],
            }}
            transition={{
              duration: petal.duration,
              repeat: Infinity,
              delay: petal.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Elegant Line Divider */}
      <div className="relative z-10 flex items-center justify-center my-8">
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]" />
        <Heart className="mx-4 text-[#d4af37] w-4 h-4 fill-[#d4af37] animate-pulse" />
        <div className="w-24 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]" />
      </div>

      {/* SECTION 2: Final Invitation Content Card */}
      <motion.section 
        id="invitation-section"
        className="relative z-10 max-w-4xl mx-auto px-6 py-12 flex flex-col items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {/* Luxury Floating Card Container */}
        <div className="w-full bg-[#fdfdfc]/80 backdrop-blur-md border border-[#d4af37]/45 rounded-3xl p-8 md:p-16 shadow-[0_30px_70px_rgba(92,74,60,0.08)] relative flex flex-col items-center">
          
          {/* Double Gold Card Borders */}
          <div className="absolute inset-4 border border-[#d4af37]/20 rounded-[1.25rem] pointer-events-none" />
          <div className="absolute inset-5 border border-[#d4af37]/10 rounded-[1rem] pointer-events-none" />

          {/* Monogram Emblem */}
          <motion.div 
            variants={fadeInVariant} 
            className="mb-8 w-20 h-20 rounded-full border border-[#d4af37] flex items-center justify-center relative shadow-sm"
          >
            <div className="absolute inset-1.5 border border-[#d4af37]/35 rounded-full" />
            <span className="text-[#c59d27] font-semibold text-xl tracking-[0.15em] font-serif pr-0.5">S&P</span>
          </motion.div>

          <motion.div variants={fadeInVariant} className="flex items-center justify-center space-x-2 text-[#85640c] uppercase tracking-[0.25em] text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="gold-text-glow font-bold">Wedding Invitation</span>
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </motion.div>

          {/* Couple Names & Family Details */}
          <div className="my-4 text-center max-w-2xl px-2">
            <motion.div variants={fadeInVariant} className="mb-8">
              <h1 className="text-4xl md:text-6xl font-normal tracking-[0.06em] text-[#1c140e] leading-tight font-serif mb-2">
                Shubham Shah
              </h1>
              <p className="text-sm md:text-base text-[#3d2f24] tracking-wider mb-1 font-medium font-sans">
                S/o Smt. Rachana Shah & Shri Nirav Shah
              </p>
              <p className="text-xs text-[#85640c] italic tracking-widest font-bold font-serif">
                (Bhalak)
              </p>
            </motion.div>
            
            <motion.div variants={fadeInVariant} className="text-2xl md:text-3xl text-[#85640c] font-light italic my-4 flex justify-center items-center">
              <span className="w-8 h-[1px] bg-[#d4af37]/50 mr-4" />
              &
              <span className="w-8 h-[1px] bg-[#d4af37]/50 ml-4" />
            </motion.div>
            
            <motion.div variants={fadeInVariant} className="mt-8 mb-10">
              <h1 className="text-4xl md:text-6xl font-normal tracking-[0.06em] text-[#1c140e] leading-tight font-serif mb-2">
                Prachi Sanghavi
              </h1>
              <p className="text-sm md:text-base text-[#3d2f24] tracking-wider mb-1 font-medium font-sans">
                D/o Smt. Asha Sanghavi & Shri Yogesh Sanghavi
              </p>
              <p className="text-xs text-[#85640c] italic tracking-widest font-bold font-serif">
                (Bhoringda)
              </p>
            </motion.div>
          </div>

          <motion.p variants={fadeInVariant} className="text-sm md:text-base max-w-lg leading-relaxed text-[#2d221b] mb-12 font-medium italic font-serif text-center">
            Together with their families, they cordially invite you to celebrate their wedding union.
          </motion.p>

          {/* Primary Date (Wedding Ceremony) */}
          <motion.div 
            variants={fadeInVariant}
            className="border-y border-[#d4af37]/35 py-8 w-full max-w-xl flex flex-col md:flex-row justify-around items-center space-y-6 md:space-y-0 my-4"
          >
            <div className="text-center md:border-r border-[#d4af37]/20 md:pr-10 w-full md:w-1/2">
              <p className="uppercase tracking-[0.2em] text-xs text-[#4a3b32] mb-2 font-bold">Sunday</p>
              <p className="text-4xl text-[#1c140e] font-bold">23rd</p>
              <p className="uppercase tracking-[0.1em] text-sm text-[#1c140e] mt-1 font-bold">February 2025</p>
            </div>
            <div className="text-center w-full md:w-1/2 md:pl-10">
              <p className="uppercase tracking-[0.2em] text-xs text-[#4a3b32] mb-2 font-bold">Hast Melap At</p>
              <p className="text-3xl text-[#1c140e] font-bold">06:30 PM</p>
              <p className="uppercase tracking-[0.1em] text-sm text-[#1c140e] mt-1 font-bold">Onwards</p>
            </div>
          </motion.div>

          {/* Venue Card */}
          <motion.div variants={fadeInVariant} className="mt-10 flex flex-col items-center text-center px-4 max-w-md">
            <MapPin className="text-[#85640c] w-6 h-6 mb-3 animate-pulse" />
            <h3 className="uppercase tracking-[0.2em] text-xs font-bold text-[#4a3b32] mb-2">Main Venue</h3>
            <p className="text-2xl text-[#1c140e] font-bold tracking-wide">Kantam Party Plot</p>
            <p className="text-sm text-[#3d2f24] font-semibold mt-2 font-serif leading-relaxed">
              Sindhubhavan Road, PRL Colony, Thaltej, Ahmedabad, Gujarat 380058
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* DETAILED TIMELINE OF EVENTS */}
      <span id="events-timeline" className="block h-10" />
      <motion.section 
        className="relative z-10 max-w-4xl mx-auto px-6 py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeInVariant}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-[#3d2f24] tracking-[0.15em] uppercase font-light mb-2">
            Wedding Schedule
          </h2>
          <div className="w-16 h-[1.5px] bg-[#d4af37] mx-auto mt-4" />
        </div>

        {/* Vertical Timeline structure */}
        <div className="relative w-full mx-auto mt-12">
          {/* Vertical central line (desktop: centered, mobile: left-4) */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-[#d4af37]/45 -translate-x-1/2" />

          {events.map((event, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <div key={idx} className="relative mb-12 md:mb-16 flex flex-col md:flex-row items-stretch md:items-center">
                {/* Timeline node circle (small elegant solid gold dot) */}
                <div className="absolute left-4 md:left-1/2 top-4 md:top-1/2 -translate-y-1/2 md:-translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#d4af37] border-2 border-[#fdfdfc] z-10 shadow-sm" />

                {/* Left Card Column (Desktop: Even item shows card, Odd item shows invisible placeholder. Mobile: Even item shows card with pl-12) */}
                <div className="w-full md:w-1/2 pr-0 md:pr-10 text-left md:text-right pl-12 md:pl-0">
                  {isEven ? (
                    <div className="bg-[#fdfdfc]/95 backdrop-blur-sm p-6 rounded-2xl border border-[#d4af37]/45 hover:border-[#d4af37]/80 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="text-xs text-[#85640c] tracking-widest uppercase font-bold mb-1 flex items-center justify-start md:justify-end">
                        <Clock className="w-3.5 h-3.5 mr-1 text-[#85640c]" /> {event.time}
                      </div>
                      <h4 className="text-lg text-[#1c140e] font-bold mb-1">{event.title}</h4>
                      {event.subtitle && (
                        <p className="text-xs text-[#85640c] font-bold tracking-wider mb-2 italic">{event.subtitle}</p>
                      )}
                      <p className="text-xs text-[#3d2f24] font-semibold mb-2">{event.date}</p>
                      <p className="text-sm text-[#2d221b] font-medium leading-relaxed mb-3">{event.desc}</p>
                      
                      {event.notes && (
                        <p className="text-xs text-[#85640c] italic font-bold tracking-wide mb-3">({event.notes})</p>
                      )}
                      
                      <div className="border-t border-[#e6ded4] pt-3 flex flex-col items-start md:items-end">
                        <p className="text-[10px] text-[#4a3b32] uppercase tracking-wider font-bold">Venue</p>
                        <p className="text-xs text-[#1c140e] font-bold mt-0.5">{event.venue}</p>
                        {event.invitedBy && (
                          <p className="text-[11px] text-[#3d2f24] font-semibold mt-1.5 italic font-serif">Invited by: {event.invitedBy}</p>
                        )}
                        <button 
                          onClick={() => handleVenueMap(event.mapQuery)}
                          className="inline-flex items-center space-x-1 text-xs text-[#85640c] hover:text-[#5c4508] uppercase tracking-wider font-bold mt-3 transition-colors duration-200 group"
                        >
                          <MapPin className="w-3.5 h-3.5 mr-0.5 group-hover:scale-110 transition-transform text-[#85640c]" />
                          <span>Google Maps Directions</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:block opacity-0 pointer-events-none w-full" />
                  )}
                </div>

                {/* Right Card Column (Desktop: Odd item shows card, Even item shows invisible placeholder. Mobile: Odd item shows card with pl-12) */}
                <div className="w-full md:w-1/2 pl-12 md:pl-10 text-left mt-4 md:mt-0">
                  {!isEven ? (
                    <div className="bg-[#fdfdfc]/95 backdrop-blur-sm p-6 rounded-2xl border border-[#d4af37]/45 hover:border-[#d4af37]/80 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="text-xs text-[#85640c] tracking-widest uppercase font-bold mb-1 flex items-center justify-start">
                        <Clock className="w-3.5 h-3.5 mr-1 text-[#85640c]" /> {event.time}
                      </div>
                      <h4 className="text-lg text-[#1c140e] font-bold mb-1">{event.title}</h4>
                      {event.subtitle && (
                        <p className="text-xs text-[#85640c] font-bold tracking-wider mb-2 italic">{event.subtitle}</p>
                      )}
                      <p className="text-xs text-[#3d2f24] font-semibold mb-2">{event.date}</p>
                      <p className="text-sm text-[#2d221b] font-medium leading-relaxed mb-3">{event.desc}</p>
                      
                      {event.notes && (
                        <p className="text-xs text-[#85640c] italic font-bold tracking-wide mb-3">({event.notes})</p>
                      )}
                      
                      <div className="border-t border-[#e6ded4] pt-3 flex flex-col items-start">
                        <p className="text-[10px] text-[#4a3b32] uppercase tracking-wider font-bold">Venue</p>
                        <p className="text-xs text-[#1c140e] font-bold mt-0.5">{event.venue}</p>
                        {event.invitedBy && (
                          <p className="text-[11px] text-[#3d2f24] font-semibold mt-1.5 italic font-serif">Invited by: {event.invitedBy}</p>
                        )}
                        <button 
                          onClick={() => handleVenueMap(event.mapQuery)}
                          className="inline-flex items-center space-x-1 text-xs text-[#85640c] hover:text-[#5c4508] uppercase tracking-wider font-bold mt-3 transition-colors duration-200 group"
                        >
                          <MapPin className="w-3.5 h-3.5 mr-0.5 group-hover:scale-110 transition-transform text-[#85640c]" />
                          <span>Google Maps Directions</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:block opacity-0 pointer-events-none w-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* CTA ACTIONS BUTTONS WITH GOLD SHIMMER */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-10 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "RSVP Now", icon: Mail, onClick: () => document.getElementById("rsvp-section")?.scrollIntoView({ behavior: "smooth" }) },
            { label: "Add to Calendar", icon: Calendar, onClick: handleAddToCalendar },
            { label: "View Location", icon: MapPin, onClick: handleViewLocation },
            { label: "Contact Us", icon: Phone, onClick: handleContactUs }
          ].map((btn, idx) => {
            const Icon = btn.icon;
            return (
               <button 
                key={idx}
                onClick={btn.onClick}
                className="relative overflow-hidden flex flex-col items-center justify-center p-5 bg-[#fdfdfc]/95 border border-[#d4af37]/50 rounded-2xl hover:border-[#d4af37] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
              >
                {/* Shimmer effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 block transform -skew-x-12 bg-gradient-to-r from-transparent to-[#d4af37]/10 opacity-30 group-hover:animate-[shimmer_1.2s_ease-in-out_infinite]" style={{ left: '-100%' }} />
                
                <Icon className="w-5.5 h-5.5 text-[#85640c] mb-2.5 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-xs tracking-wider uppercase font-bold text-[#2d221b]">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* SIDE-BY-SIDE RSVP & LOCATION LAYOUT */}
      <span id="rsvp-section" className="block h-10" />
      <motion.section 
        className="relative z-10 max-w-5xl mx-auto px-6 py-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInVariant}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* COLUMN 1: RSVP Box */}
          <div className="bg-[#fdfdfc]/95 backdrop-blur-sm border border-[#d4af37]/50 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(92,74,60,0.04)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-6 -right-6 text-[#d4af37]/8 pointer-events-none select-none font-bold text-7xl font-serif">
              S&P
            </div>
            
            <div>
              <h2 className="text-2xl md:text-3xl text-[#1c140e] tracking-[0.2em] text-center uppercase font-bold mb-6">
                R.S.V.P
              </h2>
              
              {!rsvpSubmitted ? (
                <form onSubmit={handleRsvpSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#4a3b32] font-bold mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#fdfbf7] border border-[#d4af37]/50 rounded-xl text-sm text-[#1c140e] font-medium placeholder:text-[#a39081] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#4a3b32] font-bold mb-2">
                      Will You Attend?
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDropdownOpen(!isDropdownOpen);
                        }}
                        className="w-full px-4 py-3 bg-[#fdfbf7] border border-[#d4af37]/50 rounded-xl text-sm text-[#1c140e] font-medium text-left focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all duration-200 flex items-center justify-between"
                      >
                        <span>
                          {formData.attendance === "yes" && "Yes, I will attend gladly"}
                          {formData.attendance === "no" && "No, regrettably I cannot attend"}
                          {formData.attendance === "maybe" && "Unsure, will confirm soon"}
                        </span>
                        <motion.span
                          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4.5 h-4.5 text-[#85640c]" />
                        </motion.span>
                      </button>
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-30 w-full mt-2 bg-[#fdfdfc] border border-[#d4af37]/50 rounded-xl shadow-lg overflow-hidden"
                          >
                            {[
                              { value: "yes", label: "Yes, I will attend gladly" },
                              { value: "no", label: "No, regrettably I cannot attend" },
                              { value: "maybe", label: "Unsure, will confirm soon" }
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, attendance: opt.value }));
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 ${
                                  formData.attendance === opt.value
                                    ? "bg-[#d4af37]/15 text-[#1c140e] font-bold"
                                    : "text-[#5c4a3c] hover:bg-[#fdfbf7] hover:text-[#1c140e]"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {formData.attendance !== "no" && (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[#4a3b32] font-bold mb-2">
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        name="guests"
                        min="1"
                        max="20"
                        required
                        placeholder="Enter number of guests"
                        value={formData.guests}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#fdfbf7] border border-[#d4af37]/50 rounded-xl text-sm text-[#1c140e] font-medium placeholder:text-[#a39081] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all duration-200"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#4a3b32] font-bold mb-2">
                      Wishes & Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      placeholder="Send your warm wishes to the couple"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#fdfbf7] border border-[#d4af37]/50 rounded-xl text-sm text-[#1c140e] font-medium placeholder:text-[#a39081] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 transition-all duration-200 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#4a3b32] hover:bg-[#2d1f18] disabled:bg-[#a39081] text-white tracking-[0.2em] uppercase font-bold text-xs rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] select-none flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Response</span>
                    )}
                  </button>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10 flex flex-col items-center justify-center"
                >
                  <div className="w-14 h-14 bg-[#d4af37]/15 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-6 h-6 text-[#d4af37]" />
                  </div>
                  <h3 className="text-xl text-[#3d2f24] mb-2 font-medium">Response Received</h3>
                  <p className="text-sm text-[#7c6655] max-w-xs leading-relaxed mb-6 font-serif">
                    Thank you for sending your response! Your wishes have been delivered to Shubham & Prachi.
                  </p>
                  <button
                    onClick={() => setRsvpSubmitted(false)}
                    className="px-6 py-2 border border-[#d4af37]/60 text-xs tracking-wider uppercase rounded-full text-[#d4af37] hover:bg-[#d4af37] hover:text-white transition-all duration-200"
                  >
                    Edit Response
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* COLUMN 2: Premium Location & Map */}
          <div id="venue-section" className="bg-[#fdfdfc]/95 backdrop-blur-sm border border-[#d4af37]/50 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(92,74,60,0.04)] relative overflow-hidden flex flex-col justify-between items-center text-center">
            {/* Grid pattern background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e6ded4_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-30" />
            <div className="absolute inset-4 border border-[#d4af37]/15 rounded-[1.25rem] pointer-events-none" />
            
            <div className="my-auto z-10 px-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-[#85640c]" />
              </div>
              
              <h3 className="text-xs text-[#85640c] uppercase tracking-[0.2em] font-bold mb-2">Location Map</h3>
              <h4 className="text-2xl text-[#1c140e] font-bold tracking-wide mb-3">Kantam Party Plot</h4>
              
              <p className="text-sm text-[#2d221b] font-medium leading-relaxed mb-1 font-serif">
                Sindhubhavan Road, PRL Colony
              </p>
              <p className="text-sm text-[#2d221b] font-medium leading-relaxed mb-4 font-serif">
                Thaltej, Ahmedabad, Gujarat 380058
              </p>
              
              <p className="text-xs text-[#5c4a3c] font-semibold leading-relaxed mb-8 max-w-xs">
                Main ceremony venue. Valet parking, golf-cart shuttles, and reception gates are situated directly on Sindhubhavan Road.
              </p>
              
              <button
                onClick={handleViewLocation}
                className="relative overflow-hidden px-8 py-3.5 bg-[#4a3b32] text-white hover:bg-[#2d1f18] text-xs uppercase font-bold tracking-widest rounded-full transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] group"
              >
                {/* Shimmer sweep */}
                <div className="absolute top-0 -inset-full h-full w-1/2 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-30 group-hover:animate-[shimmer_1.2s_ease-in-out_infinite]" style={{ left: '-100%' }} />
                Open Google Maps
              </button>
            </div>
          </div>

        </div>
      </motion.section>

      {/* Footer message */}
      <footer className="relative z-10 text-center pt-16 pb-8 border-t border-[#d4af37]/15">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#4a3b32] font-bold">
          We look forward to celebrating with you.
        </p>
        <p className="text-[9px] uppercase tracking-[0.2em] text-[#5c4a3c] font-medium mt-3 font-sans">
          © 2025 Shubham & Prachi. Made with Love.
        </p>
      </footer>
    </div>
  );
}
