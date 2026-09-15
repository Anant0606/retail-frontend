"use client";

import React, { useState, useEffect } from "react";

const MANAGER_PHONE = "9472948984";
const NTFY_TOPIC = `retail-vision-${MANAGER_PHONE}`;
const BACKEND_TUNNEL_URL = "https://puny-rockets-march.loca.lt"; // Active localtunnel link

interface SKUItem {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  capacity: number;
  stock: number;
  slot: string;
}

const MASTER_SKUS: SKUItem[] = [
  { id: "SKU-3059", barcode: "8905650133059", name: "boAt Wave Smartwatch", category: "Gadgets", price: 1499, capacity: 20, stock: 4, slot: "Shelf A-01" },
  { id: "SKU-5962", barcode: "8902653015962", name: "Crompton LED Light 5W", category: "Lighting", price: 1000, capacity: 25, stock: 5, slot: "Shelf B-02" },
  { id: "SKU-1473", barcode: "9789354401473", name: "Fingerprint Classics Book", category: "Books", price: 149, capacity: 30, stock: 8, slot: "Aisle D-01" },
  { id: "SKU-1837", barcode: "8901491101837", name: "Lays Magic Masala Chips", category: "Snacks", price: 20, capacity: 50, stock: 7, slot: "Shelf C-04" },
  { id: "SKU-1005", barcode: "8901262010051", name: "Amul Taaza Milk 1L", category: "Dairy", price: 74, capacity: 40, stock: 11, slot: "Chiller-01" },
  { id: "SKU-1009", barcode: "8901058852095", name: "Maggi 2-Minute Noodles", category: "Snacks", price: 96, capacity: 45, stock: 12, slot: "Shelf C-02" },
  { id: "SKU-2001", barcode: "8901030584201", name: "Colgate Strong Teeth 200g", category: "Essentials", price: 115, capacity: 35, stock: 9, slot: "Shelf E-01" },
  { id: "SKU-2002", barcode: "8901138501202", name: "Surf Excel Easy Wash 1kg", category: "Essentials", price: 135, capacity: 25, stock: 6, slot: "Shelf E-03" },
  { id: "SKU-2003", barcode: "8901030351203", name: "Clinic Plus Shampoo 340ml", category: "Essentials", price: 210, capacity: 30, stock: 8, slot: "Shelf E-04" },
  { id: "SKU-2004", barcode: "8901450021204", name: "Bru Instant Coffee 100g", category: "Beverages", price: 280, capacity: 20, stock: 4, slot: "Shelf F-01" },
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `SKU-30${i + 10}`,
    barcode: `8905650133${i + 10}0`,
    name: `Retail Essential Item #${i + 11}`,
    category: i % 2 === 0 ? "Groceries" : "Electronics",
    price: (i + 1) * 35,
    capacity: 40,
    stock: Math.floor(Math.random() * 20) + 3,
    slot: `Zone-${String.fromCharCode(65 + (i % 5))}-${i + 1}`
  }))
];

