"use client";

import React, { useState, useEffect } from "react";
import { 
  Store, 
  Users, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  Package, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  ShieldCheck 
} from "lucide-react";

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

  // Ensure Component Only Mounts on Browser (Prevents Next.js 15 SSR Build Hanging)
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Safe Web Audio API (Strictly inside client check)
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
      // Ignore audio failures safely
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

  // SSR skeleton render during Next.js 15 build pass
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 font-sans text-sm">Initializing Retailer Vision OS...</div>
      </div>
    );
  }

  // Quick Loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Connecting to Edge Gateway...</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">Handshaking with Vision Terminal</p>
        <button
          onClick={() => setIsLoading(false)}
          className="text-xs bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold shadow-sm"
        >
          Skip & Open Dashboard
        </button>
      </div>
    );
  }

  // Calculations
  const totalCapacity = shelfStock.reduce((acc, c) => acc + c.initialCapacity, 0);
  const totalRemaining = shelfStock.reduce((acc, c) => acc + c.currentStock, 0);
  const clearedUnits = totalCapacity - totalRemaining;
  const clearanceRate = Math.round((clearedUnits / totalCapacity) * 100);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Store size={22} />
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
            {/* Team AIRS Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/80">
              <Sparkles size={15} className="text-indigo-600" />
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
              {audioEnabled ? <Volume2 size={16} className="text-indigo-600" /> : <VolumeX size={16} />}
              <span className="hidden md:inline">{audioEnabled ? "Alerts On" : "Muted"}</span>
            </button>

            <button
              onClick={handleCheckout}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm active:scale-95"
            >
              <CheckCircle size={15} className="text-emerald-400" />
              <span>Checkout Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Visitor Footfall</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users size={17} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{footfall.currentInStore} <span className="text-xs font-normal text-slate-500">in store</span></div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-600"><ArrowDownLeft size={13} /> In: {footfall.in}</span>
              <span className="flex items-center gap-1 text-slate-500"><ArrowUpRight size={13} /> Out: {footfall.out}</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Invigilated Items</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cartState.inCartNotSold > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
                <AlertCircle size={17} />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600">{cartState.inCartNotSold} <span className="text-xs font-normal text-slate-500">in cart</span></div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
              <ShieldCheck size={14} className="text-amber-600 shrink-0" />
              <span>Camera active: In Cart, Not Sold</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Shelf Clearance</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Package size={17} />
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
                <TrendingUp size={17} />
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Activity size={15} className="text-indigo-600" />
                  Live Store Activity
                </h3>
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
                <ShieldCheck size={16} />
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
