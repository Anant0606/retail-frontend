"use client";

import React, { useState, useEffect } from "react";

// --- Zero-Dependency Clean Inline SVG Icons ---
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

const IconShield = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconVolume = ({ active, className = "w-4 h-4" }: { active: boolean; className?: string }) => (
  active ? (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  ) : (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  )
);

const IconCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconSparkles = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </svg>
);

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Footfall Analytics
  const [footfall] = useState({
    in: 34,
    out: 22,
    currentInStore: 12
  });

  // Shelf Stock State
  const [shelfStock, setShelfStock] = useState([
    { id: "SKU-3059", name: "boAt Wave Smartwatch", initialCapacity: 15, currentStock: 9, price: 1499 },
    { id: "SKU-5962", name: "Crompton LED Light 5W", initialCapacity: 25, currentStock: 6, price: 1000 },
    { id: "SKU-1473", name: "Fingerprint Classics Book", initialCapacity: 20, currentStock: 14, price: 149 },
    { id: "SKU-1837", name: "Lays Magic Masala Chips", initialCapacity: 50, currentStock: 8, price: 20 }
  ]);

  // Invigilation & Cart Totals
  const [cartState, setCartState] = useState({
    inCartNotSold: 4,
    totalSoldUnits: 42,
    todayRevenue: 58940
  });

  const [recentEvents, setRecentEvents] = useState([
    { id: 1, text: "boAt Wave picked from Shelf B", time: "10s ago", type: "pick" },
    { id: 2, text: "2 visitors entered via Aisle 1", time: "1m ago", type: "footfall" },
    { id: 3, text: "Crompton LED moved to cart (Invigilated)", time: "3m ago", type: "alert" }
  ]);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Web Audio Alert Synthesizer
  const triggerAudio = (type: "pick" | "alert" | "checkout") => {
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
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "alert") {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
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

  const simulatePick = (skuId: string) => {
    setShelfStock((prev) =>
      prev.map((item) => {
        if (item.id === skuId && item.currentStock > 0) {
          const nextStock = item.currentStock - 1;
          triggerAudio(nextStock <= 3 ? "alert" : "pick");
          return { ...item, currentStock: nextStock };
        }
        return item;
      })
    );

    setCartState((prev) => ({ ...prev, inCartNotSold: prev.inCartNotSold + 1 }));
    setRecentEvents((prev) => [
      { id: Date.now(), text: `Item Picked [${skuId}] - Shelf updated`, time: "Just now", type: "pick" },
      ...prev.slice(0, 2)
    ]);
  };

  const handleCheckout = () => {
    if (cartState.inCartNotSold === 0) return;
    triggerAudio("checkout");

    setCartState((prev) => ({
      ...prev,
      totalSoldUnits: prev.totalSoldUnits + prev.inCartNotSold,
      todayRevenue: prev.todayRevenue + (prev.inCartNotSold * 450),
      inCartNotSold: 0
    }));

    setRecentEvents((prev) => [
      { id: Date.now(), text: "Cart Cleared & Invoiced via Vision Counter", time: "Just now", type: "checkout" },
      ...prev.slice(0, 2)
    ]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 font-sans text-sm">Initializing Retailer Vision OS...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Connecting to Edge Gateway...</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">Handshaking with Vision Terminal</p>
        <button
          onClick={() => setIsLoading(false)}
          className="text-xs bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-slate-800 transition"
        >
          Skip & Open Dashboard
        </button>
      </div>
    );
  }

  const totalCapacity = shelfStock.reduce((acc, c) => acc + c.initialCapacity, 0);
  const totalRemaining = shelfStock.reduce((acc, c) => acc + c.currentStock, 0);
  const clearedUnits = totalCapacity - totalRemaining;
  const clearanceRate = Math.round((clearedUnits / totalCapacity) * 100);

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 font-sans relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500">Autonomous Shelf Compliance & Footfall Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Team AIRS Signature Badge */}
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
              onClick={handleCheckout}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm active:scale-95"
            >
              <IconCheck className="w-4 h-4 text-emerald-400" />
              <span>Checkout Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Visitor Footfall</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <IconUsers className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{footfall.currentInStore} <span className="text-xs font-normal text-slate-500">in store</span></div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs font-semibold">
              <span className="text-emerald-600 font-medium">In: {footfall.in}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-medium">Out: {footfall.out}</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Invigilated Items</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cartState.inCartNotSold > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
                <IconAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600">{cartState.inCartNotSold} <span className="text-xs font-normal text-slate-500">in cart</span></div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
              <IconShield className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Camera active: In Cart, Not Sold</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Shelf Clearance</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <IconPackage className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{clearanceRate}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${clearanceRate}%` }} />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cleared Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <IconTrending className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">₹{cartState.todayRevenue.toLocaleString("en-IN")}</div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="text-emerald-600 font-bold">{cartState.totalSoldUnits} products</span> cleared
            </div>
          </div>
        </div>

        {/* Shelf Table & Live Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Live Shelf Slots & Stock Status</h2>
                <p className="text-xs text-slate-500">Auto-vision updates vacant slots when items are picked</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                {totalRemaining} units on shelf
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
                    <th className="pb-3">Product Description</th>
                    <th className="pb-3">Stock Left</th>
                    <th className="pb-3">Empty Slots</th>
                    <th className="pb-3 text-right">Pick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shelfStock.map((item) => {
                    const emptySlots = item.initialCapacity - item.currentStock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5">
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-xs text-slate-400 font-mono">{item.id} • ₹{item.price}</div>
                        </td>
                        <td className="py-3.5 font-semibold text-slate-700">
                          {item.currentStock} <span className="text-xs text-slate-400">/ {item.initialCapacity}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            {emptySlots} vacant
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => simulatePick(item.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 transition"
                          >
                            + Pick
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Store Activity</h3>
                <span className="text-[11px] text-slate-400">Real-time</span>
              </div>
              <div className="space-y-3">
                {recentEvents.map((ev) => (
                  <div key={ev.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">{ev.text}</p>
                      <p className="text-[10px] text-slate-400">{ev.time}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                      ev.type === "alert" ? "bg-amber-500" : ev.type === "pick" ? "bg-indigo-500" : "bg-emerald-500"
                    }`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase mb-2">
                <IconShield className="w-4 h-4 text-indigo-300" />
                <span>Invigilation Rule</span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1">In Cart & Not Sold Detection</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Jab koi customer shelf se item pick karta hai, vision AI use "Invigilated" mark karta hai. Counter checkout par status safely clear ho jata hai.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
