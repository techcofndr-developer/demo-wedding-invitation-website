"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, Mail, CheckCircle, XCircle, HelpCircle, Search, 
  RefreshCw, LogOut, ArrowLeft, MessageSquare, Users, Sparkles 
} from "lucide-react";
import Link from "next/link";

// Configuration Constants
const ADMIN_PASSCODE = "ShubhamPrachi2025";
const RSVP_GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbx9TS1_FGl1Z1gjc0T-jDGPouB3RVq_sR00JhlpjiDkyL_AnHk9hzzGVBxdEOQdNtF_/exec";

interface RSVPRecord {
  timestamp: string;
  name: string;
  attendance: "yes" | "no" | "maybe";
  guests: number;
  message: string;
}

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);

  // Data states
  const [records, setRecords] = useState<RSVPRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Table filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "yes" | "no" | "maybe">("all");

  // Check auth session on mount
  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Dynamically normalize spreadsheet keys to guard against column header renames
  const normalizeData = useCallback((data: unknown[]) => {
    const normalized = data.map((rawItem: unknown) => {
      const item = rawItem as Record<string, unknown>;
      const keys = Object.keys(item);
      
      const nameKey = keys.find(k => k.toLowerCase().includes("name") || k.toLowerCase().includes("fullname")) || keys[1] || "name";
      const attendKey = keys.find(k => k.toLowerCase().includes("attend") || k.toLowerCase().includes("status")) || keys[2] || "attendance";
      const guestKey = keys.find(k => k.toLowerCase().includes("guest") || k.toLowerCase().includes("number")) || keys[3] || "guests";
      const msgKey = keys.find(k => k.toLowerCase().includes("message") || k.toLowerCase().includes("wish") || k.toLowerCase().includes("note")) || keys[4] || "message";
      const timeKey = keys.find(k => k.toLowerCase().includes("time") || k.toLowerCase().includes("date") || k.toLowerCase().includes("stamp")) || keys[0] || "timestamp";

      const rawAttend = String(item[attendKey] || "").toLowerCase();
      let attendance: "yes" | "no" | "maybe" = "maybe";
      if (rawAttend.startsWith("yes") || rawAttend === "yes" || rawAttend.includes("gladly")) {
        attendance = "yes";
      } else if (rawAttend.startsWith("no") || rawAttend === "no" || rawAttend.includes("regret") || rawAttend.includes("cannot")) {
        attendance = "no";
      }

      // Convert timestamp to readable string
      let formattedTime = "N/A";
      if (item[timeKey]) {
        try {
          const date = new Date(String(item[timeKey]));
          if (!isNaN(date.getTime())) {
            formattedTime = date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            });
          }
        } catch {
          formattedTime = String(item[timeKey]);
        }
      }

      return {
        timestamp: formattedTime,
        name: String(item[nameKey] || "Unknown Guest"),
        attendance,
        guests: parseInt(String(item[guestKey])) || 0,
        message: String(item[msgKey] || "")
      };
    });

    setRecords(normalized);
  }, []);

  const fetchRSVPs = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch(RSVP_GOOGLE_SHEETS_URL, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        normalizeData(data);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      console.error("Failed to fetch RSVPs:", err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [normalizeData]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchRSVPs();
    }
  }, [isAuthenticated, fetchRSVPs]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      sessionStorage.setItem("admin_auth", "true");
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Incorrect passcode. Please try again.");
      setPasscode("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setRecords([]);
  };

  // Calculated metrics
  const totalResponses = records.length;
  const attendingCount = records.filter(r => r.attendance === "yes").length;
  const notAttendingCount = records.filter(r => r.attendance === "no").length;
  const unsureCount = records.filter(r => r.attendance === "maybe").length;
  
  // Total guests count is the sum of guests fields for attending RSVPs plus the attendees themselves
  const totalAttendingGuests = records
    .filter(r => r.attendance === "yes")
    .reduce((sum, r) => sum + Math.max(1, r.guests), 0);

  const attendingPercent = totalResponses > 0 
    ? Math.round((attendingCount / totalResponses) * 100) 
    : 0;

  // Filtered list for display
  const filteredRecords = records.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "all" || r.attendance === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="min-h-screen bg-[#fdf7d5] text-[#2d221b] selection:bg-[#d4af37]/20 selection:text-[#5c4a3c] font-serif p-4 md:p-8 relative overflow-x-hidden">
      
      {/* Dynamic BG marigold petal details */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#d4af37]/5 to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          /* PASSCODE GATE MODAL */
          <motion.div 
            key="passcode-gate"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#fdfdfc]/40 backdrop-blur-md"
          >
            <div className="w-full max-w-md bg-[#fdfdfc] border-2 border-[#d4af37]/45 rounded-3xl p-8 shadow-[0_20px_50px_rgba(92,74,60,0.12)] relative">
              <div className="absolute inset-2.5 border border-[#d4af37]/25 rounded-[1.25rem] pointer-events-none" />
              
              <div className="text-center relative z-10">
                <div className="mb-6 w-16 h-16 mx-auto rounded-full border border-[#d4af37] flex items-center justify-center relative shadow-sm">
                  <div className="absolute inset-1 border border-[#d4af37]/35 rounded-full" />
                  <Lock className="w-6 h-6 text-[#d4af37]" />
                </div>

                <h1 className="text-3xl text-[#1c140e] tracking-[0.1em] mb-2">RSVP Analytics</h1>
                <p className="text-xs uppercase tracking-widest text-[#85640c] font-semibold font-sans mb-6">Shubham & Prachi</p>
                
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="relative">
                    <input 
                      type={showPasscode ? "text" : "password"}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter Admin Passcode"
                      className="w-full px-4 py-3 bg-[#fdfbf7] border border-[#d4af37]/50 rounded-xl text-center text-sm text-[#1c140e] font-semibold tracking-wider font-sans focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-sans font-semibold text-[#85640c] hover:text-[#5c4508]"
                    >
                      {showPasscode ? "Hide" : "Show"}
                    </button>
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-600 font-sans font-semibold">{errorMsg}</p>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-[#4a3b32] hover:bg-[#2d1f18] text-white tracking-[0.2em] uppercase font-bold text-xs rounded-xl transition-all duration-200 shadow-md active:scale-[0.98] select-none"
                  >
                    Unlock Dashboard
                  </button>
                </form>

                <div className="mt-8 border-t border-[#e6ded4] pt-4">
                  <Link href="/" className="inline-flex items-center space-x-1.5 text-xs text-[#85640c] hover:text-[#5c4508] uppercase tracking-wider font-semibold font-sans">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Invitation</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* LIVE DASHBOARD PORTAL */
          <motion.div 
            key="dashboard-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto relative z-10"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#d4af37]/20 pb-6 mb-8 gap-4">
              <div>
                <div className="flex items-center space-x-2 text-[#85640c]">
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span className="text-xs uppercase tracking-[0.2em] font-bold font-sans">Admin Portal</span>
                </div>
                <h1 className="text-3xl md:text-4xl text-[#1c140e] mt-1 font-semibold">Shubham & Prachi</h1>
                <p className="text-xs md:text-sm text-[#5c4a3c] font-sans mt-0.5 font-medium">Real-time RSVP analytics, guests list spreadsheet integration</p>
              </div>

              <div className="flex items-center space-x-3 font-sans">
                <Link href="/" className="flex items-center space-x-1.5 px-4 py-2 border border-[#d4af37]/45 bg-[#fdfdfc]/80 hover:bg-white text-[#4a3b32] hover:text-[#1c140e] text-xs uppercase font-bold tracking-wider rounded-xl shadow-sm transition-all duration-200">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View Invite</span>
                </Link>

                <button 
                  onClick={fetchRSVPs}
                  disabled={loading}
                  className="flex items-center space-x-1.5 px-4 py-2 border border-[#d4af37]/45 bg-[#fdfdfc]/80 hover:bg-white text-[#4a3b32] hover:text-[#1c140e] text-xs uppercase font-bold tracking-wider rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50"
                  title="Reload RSVP responses"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#85640c]" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs uppercase font-bold tracking-wider rounded-xl shadow-sm transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>

            {/* Error Banner if fetch fails */}
            {fetchError && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 text-center max-w-3xl mx-auto"
              >
                <Lock className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <h3 className="text-lg font-sans font-bold text-red-900 mb-2">Apps Script Connection Setup Required</h3>
                <p className="text-sm font-serif text-red-700 leading-relaxed max-w-xl mx-auto mb-4">
                  The dashboard could not fetch responses. Please verify that you have added the `doGet(e)` script function inside your Google Sheet Apps Script (Extensions &rarr; Apps Script) and deployed it as a new version.
                </p>
                <div className="text-left bg-white border border-red-100 rounded-xl p-4 overflow-x-auto text-xs font-mono max-w-2xl mx-auto mb-4 select-all">
                  {`function doGet(e) {\n  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();\n  var rows = sheet.getDataRange().getValues();\n  if (rows.length <= 1) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);\n  var headers = rows[0];\n  var data = [];\n  for (var i = 1; i < rows.length; i++) {\n    var record = {};\n    for (var j = 0; j < headers.length; j++) {\n      var key = headers[j].toString().toLowerCase().replace(/[^a-zA-Z0-9]/g, "");\n      record[key] = rows[i][j];\n    }\n    data.push(record);\n  }\n  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);\n}`}
                </div>
                <button 
                  onClick={fetchRSVPs} 
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-sans text-xs uppercase tracking-wider font-bold rounded-lg transition-all"
                >
                  Retry Connection
                </button>
              </motion.div>
            )}

            {/* Loading Indicator */}
            {loading && records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-10 h-10 text-[#d4af37] animate-spin mb-4" />
                <p className="text-sm font-sans tracking-widest text-[#85640c] uppercase font-semibold">Fetching RSVPs from Google Sheet...</p>
              </div>
            ) : (
              <>
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-sans">
                  
                  {/* Card 1: Total Responses */}
                  <div className="bg-[#fdfdfc]/95 border border-[#d4af37]/45 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                    <div className="absolute top-4 right-4 text-[#d4af37]/35"><Mail className="w-5 h-5" /></div>
                    <p className="text-[10px] uppercase tracking-wider text-[#5c4a3c] font-bold">Total Forms</p>
                    <p className="text-3xl font-extrabold text-[#1c140e] mt-2">{totalResponses}</p>
                    <p className="text-[10px] text-[#85640c] mt-1 font-semibold">Submitted RSVPs</p>
                  </div>

                  {/* Card 2: Total Attending Guests */}
                  <div className="bg-[#fdfdfc]/95 border border-[#d4af37]/45 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                    <div className="absolute top-4 right-4 text-emerald-600/35"><Users className="w-5 h-5" /></div>
                    <p className="text-[10px] uppercase tracking-wider text-[#5c4a3c] font-bold">Attending Guests</p>
                    <p className="text-3xl font-extrabold text-emerald-800 mt-2">{totalAttendingGuests}</p>
                    <p className="text-[10px] text-emerald-600 mt-1 font-semibold">{attendingCount} families attending</p>
                  </div>

                  {/* Card 3: Regrets */}
                  <div className="bg-[#fdfdfc]/95 border border-[#d4af37]/45 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                    <div className="absolute top-4 right-4 text-rose-600/35"><XCircle className="w-5 h-5" /></div>
                    <p className="text-[10px] uppercase tracking-wider text-[#5c4a3c] font-bold">Regrets (No)</p>
                    <p className="text-3xl font-extrabold text-rose-800 mt-2">{notAttendingCount}</p>
                    <p className="text-[10px] text-rose-600 mt-1 font-semibold">{totalResponses > 0 ? Math.round((notAttendingCount/totalResponses)*100) : 0}% of responses</p>
                  </div>

                  {/* Card 4: Unsure */}
                  <div className="bg-[#fdfdfc]/95 border border-[#d4af37]/45 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                    <div className="absolute top-4 right-4 text-[#85640c]/35"><HelpCircle className="w-5 h-5" /></div>
                    <p className="text-[10px] uppercase tracking-wider text-[#5c4a3c] font-bold">Unsure (Maybe)</p>
                    <p className="text-3xl font-extrabold text-[#85640c] mt-2">{unsureCount}</p>
                    <p className="text-[10px] text-[#85640c] mt-1 font-semibold">Will confirm later</p>
                  </div>

                </div>

                {/* Middle Section: Progress & Wishes Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
                  
                  {/* Left Column: Attending Progress Ring (4 cols) */}
                  <div className="lg:col-span-4 bg-[#fdfdfc]/95 border border-[#d4af37]/45 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden min-h-[300px]">
                    <div className="absolute inset-3 border border-[#d4af37]/15 rounded-[1.25rem] pointer-events-none" />
                    
                    <div className="z-10 w-full">
                      <h3 className="text-sm font-sans uppercase tracking-widest text-[#4a3b32] font-bold">Attendance Share</h3>
                      <div className="w-10 h-[1.5px] bg-[#d4af37]/50 mx-auto mt-2" />
                    </div>

                    <div className="relative flex items-center justify-center my-6 z-10">
                      {/* SVG circular progress ring */}
                      <svg className="w-36 h-36 transform -rotate-90">
                        <circle 
                          cx="72" cy="72" r="58"
                          className="text-[#e6ded4]"
                          strokeWidth="7"
                          stroke="currentColor"
                          fill="transparent"
                        />
                        <circle 
                          cx="72" cy="72" r="58"
                          className="text-[#d4af37]"
                          strokeWidth="8"
                          strokeDasharray={364.4}
                          strokeDashoffset={364.4 - (364.4 * attendingPercent) / 100}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-extrabold font-sans text-[#1c140e]">{attendingPercent}%</span>
                        <span className="text-[9px] uppercase font-sans tracking-wider text-[#85640c] font-bold mt-0.5">Attending</span>
                      </div>
                    </div>

                    <div className="w-full z-10 text-xs font-sans text-[#5c4a3c] font-semibold space-y-1">
                      <p>Of {totalResponses} total response forms:</p>
                      <p className="text-[#85640c]">{attendingCount} declared attending, {notAttendingCount} regrets</p>
                    </div>
                  </div>

                  {/* Right Column: Wishes & Messages Scrolling Feed (8 cols) */}
                  <div className="lg:col-span-8 bg-[#fdfdfc]/95 border border-[#d4af37]/45 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[300px]">
                    <div className="absolute inset-3 border border-[#d4af37]/15 rounded-[1.25rem] pointer-events-none" />
                    
                    <div className="z-10 mb-4 flex items-center justify-between border-b border-[#e6ded4] pb-3">
                      <h3 className="text-sm font-sans uppercase tracking-widest text-[#4a3b32] font-bold flex items-center">
                        <MessageSquare className="w-4 h-4 text-[#85640c] mr-2" />
                        Wishes & Messages Feed
                      </h3>
                      <span className="text-[10px] font-sans bg-[#d4af37]/15 text-[#85640c] px-2.5 py-1 rounded-full font-bold">
                        {records.filter(r => r.message).length} Messages
                      </span>
                    </div>

                    {/* Scrolling Body */}
                    <div className="overflow-y-auto max-h-[220px] pr-2 space-y-4 z-10 custom-scrollbar">
                      {records.filter(r => r.message).length === 0 ? (
                        <div className="text-center py-10 text-sm text-[#7c6655] italic">
                          No wishes or messages have been submitted yet.
                        </div>
                      ) : (
                        records.filter(r => r.message).map((r, idx) => (
                          <div 
                            key={idx} 
                            className="bg-[#fdfbf7] border border-[#d4af37]/25 rounded-2xl p-4 relative shadow-sm hover:border-[#d4af37]/55 transition-colors"
                          >
                            <p className="text-sm text-[#1c140e] font-serif leading-relaxed italic mb-3">
                              &ldquo;{r.message}&rdquo;
                            </p>
                            <div className="flex items-center justify-between text-[10px] font-sans border-t border-[#e6ded4]/50 pt-2 text-[#5c4a3c] font-semibold">
                              <span className="text-[#85640c] font-bold">{r.name}</span>
                              <span className="flex items-center space-x-1.5">
                                {r.attendance === "yes" && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                                {r.attendance === "no" && <XCircle className="w-3 h-3 text-rose-600" />}
                                {r.attendance === "maybe" && <HelpCircle className="w-3 h-3 text-amber-600" />}
                                <span className="capitalize">{r.attendance === "yes" ? "Attending" : r.attendance === "no" ? "Regret" : "Unsure"}</span>
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Bottom Section: RSVP Guest List Table */}
                <div className="bg-[#fdfdfc]/95 border border-[#d4af37]/45 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-3 border border-[#d4af37]/15 rounded-[1.25rem] pointer-events-none" />
                  
                  {/* Table Controls (Search & Filters) */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 z-10 relative">
                    <h3 className="text-sm font-sans uppercase tracking-widest text-[#4a3b32] font-bold">Responses Ledger</h3>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-sans">
                      
                      {/* Search box */}
                      <div className="relative">
                        <input 
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search guest or message..."
                          className="w-full sm:w-60 pl-8 pr-4 py-2 bg-[#fdfbf7] border border-[#d4af37]/40 rounded-xl text-xs text-[#1c140e] font-medium focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30"
                        />
                        <Search className="w-3.5 h-3.5 text-[#85640c] absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>

                      {/* Filter tabs */}
                      <div className="flex bg-[#e6ded4]/50 border border-[#e6ded4] rounded-xl p-0.5 text-[10px] font-bold text-[#5c4a3c]">
                        {[
                          { id: "all", label: "All" },
                          { id: "yes", label: "Attending" },
                          { id: "no", label: "Regrets" },
                          { id: "maybe", label: "Unsure" }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id as "all" | "yes" | "no" | "maybe")}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                              activeFilter === tab.id 
                                ? "bg-[#fdfdfc] text-[#1c140e] shadow-sm font-extrabold" 
                                : "hover:text-[#1c140e]"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                    </div>
                  </div>

                  {/* Responsive Table Data */}
                  <div className="overflow-x-auto z-10 relative custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs md:text-sm font-sans min-w-[700px]">
                      <thead>
                        <tr className="border-b border-[#e6ded4] text-[#85640c] uppercase font-bold text-[10px] tracking-wider">
                          <th className="pb-3 pl-3">Guest Name</th>
                          <th className="pb-3">Timestamp</th>
                          <th className="pb-3 text-center">RSVP</th>
                          <th className="pb-3 text-center">Guest Count</th>
                          <th className="pb-3 pl-3">Wishes & Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e6ded4]/40 text-[#2d221b] font-medium">
                        {filteredRecords.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-sm italic text-[#7c6655] font-serif">
                              {searchTerm ? "No matching records found." : "No RSVP responses logged yet."}
                            </td>
                          </tr>
                        ) : (
                          filteredRecords.map((r, idx) => (
                            <tr 
                              key={idx}
                              className="hover:bg-[#d4af37]/5 transition-colors group"
                            >
                              <td className="py-3.5 pl-3 font-semibold text-[#1c140e]">{r.name}</td>
                              <td className="py-3.5 text-[11px] text-[#5c4a3c]">{r.timestamp}</td>
                              <td className="py-3.5 text-center">
                                <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                                  r.attendance === "yes" 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                    : r.attendance === "no" 
                                      ? "bg-rose-50 text-rose-700 border border-rose-200" 
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  {r.attendance === "yes" ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      <span>Yes</span>
                                    </>
                                  ) : r.attendance === "no" ? (
                                    <>
                                      <XCircle className="w-3 h-3" />
                                      <span>No</span>
                                    </>
                                  ) : (
                                    <>
                                      <HelpCircle className="w-3 h-3" />
                                      <span>Maybe</span>
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="py-3.5 text-center font-bold text-[#1c140e]">{r.attendance === "yes" ? Math.max(1, r.guests) : 0}</td>
                              <td className="py-3.5 pl-3 max-w-[280px] truncate text-xs text-[#5c4a3c] font-serif group-hover:text-clip group-hover:whitespace-normal transition-all" title={r.message}>
                                {r.message ? `"${r.message}"` : <span className="text-[#a39081] font-sans font-light italic">None</span>}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer bar inside ledger */}
                  <div className="mt-4 pt-4 border-t border-[#e6ded4]/60 flex items-center justify-between text-[10px] md:text-xs text-[#85640c] font-bold font-sans">
                    <span>Showing {filteredRecords.length} response(s)</span>
                    <span className="uppercase tracking-widest text-[#4a3b32]">Shubham & Prachi Invitation Ledger</span>
                  </div>

                </div>
              </>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded CSS custom utilities */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.35);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.6);
        }
      `}</style>
    </main>
  );
}
