"use client";

import React, { useState, useEffect, useMemo } from "react";

// --- Zero-Dependency Minimal SVG Icons ---
const IconStore = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7a3 3 0 0 1-6 0" />
    <path d="M16 7a3 3 0 0 1-6 0" />
    <path d="M10 7a3 3 0 0 1-6 0" />
  </svg>
);

const IconUsers = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconAlert = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconPackage = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

const IconTrending = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const IconShield = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconVolume = ({ active }: { active: boolean }) => (
  active ? (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  )
);

const IconCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconSparkles = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </svg>
);

// --- 50 Realistic Retail SKUs Catalog ---
const INITIAL_50_SKUS = [
  { id: "SKU-3059", name: "boAt Wave Smartwatch (Classic Blue)", category: "Electronics", capacity: 20, price: 1499 },
  { id: "SKU-5962", name: "Crompton LED Bulb 5W Cool White", category: "Lighting", capacity: 35, price: 1000 },
  { id: "SKU-1473", name: "Fingerprint Classics: Autobiography", category: "Books", capacity: 25, price: 149 },
  { id: "SKU-1837", name: "Lay's Magic Masala Potato Chips 50g", category: "Snacks", capacity: 60, price: 20 },
  { id: "SKU-1005", name: "Amul Taaza Homogenised Milk 1L", category: "Groceries", capacity: 40, price: 74 },
  { id: "SKU-1006", name: "Tata Salt Vacuum Evaporated 1kg", category: "Groceries", capacity: 50, price: 28 },
  { id: "SKU-1007", name: "Fortune Sunlite Refined Oil 1L", category: "Groceries", capacity: 30, price: 145 },
  { id: "SKU-1008", name: "Aashirvaad Shudh Chakki Atta 5kg", category: "Groceries", capacity: 25, price: 265 },
  { id: "SKU-1009", name: "Nestle Maggi 2-Minute Noodles 420g", category: "Groceries", capacity: 45, price: 96 },
  { id: "SKU-1010", name: "Parle-G Gold Biscuits 1kg", category: "Snacks", capacity: 50, price: 120 },
  { id: "SKU-1011", name: "Britannia Good Day Butter 200g", category: "Snacks", capacity: 40, price: 45 },
  { id: "SKU-1012", name: "Cadbury Dairy Milk Silk 150g", category: "Snacks", capacity: 35, price: 175 },
  { id: "SKU-1013", name: "Haldiram's Bhujia Sev 400g", category: "Snacks", capacity: 30, price: 130 },
  { id: "SKU-1014", name: "Kurkure Masala Munch 85g", category: "Snacks", capacity: 50, price: 20 },
  { id: "SKU-1015", name: "Coca-Cola Original 750ml", category: "Beverages", capacity: 40, price: 40 },
  { id: "SKU-1016", name: "Pepsi Cold Drink Can 300ml", category: "Beverages", capacity: 35, price: 35 },
  { id: "SKU-1017", name: "Red Bull Energy Drink 250ml", category: "Beverages", capacity: 30, price: 125 },
  { id: "SKU-1018", name: "Tropicana 100% Orange Juice 1L", category: "Beverages", capacity: 25, price: 140 },
  { id: "SKU-1019", name: "Nescafe Classic Instant Coffee 50g", category: "Beverages", capacity: 30, price: 190 },
  { id: "SKU-1020", name: "Tata Tea Premium 500g", category: "Beverages", capacity: 35, price: 260 },
  { id: "SKU-1021", name: "Colgate MaxFresh Toothpaste 150g", category: "Personal Care", capacity: 40, price: 110 },
  { id: "SKU-1022", name: "Dettol Original Bath Soap (Buy 3 Get 1)", category: "Personal Care", capacity: 30, price: 180 },
  { id: "SKU-1023", name: "Head & Shoulders Shampoo 340ml", category: "Personal Care", capacity: 25, price: 299 },
  { id: "SKU-1024", name: "Nivea Soft Moisturizing Cream 100ml", category: "Personal Care", capacity: 30, price: 160 },
  { id: "SKU-1025", name: "Gillette Mach 3 Razor", category: "Personal Care", capacity: 20, price: 350 },
  { id: "SKU-1026", name: "Surf Excel Easy Wash Detergent 1kg", category: "Household", capacity: 35, price: 145 },
  { id: "SKU-1027", name: "Vim Dishwash Gel Lemon 500ml", category: "Household", capacity: 40, price: 115 },
  { id: "SKU-1028", name: "Harpic Power Plus Toilet Cleaner 1L", category: "Household", capacity: 30, price: 215 },
  { id: "SKU-1029", name: "Lizol Disinfectant Surface Cleaner 1L", category: "Household", capacity: 25, price: 220 },
  { id: "SKU-1030", name: "Odonil Room Spray Jasmine 220ml", category: "Household", capacity: 30, price: 155 },
  { id: "SKU-1031", name: "Philips 9W LED Eco Bulb", category: "Lighting", capacity: 40, price: 120 },
  { id: "SKU-1032", name: "Syska Smart Wi-Fi 7W Bulb", category: "Lighting", capacity: 15, price: 499 },
  { id: "SKU-1033", name: "Wipro High-Beam Emergency Light", category: "Lighting", capacity: 15, price: 650 },
  { id: "SKU-1034", name: "Havells Extension Cord 4-Way 2m", category: "Electronics", capacity: 20, price: 380 },
  { id: "SKU-1035", name: "boAt BassHeads 100 Wired Earphones", category: "Electronics", capacity: 25, price: 399 },
  { id: "SKU-1036", name: "Portronics 20W Fast Charger Adapter", category: "Electronics", capacity: 25, price: 499 },
  { id: "SKU-1037", name: "SanDisk 64GB Ultra Flash Drive", category: "Electronics", capacity: 30, price: 449 },
  { id: "SKU-1038", name: "Duracell Ultra AA Alkaline Pack of 4", category: "Electronics", capacity: 50, price: 170 },
  { id: "SKU-1039", name: "Classmate Notebook Spiral 300 Pgs", category: "Stationery", capacity: 35, price: 130 },
  { id: "SKU-1040", name: "Parker Vector Rollerball Pen", category: "Stationery", capacity: 20, price: 290 },
  { id: "SKU-1041", name: "Doms Neon Graphite Pencils Pack of 10", category: "Stationery", capacity: 40, price: 60 },
  { id: "SKU-1042", name: "Fevicol MR Adhesive Squeeze 100g", category: "Stationery", capacity: 45, price: 45 },
  { id: "SKU-1043", name: "Cello Maxriter Ball Pen Pack of 5", category: "Stationery", capacity: 50, price: 50 },
  { id: "SKU-1044", name: "Atomic Habits - James Clear", category: "Books", capacity: 15, price: 499 },
  { id: "SKU-1045", name: "The Psychology of Money - M. Housel", category: "Books", capacity: 15, price: 350 },
  { id: "SKU-1046", name: "Ikigai: Japanese Secret to Long Life", category: "Books", capacity: 18, price: 399 },
  { id: "SKU-1047", name: "Rich Dad Poor Dad - R. Kiyosaki", category: "Books", capacity: 20, price: 299 },
  { id: "SKU-1048", name: "Casio FX-991CW Scientific Calculator", category: "Electronics", capacity: 10, price: 1495 },
  { id: "SKU-1049", name: "Milton Thermosteel 1000ml Flask", category: "Household", capacity: 15, price: 890 },
  { id: "SKU-1050", name: "Pigeon Handy Chopper with 3 Blades", category: "Household", capacity: 25, price: 249 },
];