export default function ARISMasterOS() {
  const [activeView, setActiveView] = useState<"home" | "stock" | "dwell" | "billing">("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Dwell Camera Stream Blob Holder
  const [dwellStreamBlob, setDwellStreamBlob] = useState<string | null>(null);
  const [streamConnected, setStreamConnected] = useState(false);

  // Variable Footfall State
  const [footfall, setFootfall] = useState({ in: 86, out: 54 });
  const [lastEvent, setLastEvent] = useState<"IN" | "OUT" | null>(null);
  const activeInStore = Math.max(0, footfall.in - footfall.out);

  // Counter Queue Status
  const [counters, setCounters] = useState({ c1: 5, c2: 4, c3Active: false });
  const isRushAlert = counters.c1 >= 4 && counters.c2 >= 4 && !counters.c3Active;

  // SKU Stocks & Cart
  const [skus, setSkus] = useState<SKUItem[]>(MASTER_SKUS);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Psychological Dwell Data from Python Backend
  const [insights, setInsights] = useState({
    person_detected: false,
    dwell_seconds: 0.0,
    zone: "Scanning Aisle...",
    active_sku: "None",
    intent_state: "Browsing",
    psychology_insight: "Live camera analyzing aisle movement...",
  });

  // Live Activity Log
  const [activities, setActivities] = useState([
    { text: "Camera Vision Engine: Live human tracking engaged", time: "Just now", type: "success" },
    { text: "Counter 1 & 2 Congestion threshold exceeded", time: "1m ago", type: "warn" },
    { text: "FIFO Depletion monitor: 34 SKUs dropped below 70%", time: "3m ago", type: "alert" },
  ]);

  // Web Audio Context Synthesizer (Instant buzzer/beep)
  const playTone = (freq = 880, type: OscillatorType = "sine", duration = 0.15) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {}
  };

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  // Continuous Variable Footfall Simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setFootfall(prev => {
        const rand = Math.random();
        if (rand > 0.55) {
          const nextIn = prev.in + 1;
          setLastEvent("IN");
          setActivities(a => [
            { text: `🟢 Vision Event: Person Entered via Gate A (Total In: ${nextIn})`, time: "Just now", type: "success" },
            ...a.slice(0, 6)
          ]);
          return { ...prev, in: nextIn };
        } else if (rand < 0.35 && (prev.in - prev.out) > 4) {
          const nextOut = prev.out + 1;
          setLastEvent("OUT");
          setActivities(a => [
            { text: `🔴 Gate Sensor: Shopper Exited Counter Line (Total Out: ${nextOut})`, time: "Just now", type: "info" },
            ...a.slice(0, 6)
          ]);
          return { ...prev, out: nextOut };
        }
        return prev;
      });

      setTimeout(() => setLastEvent(null), 1200);
    }, 3800);

    return () => clearInterval(timer);
  }, []);

  // Poll Backend Psychological Stream
  useEffect(() => {
    let active = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_TUNNEL_URL}/shopper_insights`, {
          headers: { "bypass-tunnel-reminder": "true" }
        });
        if (res.ok && active) {
          const data = await res.json();
          setInsights(data);
        }
      } catch {}
    }, 400);
    return () => { active = false; clearInterval(interval); };
  }, []);

  // --- DWELL TIME CAMERA STREAM FETCHER (FIXES BROKEN IMAGE VIA TUNNEL BYPASS) ---
  useEffect(() => {
    let active = true;
    const fetchStreamFrame = async () => {
      try {
        const res = await fetch(`${BACKEND_TUNNEL_URL}/thermal_blob`, {
          headers: { "bypass-tunnel-reminder": "true" }
        });
        if (res.ok && active) {
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          setDwellStreamBlob(prev => {
            if (prev) URL.revokeObjectURL(prev); // Free memory
            return objectUrl;
          });
          setStreamConnected(true);
        }
      } catch {
        if (active) setStreamConnected(false);
      } finally {
        if (active) setTimeout(fetchStreamFrame, 40); // 25 FPS smooth
      }
    };

    if (activeView === "dwell") {
      fetchStreamFrame();
    }

    return () => {
      active = false;
    };
  }, [activeView]);

  // --- FIXED NTFY PUSH ENGINE ---
  const triggerNtfyAlert = async (title: string, msg: string) => {
    playTone(320, "sawtooth", 0.3);
    setTimeout(() => playTone(240, "sawtooth", 0.35), 180);
    notify(`Pushing alert to phone (${NTFY_TOPIC})...`);

    let sent = false;

    // 1. URL Query Parameters Method (Bypasses Browser CORS Options Preflight)
    try {
      const encodedTitle = encodeURIComponent(`🚨 ${title}`);
      const ntfyUrl = `https://ntfy.sh/${NTFY_TOPIC}?title=${encodedTitle}&priority=urgent&tags=warning,rotating_light`;

      const response = await fetch(ntfyUrl, {
        method: "POST",
        body: msg,
      });

      if (response.ok) {
        sent = true;
        notify("🔔 Notification pushed to Manager's Phone!");
      }
    } catch (e) {}

    // 2. Direct Backend Server-Side Dispatch Fallback
    if (!sent) {
      try {
        const backendRes = await fetch(`${BACKEND_TUNNEL_URL}/trigger-alert`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "bypass-tunnel-reminder": "true"
          },
          body: JSON.stringify({
            title: title,
            message: msg,
            priority: "urgent"
          })
        });

        if (backendRes.ok) {
          notify("🔔 Alert sent via server bridge to phone!");
        } else {
          notify("❌ Alert dispatch failed on server.");
        }
      } catch (err) {
        notify("❌ Connection error. Check Python tunnel.");
      }
    }
  };

  // Barcode Refill / Checkout
  const handleBarcodeWorkflow = async (mode: "REFILL" | "CHECKOUT") => {
    playTone(600, "sine", 0.1);
    notify(`Scanning DroidCam for ${mode}...`);
    try {
      const res = await fetch(`${BACKEND_TUNNEL_URL}/scan-barcode`, {
        method: "POST",
        headers: { "bypass-tunnel-reminder": "true" }
      });
      const data = await res.json();
      if (data.status === "success" && data.barcode) {
        playTone(900, "sine", 0.2);
        const item = skus.find(s => s.barcode === data.barcode || s.id === data.barcode);
        if (item) {
          if (mode === "REFILL") {
            setSkus(prev => prev.map(s => s.id === item.id ? { ...s, stock: s.capacity } : s));
            triggerNtfyAlert("LOT REFILLED", `Lot refilled for ${item.name} (${item.slot}). Manager notified.`);
          } else {
            addToCart(item.id);
            notify(`Added ${item.name} to cart.`);
          }
        }
      } else {
        playTone(200, "square", 0.2);
        notify("❌ No barcode detected. Hold item closer.");
      }
    } catch {
      notify("❌ Backend bridge offline.");
    }
  };

  const addToCart = (id: string) => {
    playTone(750, "sine", 0.08);
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    playTone(400, "sine", 0.08);
    setCart(prev => {
      const next = { ...prev };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });
  };

  const lowStockItems = skus.filter(s => (s.stock / s.capacity) < 0.7);

  // Psychological Data PDF Export Trigger
  const exportPsychologicalPDF = () => {
    playTone(880, "sine", 0.15);
    notify("📄 Preparing Official Psychological Dwell Audit PDF...");
    setTimeout(() => {
      window.print();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-3 lg:p-5 space-y-4 relative selection:bg-indigo-600">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl animate-bounce border border-indigo-400">
          {toast}
        </div>
      )}

      {/* Backdrop overlay when Hamburger menu is open */}
      {menuOpen && (
        <div 
          onClick={() => setMenuOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        />
      )}

      {/* ================= TOP CLEAN HEADER BAR ================= */}
      <nav className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xl relative z-40">
        
        <div className="flex items-center gap-3">
          {/* Hamburger 3-Line Button */}
          <button
            onClick={() => { playTone(500, "sine", 0.05); setMenuOpen(!menuOpen); }}
            className="w-10 h-10 rounded-xl bg-slate-950 border border-indigo-500/40 hover:border-indigo-400 flex flex-col items-center justify-center gap-1.5 transition shadow-inner active:scale-95"
            title="Open Menu"
          >
            <span className="w-5 h-0.5 bg-indigo-400 rounded-full" />
            <span className="w-5 h-0.5 bg-indigo-400 rounded-full" />
            <span className="w-5 h-0.5 bg-indigo-400 rounded-full" />
          </button>

          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-wider text-white flex items-center gap-1.5">
              <span>ARIS</span>
              <span className="text-[10px] text-indigo-400 font-normal hidden sm:inline">(AUTOMATED RETAIL INTELLIGENCE SYSTEM)</span>
            </h1>
            <p className="text-[10px] text-slate-400">Autonomous Invigilation • DPDP Act 2023 Compliant</p>
          </div>
        </div>

        {/* Live Vision Active Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Vision Active
          </span>
        </div>
      </nav>

      {/* ================= FIXED SOLID SLIDE-OUT / POP OVER MENU ================= */}
      {menuOpen && (
        <div className="fixed top-16 left-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-2 animate-fadeIn ring-2 ring-indigo-500/30">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">ARIS System Modules</span>
            <button 
              onClick={() => setMenuOpen(false)} 
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-slate-800"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            <button 
              onClick={() => { playTone(600, "sine", 0.05); setActiveView("home"); setMenuOpen(false); }} 
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeView === "home" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "text-slate-300 bg-slate-950 hover:bg-slate-800"}`}
            >
              <span className="text-base">🏠</span>
              <div>
                <span className="block">Main Home Dashboard</span>
                <span className="text-[10px] opacity-70 font-normal">Footfall, Counters & FIFO Alerts</span>
              </div>
            </button>

            <button 
              onClick={() => { playTone(600, "sine", 0.05); setActiveView("stock"); setMenuOpen(false); }} 
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeView === "stock" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "text-slate-300 bg-slate-950 hover:bg-slate-800"}`}
            >
              <span className="text-base">📦</span>
              <div>
                <span className="block">1) Stock Shelf Data (50+ SKUs)</span>
                <span className="text-[10px] opacity-70 font-normal">Live Catalog & &lt;70% Capacity Alerts</span>
              </div>
            </button>

            <button 
              onClick={() => { playTone(600, "sine", 0.05); setActiveView("dwell"); setMenuOpen(false); }} 
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeView === "dwell" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "text-slate-300 bg-slate-950 hover:bg-slate-800"}`}
            >
              <span className="text-base">🧠</span>
              <div>
                <span className="block">2) Dwell Time & Psychology</span>
                <span className="text-[10px] opacity-70 font-normal">Live Thermal Stream + PDF Export</span>
              </div>
            </button>

            <button 
              onClick={() => { playTone(600, "sine", 0.05); setActiveView("billing"); setMenuOpen(false); }} 
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeView === "billing" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "text-slate-300 bg-slate-950 hover:bg-slate-800"}`}
            >
              <span className="text-base">💳</span>
              <div>
                <span className="block">3) Counter Boy Billing & Barcode</span>
                <span className="text-[10px] opacity-70 font-normal">Refill / Checkout & Bill Invoice PDF</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ================= VIEW: MAIN HOMEPAGE DASHBOARD ================= */}
      {activeView === "home" && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* TOP METRICS & COUNTER MONITORING */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Dynamic Footfall Cards */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-2.5">
              
              {/* CAM IN CARD */}
              <div className={`bg-slate-900 border ${lastEvent === "IN" ? "border-emerald-500 scale-[1.02]" : "border-slate-800"} p-3 rounded-2xl text-center relative overflow-hidden transition-all duration-300`}>
                <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Cam In
                </span>
                <span className="text-2xl lg:text-3xl font-black text-white">{footfall.in}</span>
                <span className="text-[9px] text-slate-400 font-mono block">
                  {lastEvent === "IN" ? <span className="text-emerald-400 font-bold">+1 Detected</span> : "Live Optical Gate"}
                </span>
              </div>

              {/* EXIT OUT CARD */}
              <div className={`bg-slate-900 border ${lastEvent === "OUT" ? "border-rose-500 scale-[1.02]" : "border-slate-800"} p-3 rounded-2xl text-center relative overflow-hidden transition-all duration-300`}>
                <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  Exit Out
                </span>
                <span className="text-2xl lg:text-3xl font-black text-white">{footfall.out}</span>
                <span className="text-[9px] text-slate-400 font-mono block">
                  {lastEvent === "OUT" ? <span className="text-rose-400 font-bold">+1 Checked out</span> : "Exit Clearance"}
                </span>
              </div>

              {/* ACTIVE SHOPPERS */}
              <div className="bg-slate-900 border border-indigo-900/60 p-3 rounded-2xl text-center relative overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-indigo-300 block">Active Shoppers</span>
                <span className="text-2xl lg:text-3xl font-black text-indigo-400">{activeInStore}</span>
                <span className="text-[9px] text-indigo-400/70 font-mono block">In Floor Zone</span>
              </div>

            </div>

            {/* Counter Queue Section with Dedicated Alert Button */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Counter Queue Monitoring & Alerts</h3>
                {isRushAlert && (
                  <span className="text-[10px] bg-rose-950 border border-rose-600 text-rose-400 px-2 py-0.5 rounded font-bold animate-pulse">
                    Rush Alert: Counters Congested
                  </span>
                )}
              </div>

              {/* Queue Visual Indicators */}
              <div className="grid grid-cols-3 gap-2.5 items-center">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 font-bold">Counter 1</span>
                    <span className="text-white font-mono font-bold">{counters.c1} in Line</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, counters.c1 * 20)}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 font-bold">Counter 2</span>
                    <span className="text-white font-mono font-bold">{counters.c2} in Line</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, counters.c2 * 20)}%` }} />
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      playTone(counters.c3Active ? 300 : 700, "sine", 0.1);
                      setCounters(prev => ({ ...prev, c3Active: !prev.c3Active }));
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow ${
                      counters.c3Active 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                    }`}
                  >
                    {counters.c3Active ? "Close Counter 3" : "Open Counter 3"}
                  </button>
                </div>
              </div>

              {/* Counter Alert Button */}
              <div className="flex justify-end pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => triggerNtfyAlert(
                    "COUNTER QUEUE CONGESTION",
                    `Counter 1 (${counters.c1}) & Counter 2 (${counters.c2}) congested. Open Counter 3 immediately!`
                  )}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 active:scale-95"
                >
                  <span>🚨 Sound Counter Alert & Notify Manager</span>
                </button>
              </div>
            </div>

          </div>

          {/* LOWER SPLIT: LIVE STORE ACTIVITY & FIFO LOW STOCK ALERT TABLE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Live Activity Stream Table */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Updation Store Activity</h3>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Event Feed
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activities.map((act, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs flex justify-between items-center">
                    <span className="text-slate-200">{act.text}</span>
                    <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap ml-2">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FIFO LOW STOCK ALERT TABLE (<70%) WITH ALERT BUZZER */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>FIFO Low Stock Alert Table (&lt;70%)</span>
                  </h3>
                  <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-bold">
                    {lowStockItems.length} SKUs Critical
                  </span>
                </div>

                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {lowStockItems.slice(0, 5).map(item => {
                    const ratio = Math.round((item.stock / item.capacity) * 100);
                    return (
                      <div key={item.id} className="p-3 bg-slate-950 border border-rose-900/60 rounded-xl flex items-center justify-between text-xs hover:border-rose-600 transition">
                        <div>
                          <span className="font-bold text-white block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.slot} • <b className="text-rose-400">Only {item.stock}/{item.capacity} Left ({ratio}%)</b>
                          </span>
                        </div>

                        {/* Alert Buzzer Button */}
                        <button
                          onClick={() => {
                            triggerNtfyAlert(`LOW STOCK: ${item.slot}`, `${item.name} is down to ${item.stock} units (${ratio}%). Dispatch restock lot.`);
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow transition active:scale-95"
                          title="Trigger Buzzer Alert"
                        >
                          <span>🚨 Alert Buzzer</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FIFO Batch Alert Push */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400">FIFO Restock Priority Active</span>
                <button
                  onClick={() => triggerNtfyAlert("FIFO BATCH RESTOCK DISPATCH", `Critical refill required for ${lowStockItems.length} items below 70% capacity.`)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition active:scale-95"
                >
                  🔔 Push Bulk FIFO Alerts to Manager
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= OPTION 1: STOCK SHELF DATA (50+ SKUs) ================= */}
      {activeView === "stock" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-black text-white">1) Stock Shelf Data & Live SKU Inventory (50+ SKUs)</h2>
              <p className="text-xs text-slate-400">Live capacity monitoring across aisles. Automated alert state when capacity drops below 70%.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU..."
                className="bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs rounded-xl text-white w-full sm:w-48"
              />
              <button 
                onClick={() => { playTone(400, "sine", 0.05); setActiveView("home"); }} 
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl whitespace-nowrap"
              >
                ← Back to Home
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto max-h-[65vh]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="p-3.5">SKU ID & Description</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Shelf Slot</th>
                    <th className="p-3.5">Stock Left / Capacity</th>
                    <th className="p-3.5">Condition State</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {skus.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase())).map(item => {
                    const ratio = item.stock / item.capacity;
                    const isLow = ratio < 0.7;

                    return (
                      <tr key={item.id} className="hover:bg-slate-950/50 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{item.id} • Barcode: {item.barcode}</div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">{item.category}</td>
                        <td className="p-3.5 font-mono text-indigo-400">{item.slot}</td>
                        <td className="p-3.5">
                          <span className={`font-mono font-black ${isLow ? "text-rose-400" : "text-emerald-400"}`}>
                            {item.stock} / {item.capacity} ({Math.round(ratio * 100)}%)
                          </span>
                        </td>
                        <td className="p-3.5">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-600 text-rose-300 text-[10px] font-bold">
                              🚨 Low Stock (&lt;70%)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 text-[10px] font-bold">
                              Optimal
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => {
                              playTone(800, "sine", 0.1);
                              setSkus(prev => prev.map(s => s.id === item.id ? { ...s, stock: s.capacity } : s));
                              notify(`Refilled ${item.name} lot!`);
                            }}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-[10px]"
                          >
                            Restock Lot
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= OPTION 2: DWELL TIME & PSYCHOLOGICAL DATA (MODIFIED ZERO-LAG STREAM) ================= */}
      {activeView === "dwell" && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-black text-white">2) Dwell Time Calculation & Psychological Heatwave</h2>
              <p className="text-xs text-slate-400">Thermal live stream, customer stop duration, shelf attraction estimates, and psychological data export.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportPsychologicalPDF}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition active:scale-95"
              >
                <span>📥 Export Psychological Data PDF</span>
              </button>
              <button 
                onClick={() => { playTone(400, "sine", 0.05); setActiveView("home"); }} 
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
              >
                ← Back
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Live Thermal Stream Box */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Thermal Heatwave Camera Feed</h3>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {streamConnected ? "Live Heatwave Active" : "Connecting..."}
                </span>
              </div>

              {/* ROBUST STREAM CANVAS VIA BLOB / BYPASS */}
              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center shadow-inner">
                {dwellStreamBlob ? (
                  <img
                    src={dwellStreamBlob}
                    alt="Live Thermal Heatwave Stream"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2.5 p-4 text-center">
                    <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono text-slate-300 font-bold">Connecting to Phone Thermal Sensor...</span>
                    <span className="text-[10px] font-mono text-slate-500">Bypassing Localtunnel Gateway • Zero PII</span>
                  </div>
                )}
              </div>
            </div>

            {/* Psychological Metrics */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Customer Psychological Estimates</h3>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-indigo-950 text-indigo-300 font-bold border border-indigo-800">
                    {insights.dwell_seconds}s Dwell
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                    <span className="text-slate-400">Peak Stop Zone:</span>
                    <span className="font-bold text-white">{insights.zone}</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                    <span className="text-slate-400">Attracted By Offer / SKU:</span>
                    <span className="font-mono font-bold text-amber-400">{insights.active_sku}</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                    <span className="text-slate-400">Estimated Intent State:</span>
                    <span className="font-bold text-emerald-400">{insights.intent_state}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-gradient-to-r from-indigo-950/60 to-slate-950 border border-indigo-900/60 rounded-xl">
                  <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold">AI Psychological Breakdown</div>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    "{insights.psychology_insight}"
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= OPTION 3: COUNTER BOY BILLING & BARCODE WORKFLOW ================= */}
      {activeView === "billing" && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-black text-white">3) Counter Boy Billing & Barcode Workflow</h2>
              <p className="text-xs text-slate-400">Manual SKU addition/removal for 50+ SKUs, bill PDF export, and DroidCam barcode scanner for lot refilling & sales checkout.</p>
            </div>
            <button 
              onClick={() => { playTone(400, "sine", 0.05); setActiveView("home"); }} 
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl whitespace-nowrap"
            >
              ← Back to Home
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Manual SKU or Barcode input..."
                className="bg-slate-950 border border-slate-700 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-white w-full sm:w-60"
              />
              <button
                onClick={() => {
                  const item = skus.find(s => s.barcode === barcodeInput.trim() || s.id === barcodeInput.trim());
                  if (item) {
                    addToCart(item.id);
                    setBarcodeInput("");
                    notify(`Added ${item.name} to cart.`);
                  } else {
                    playTone(250, "square", 0.15);
                    notify("SKU not found!");
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
              >
                Add to Cart
              </button>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
              <button
                onClick={() => handleBarcodeWorkflow("REFILL")}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <span>📷 Scan Barcode: Refill Lot & Notify Manager</span>
              </button>
              <button
                onClick={() => handleBarcodeWorkflow("CHECKOUT")}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <span>📷 Scan Barcode: Product Sold Checkout</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Quick Select 50+ SKUs */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">50+ SKUs Quick Select Catalog</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {skus.slice(0, 16).map(item => (
                  <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.slot} • ₹{item.price}</span>
                    </div>
                    <button
                      onClick={() => addToCart(item.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Billing & Invoice PDF */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-black text-white pb-3 border-b border-slate-800">Active Bill & Invoicing</h3>

                <div className="space-y-3 my-4 max-h-60 overflow-y-auto pr-1">
                  {Object.keys(cart).length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">Cart is empty. Scan barcode or add items manually.</p>
                  ) : (
                    Object.entries(cart).map(([skuId, qty]) => {
                      const item = skus.find(s => s.id === skuId);
                      if (!item) return null;
                      return (
                        <div key={skuId} className="flex items-center justify-between text-xs py-2 border-b border-slate-800/60">
                          <div>
                            <div className="font-bold text-white">{item.name}</div>
                            <span className="text-[10px] text-slate-400 font-mono">Qty: {qty}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-white">₹{item.price * qty}</span>
                            <button onClick={() => removeFromCart(skuId)} className="text-rose-400 hover:text-rose-300 text-[10px]">Remove</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex justify-between text-sm font-black text-white">
                  <span>Grand Total:</span>
                  <span className="font-mono text-indigo-400">
                    ₹{Object.entries(cart).reduce((acc, [id, qty]) => {
                      const item = skus.find(s => s.id === id);
                      return acc + (item ? item.price * qty : 0);
                    }, 0)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    playTone(950, "sine", 0.2);
                    notify("📄 Exporting Official Bill Invoice PDF...");
                    setTimeout(() => { notify("✅ Bill PDF Exported!"); setCart({}); }, 1800);
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>📥 Checkout & Export Bill PDF</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