export default function RetailStudioDashboard() {
  const [mounted, setMounted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Counter Management State
  const [counterState, setCounterState] = useState({
    c1Queue: 5,
    c2Queue: 4,
    c3Active: false,
    rushAlert: true,
  });

  // Footfall Trackers
  const [footfall, setFootfall] = useState({ in: 48, out: 29 });

  // 50 SKU Dynamic State (Tracking: invigilated in cart, sold, restocked)
  const [productStates, setProductStates] = useState<Record<string, { inCart: number; sold: number; restocked: number }>>({
    "SKU-3059": { inCart: 2, sold: 10, restocked: 0 },
    "SKU-5962": { inCart: 3, sold: 20, restocked: 0 },
    "SKU-1473": { inCart: 1, sold: 12, restocked: 0 },
    "SKU-1837": { inCart: 4, sold: 45, restocked: 0 },
    "SKU-1005": { inCart: 2, sold: 28, restocked: 0 },
    "SKU-1015": { inCart: 1, sold: 25, restocked: 0 },
  });

  const [recentEvents, setRecentEvents] = useState([
    { id: 1, text: "Counter 1 & 2 rush threshold crossed (9 people)", time: "Just now", type: "alert" },
    { id: 2, text: "boAt Wave picked -> Status: In Cart (Not Sold)", time: "15s ago", type: "pick" },
    { id: 3, text: "POS Checkout cleared 6 items at Counter 1", time: "1m ago", type: "sold" },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Web Audio Alert Synthesizer
  const triggerAudio = (type: "pick" | "alert" | "rush" | "checkout") => {
    if (typeof window === "undefined" || !audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "pick") {
        osc.frequency.setValueAtTime(820, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "rush" || type === "alert") {
        // Double Emergency Beep for Counter Rush
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      } else if (type === "checkout") {
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.setValueAtTime(780, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Safe fallback
    }
  };

  // Evaluate Rush and Counter Status
  const evaluateCounterRush = (c1: number, c2: number, c3Active: boolean) => {
    const isRush = (c1 >= 4 && c2 >= 4) && !c3Active;
    if (isRush && !counterState.rushAlert) {
      triggerAudio("rush");
    }
    return isRush;
  };

  // Open / Close Counter 3
  const toggleCounter3 = () => {
    const nextState = !counterState.c3Active;
    let newC1 = counterState.c1Queue;
    let newC2 = counterState.c2Queue;

    // Distribute queue load if counter 3 opens
    if (nextState) {
      newC1 = Math.max(2, counterState.c1Queue - 2);
      newC2 = Math.max(2, counterState.c2Queue - 2);
      triggerAudio("checkout");
      setRecentEvents(prev => [
        { id: Date.now(), text: "Counter 3 DEPLOYED! Queue redistributed smoothly", time: "Just now", type: "sold" },
        ...prev.slice(0, 3)
      ]);
    } else {
      setRecentEvents(prev => [
        { id: Date.now(), text: "Counter 3 closed (Normal traffic restored)", time: "Just now", type: "alert" },
        ...prev.slice(0, 3)
      ]);
    }

    setCounterState({
      c1Queue: newC1,
      c2Queue: newC2,
      c3Active: nextState,
      rushAlert: evaluateCounterRush(newC1, newC2, nextState)
    });
  };

  // Simulate Add/Remove in Queue
  const adjustQueue = (counter: "c1" | "c2", delta: number) => {
    const nextC1 = counter === "c1" ? Math.max(0, counterState.c1Queue + delta) : counterState.c1Queue;
    const nextC2 = counter === "c2" ? Math.max(0, counterState.c2Queue + delta) : counterState.c2Queue;
    const rush = evaluateCounterRush(nextC1, nextC2, counterState.c3Active);

    setCounterState(prev => ({
      ...prev,
      c1Queue: nextC1,
      c2Queue: nextC2,
      rushAlert: rush
    }));
  };

  // Shelf Pick Event: In Cart (Not Sold)
  const handlePickProduct = (id: string, name: string) => {
    triggerAudio("pick");
    setProductStates(prev => {
      const current = prev[id] || { inCart: 0, sold: 0, restocked: 0 };
      return {
        ...prev,
        [id]: { ...current, inCart: current.inCart + 1 }
      };
    });

    setRecentEvents(prev => [
      { id: Date.now(), text: `Camera Invigilated: [${name}] picked to Cart`, time: "Just now", type: "pick" },
      ...prev.slice(0, 3)
    ]);
  };

  // POS Checkout Event: Move from InCart -> Sold
  const handleCheckoutAll = () => {
    let convertedUnits = 0;
    let convertedValue = 0;

    setProductStates(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        const item = updated[id];
        if (item.inCart > 0) {
          const skuMeta = INITIAL_50_SKUS.find(s => s.id === id);
          convertedUnits += item.inCart;
          convertedValue += item.inCart * (skuMeta?.price || 100);
          updated[id] = {
            ...item,
            sold: item.sold + item.inCart,
            inCart: 0
          };
        }
      });
      return updated;
    });

    if (convertedUnits > 0) {
      triggerAudio("checkout");
      setFootfall(prev => ({ ...prev, out: prev.out + Math.ceil(convertedUnits / 2) }));
      setRecentEvents(prev => [
        { id: Date.now(), text: `Cleared ${convertedUnits} items at Checkout (Rs.${convertedValue.toLocaleString("en-IN")})`, time: "Just now", type: "sold" },
        ...prev.slice(0, 3)
      ]);
    }
  };

  // Multi-Factor Computation per SKU
  const catalogWithLiveCalculations = useMemo(() => {
    return INITIAL_50_SKUS.map(sku => {
      const live = productStates[sku.id] || { inCart: 0, sold: 0, restocked: 0 };
      // Strict multi-criteria formula:
      // Stock Remaining = Capacity - (InCart + Sold) + Restocked
      const totalMovedFromShelf = live.inCart + live.sold;
      const currentStock = Math.max(0, sku.capacity - totalMovedFromShelf + live.restocked);
      const emptySlots = sku.capacity - currentStock;
      const clearanceRate = Math.min(100, Math.round((totalMovedFromShelf / sku.capacity) * 100));

      return {
        ...sku,
        inCart: live.inCart,
        sold: live.sold,
        currentStock,
        emptySlots,
        clearanceRate
      };
    });
  }, [productStates]);

  // Global KPIs derived dynamically
  const totalCapacity = catalogWithLiveCalculations.reduce((acc, c) => acc + c.capacity, 0);
  const totalRemainingOnShelf = catalogWithLiveCalculations.reduce((acc, c) => acc + c.currentStock, 0);
  const totalInCartInvigilated = catalogWithLiveCalculations.reduce((acc, c) => acc + c.inCart, 0);
  const totalSoldCleared = catalogWithLiveCalculations.reduce((acc, c) => acc + c.sold, 0);
  const grossRevenue = catalogWithLiveCalculations.reduce((acc, c) => acc + (c.sold * c.price), 0);
  const totalClearedUnits = totalInCartInvigilated + totalSoldCleared;
  const overallClearancePct = Math.round((totalClearedUnits / totalCapacity) * 100);
  const activeInStore = Math.max(0, footfall.in - footfall.out);

  // Filtered Catalog
  const filteredCatalog = catalogWithLiveCalculations.filter(sku => {
    const matchesSearch = sku.name.toLowerCase().includes(searchQuery.toLowerCase()) || sku.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || sku.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Groceries", "Snacks", "Beverages", "Personal Care", "Household", "Lighting", "Electronics", "Stationery", "Books"];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-sm text-slate-400">
        Loading Retailer Vision Engine...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 font-sans relative overflow-hidden">
      {/* Retail Soft Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Navbar */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <IconStore className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Retailer Vision OS</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Multi-SKU Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500">Autonomous Shelf Compliance, Counter Queue & Clearance Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Team AIRS Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/80">
              <IconSparkles className="w-4 h-4 text-indigo-600" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Designed By</p>
                <p className="text-xs font-extrabold text-indigo-900 tracking-wide">TEAM AIRS</p>
              </div>
            </div>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                audioEnabled ? "bg-white text-slate-700 border-slate-200" : "bg-rose-50 text-rose-600 border-rose-200"
              }`}
            >
              <IconVolume active={audioEnabled} />
              <span className="hidden md:inline">{audioEnabled ? "Alerts On" : "Muted"}</span>
            </button>

            <button
              onClick={handleCheckoutAll}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm active:scale-95"
            >
              <IconCheck className="w-4 h-4 text-emerald-400" />
              <span>Checkout Invigilated ({totalInCartInvigilated})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Space */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Counter Management & Rush Queue Alert Banner */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 ${
          counterState.rushAlert 
            ? "bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/50 shadow-md" 
            : "bg-white/90 border-slate-200/80 shadow-xs"
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                counterState.rushAlert ? "bg-rose-600 text-white animate-bounce" : "bg-indigo-50 text-indigo-600"
              }`}>
                <IconAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Checkout Counter Intelligence</h2>
                  {counterState.rushAlert && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-600 text-white animate-pulse">
                      ALERT: RUSH DETECTED!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {counterState.rushAlert 
                    ? "Counters 1 & 2 are bottlenecked (Queue ≥ 4). Deploy Counter 3 to relieve customer congestion!"
                    : "Footfall queues are within operational capacity. Normal checkout flow active."}
                </p>
              </div>
            </div>

            {/* Counter Queue Cards */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Counter 1 */}
              <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs flex items-center gap-3 shadow-2xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Counter 1</span>
                  <span className="font-extrabold text-slate-800 text-sm">{counterState.c1Queue} in Queue</span>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => adjustQueue("c1", 1)} className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-[10px]">+</button>
                  <button onClick={() => adjustQueue("c1", -1)} className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-[10px]">-</button>
                </div>
              </div>

              {/* Counter 2 */}
              <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs flex items-center gap-3 shadow-2xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Counter 2</span>
                  <span className="font-extrabold text-slate-800 text-sm">{counterState.c2Queue} in Queue</span>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => adjustQueue("c2", 1)} className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-[10px]">+</button>
                  <button onClick={() => adjustQueue("c2", -1)} className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-[10px]">-</button>
                </div>
              </div>

              {/* Counter 3 Deployment Switch */}
              <div className={`px-4 py-2 rounded-xl border text-xs flex items-center gap-3 transition ${
                counterState.c3Active ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-slate-100 border-slate-200 text-slate-500"
              }`}>
                <div>
                  <span className="font-bold block text-[10px] uppercase">Counter 3 (Express)</span>
                  <span className="font-extrabold text-xs">{counterState.c3Active ? "ACTIVE & RUNNING" : "STANDBY (CLOSED)"}</span>
                </div>
                <button
                  onClick={toggleCounter3}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition active:scale-95 ${
                    counterState.c3Active 
                      ? "bg-rose-600 hover:bg-rose-700 text-white" 
                      : "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                  }`}
                >
                  {counterState.c3Active ? "Close Counter 3" : "Open Counter 3"}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 4 Macro KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Realtime Footfall */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Store Footfall</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <IconUsers className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{activeInStore} <span className="text-xs font-normal text-slate-500">in aisles</span></div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs font-semibold">
              <span className="text-emerald-600 font-medium">Camera In: {footfall.in}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-medium">Exit Out: {footfall.out}</span>
            </div>
          </div>

          {/* Invigilated Condition */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Invigilated Items</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${totalInCartInvigilated > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
                <IconAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600">{totalInCartInvigilated} <span className="text-xs font-normal text-slate-500">units in cart</span></div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
              <IconShield className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Camera active: In Cart, Not Sold</span>
            </div>
          </div>

          {/* Realtime Stock Clearance */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Clearance</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <IconPackage className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{overallClearancePct}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${overallClearancePct}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-medium">{totalRemainingOnShelf} of {totalCapacity} units remain on shelf</div>
          </div>

          {/* Revenue */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cleared Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <IconTrending className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">₹{grossRevenue.toLocaleString("en-IN")}</div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="text-emerald-600 font-bold">{totalSoldCleared} items</span> verified & cleared at POS
            </div>
          </div>
        </div>

        {/* 50 SKUs Shelf Inventory & Live Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main 50 SKUs Table (2 Cols) */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            
            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Dynamic Shelf Slots & SKU Monitoring</h2>
                <p className="text-xs text-slate-500">50 SKUs calculated on: (Initial - InCart - Sold + Restock)</p>
              </div>

              {/* Search Box */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 50 SKUs (e.g. boAt, Lay's, Milk)..."
                className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-64"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 text-xs scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedCategory === cat 
                      ? "bg-slate-900 text-white" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scrollable 50 SKUs Table */}
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto pr-1">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white z-10 shadow-2xs">
                  <tr className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-200">
                    <th className="pb-3 pt-1">Product Description</th>
                    <th className="pb-3 pt-1">Shelf Stock</th>
                    <th className="pb-3 pt-1">Vacant Slots</th>
                    <th className="pb-3 pt-1">Clearance</th>
                    <th className="pb-3 pt-1 text-right">Pick (In Cart)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCatalog.map((item) => {
                    const isLow = item.currentStock <= 3;
                    const isOut = item.currentStock === 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-slate-800 text-xs sm:text-sm">{item.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-500 font-medium">{item.id}</span>
                            <span>•</span>
                            <span className="text-indigo-600 font-semibold">{item.category}</span>
                            <span>•</span>
                            <span className="text-slate-700 font-bold">₹{item.price}</span>
                          </div>
                        </td>

                        <td className="py-3">
                          <span className={`font-bold text-xs ${isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-slate-700"}`}>
                            {item.currentStock}
                          </span>
                          <span className="text-xs text-slate-400 font-normal"> / {item.capacity}</span>
                        </td>

                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            {item.emptySlots} empty
                          </span>
                        </td>

                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${item.clearanceRate}%` }} />
                            </div>
                            <span className="text-xs font-mono text-slate-500 font-medium">{item.clearanceRate}%</span>
                          </div>
                        </td>

                        <td className="py-3 text-right">
                          <button
                            disabled={isOut}
                            onClick={() => handlePickProduct(item.id, item.name)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition active:scale-95 ${
                              isOut 
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                : "bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700"
                            }`}
                          >
                            + Pick ({item.inCart})
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {filteredCatalog.length} of 50 SKUs</span>
              <span>Stock Clearance Engine: Dynamic In-Out Inferred</span>
            </div>
          </div>

          {/* Right Rail: Activity, Counter Stats & Audit (1 Col) */}
          <div className="space-y-6">

            {/* Counter Summary Box */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Counter Load Distribution</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">Counter 1 (Main POS)</span>
                  <span className="font-extrabold text-slate-900">{counterState.c1Queue} Customers</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">Counter 2 (Fast Lane)</span>
                  <span className="font-extrabold text-slate-900">{counterState.c2Queue} Customers</span>
                </div>
                <div className={`flex justify-between items-center p-2.5 rounded-xl border ${
                  counterState.c3Active ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-100 text-slate-400"
                }`}>
                  <span className="font-semibold">Counter 3 (Rush Buffer)</span>
                  <span className="font-extrabold">{counterState.c3Active ? "Operating" : "Closed"}</span>
                </div>
              </div>
            </div>

            {/* Realtime Activity Feed */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Vision Feed</h3>
                <span className="text-[11px] text-slate-400">Streamed</span>
              </div>
              <div className="space-y-3">
                {recentEvents.map((ev) => (
                  <div key={ev.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">{ev.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ev.time}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                      ev.type === "alert" ? "bg-rose-500" : ev.type === "pick" ? "bg-amber-500" : "bg-emerald-500"
                    }`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Invigilation Rule Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase mb-2">
                <IconShield className="w-4 h-4 text-indigo-300" />
                <span>Multi-Criteria Stock Engine</span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Non-Lot Dynamic Invigilation</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stock calculations lot-based nahi hain. Scanner in/out events, camera invigilated cart additions, aur counter queue checkout verification ke direct intersection se vacant slots aur clearance compute hoti hai.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
