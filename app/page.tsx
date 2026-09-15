"use client";

import React, { useState } from "react";
import { 
  Store, Users, ShoppingCart, AlertCircle, ArrowUpRight, 
  ArrowDownLeft, Volume2, VolumeX, CheckCircle, Package, 
  TrendingUp, Activity, Sparkles, ShieldCheck
} from "lucide-react";

// Types & Interfaces
interface FootfallData {
  in: number;
  out: number;
  currentInStore: number;
}

interface ShelfItem {
  id: string;
  name: string;
  initialCapacity: number;
  currentStock: number;
  price: number;
  category: string;
}

interface CartSummary {
  inCartNotSold: number;
  totalSoldUnits: number;
  todayRevenue: number;
}

interface LiveEvent {
  id: number;
  text: string;
  time: string;
  type: "pick" | "footfall" | "alert" | "checkout";
}

// Web Audio API Synthesis
const triggerWebAudio = (type: "pick" | "alert" | "checkout"): void => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "pick") {
      osc.frequency.setValueAtTime(820, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === "alert") {
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "checkout") {
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.setValueAtTime(780, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    }
  } catch (e) {
    console.error("Audio trigger failed", e);
  }
};

export default function RetailStudioDashboard() {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Footfall Analytics
  const [footfall, setFootfall] = useState<FootfallData>({
    in: 34,
    out: 22,
    currentInStore: 12
  });

  // Shelf Stock State
  const [shelfStock, setShelfStock] = useState<ShelfItem[]>([
    { id: "SKU-3059", name: "boAt Wave Smartwatch", initialCapacity: 15, currentStock: 9, price: 1499, category: "Wearables" },
    { id: "SKU-5962", name: "Crompton LED Light 5W", initialCapacity: 25, currentStock: 6, price: 1000, category: "Lighting" },
    { id: "SKU-1473", name: "Fingerprint Classics Book", initialCapacity: 20, currentStock: 14, price: 149, category: "Books" },
    { id: "SKU-1837", name: "Lays Magic Masala Chips", initialCapacity: 50, currentStock: 8, price: 20, category: "Snacks" }
  ]);

  // Invigilation & Cart Totals
  const [cartState, setCartState] = useState<CartSummary>({
    inCartNotSold: 4,
    totalSoldUnits: 42,
    todayRevenue: 58940
  });

  const [recentEvents, setRecentEvents] = useState<LiveEvent[]>([
    { id: 1, text: "boAt Wave picked from Shelf B", time: "10s ago", type: "pick" },
    { id: 2, text: "2 visitors entered via Aisle 1", time: "1m ago", type: "footfall" },
    { id: 3, text: "Crompton LED moved to cart (Invigilated)", time: "3m ago", type: "alert" }
  ]);

  const simulatePick = (skuId: string): void => {
    setShelfStock((prev) =>
      prev.map((item) => {
        if (item.id === skuId && item.currentStock > 0) {
          const nextStock = item.currentStock - 1;
          if (audioEnabled) triggerWebAudio(nextStock <= 3 ? "alert" : "pick");
          return { ...item, currentStock: nextStock };
        }
        return item;
      })
    );

    setCartState((prev) => ({ ...prev, inCartNotSold: prev.inCartNotSold + 1 }));
    setRecentEvents((prev) => [
      { id: Date.now(), text: `Item Picked [${skuId}] - Shelf updated`, time: "Just now", type: "pick" },
      ...prev.slice(0, 3)
    ]);
  };

  const handleCheckout = (): void => {
    if (cartState.inCartNotSold === 0) return;
    if (audioEnabled) triggerWebAudio("checkout");

    setCartState((prev) => ({
      ...prev,
      totalSoldUnits: prev.totalSoldUnits + prev.inCartNotSold,
      todayRevenue: prev.todayRevenue + (prev.inCartNotSold * 450),
      inCartNotSold: 0
    }));

    setRecentEvents((prev) => [
      { id: Date.now(), text: "Cart Cleared & Invoiced via Vision Counter", time: "Just now", type: "checkout" },
      ...prev.slice(0, 3)
    ]);
  };

  // Aggregates
  const totalCapacity = shelfStock.reduce((acc, c) => acc + c.initialCapacity, 0);
  const totalRemaining = shelfStock.reduce((acc, c) => acc + c.currentStock, 0);
  const clearedUnits = totalCapacity - totalRemaining;
  const clearanceRate = Math.round((clearedUnits / totalCapacity) * 100);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Retail Glow Highlights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar */}
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

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Team AIRS Branding Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/80 shadow-2xs">
              <Sparkles size={15} className="text-indigo-600" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Designed By</p>
                <p className="text-xs font-extrabold text-indigo-900 tracking-wide">TEAM AIRS</p>
              </div>
            </div>

            {/* Audio Feedback Button */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              title="Toggle Audio Alerts"
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                audioEnabled 
                  ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs" 
                  : "bg-rose-50 text-rose-600 border-rose-200"
              }`}
            >
              {audioEnabled ? <Volume2 size={16} className="text-indigo-600" /> : <VolumeX size={16} />}
              <span className="hidden md:inline">{audioEnabled ? "Alerts On" : "Muted"}</span>
            </button>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm hover:shadow-md active:scale-98"
            >
              <CheckCircle size={15} className="text-emerald-400" />
              <span>Checkout Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Footfall */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Visitor Footfall</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users size={17} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{footfall.currentInStore}</span>
              <span className="text-xs font-medium text-slate-500">in store now</span>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ArrowDownLeft size={13} /> In: {footfall.in}
              </span>
              <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                <ArrowUpRight size={13} /> Out: {footfall.out}
              </span>
            </div>
          </div>

          {/* Invigilated */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Invigilated Items</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cartState.inCartNotSold > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
                <AlertCircle size={17} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600 tracking-tight">{cartState.inCartNotSold}</span>
              <span className="text-xs font-medium text-slate-500">units in cart</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
              <ShieldCheck size={14} className="text-amber-600 shrink-0" />
              <span>Camera active: In Cart, Not Sold</span>
            </div>
          </div>

          {/* Clearance */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Shelf Clearance</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Package size={17} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{clearanceRate}%</span>
              <span className="text-xs font-medium text-slate-500">{clearedUnits} of {totalCapacity} cleared</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${clearanceRate}%` }} />
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cleared Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp size={17} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 tracking-tight">₹{cartState.todayRevenue.toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <span className="text-emerald-600 font-bold">{cartState.totalSoldUnits} products</span> successfully billed
            </div>
          </div>
        </div>

        {/* Tables & Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Shelf Stock (2 Cols) */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">Live Shelf Slots & Stock Status</h2>
                <p className="text-xs text-slate-500">Autonomous vision tracking for vacant slots as products clear out</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                {totalRemaining} units on shelf
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3 font-semibold">Product Description</th>
                    <th className="pb-3 font-semibold">Stock Remaining</th>
                    <th className="pb-3 font-semibold">Empty Slots</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shelfStock.map((item) => {
                    const emptySlots = item.initialCapacity - item.currentStock;
                    const isLow = item.currentStock <= 3;
                    const isModerate = item.currentStock <= 6;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5">
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                            <span>{item.id}</span>
                            <span>•</span>
                            <span className="text-slate-600 font-semibold">₹{item.price}</span>
                          </div>
                        </td>

                        <td className="py-3.5">
                          <span className="font-semibold text-slate-700">{item.currentStock}</span>
                          <span className="text-xs text-slate-400"> / {item.initialCapacity}</span>
                        </td>

                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            {emptySlots} vacant
                          </span>
                        </td>

                        <td className="py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isLow 
                              ? "bg-rose-50 text-rose-700 border border-rose-200" 
                              : isModerate 
                              ? "bg-amber-50 text-amber-700 border border-amber-200" 
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {isLow ? "Low Stock" : isModerate ? "Restock Soon" : "Optimal"}
                          </span>
                        </td>

                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => simulatePick(item.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 transition active:scale-95"
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

          {/* Right Rail: Timeline & Invigilation (1 Col) */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Activity size={15} className="text-indigo-600" />
                  Live Store Activity
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Real-time</span>
              </div>

              <div className="space-y-3">
                {recentEvents.map((ev) => (
                  <div key={ev.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">{ev.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ev.time}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                      ev.type === "alert" ? "bg-amber-500" : ev.type === "pick" ? "bg-indigo-500" : "bg-emerald-500"
                    }`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck size={16} />
                <span>Invigilation Rule</span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1">In Cart & Not Sold Detection</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Jab koi customer shelf se samaan pick karke cart me daalta hai, vision AI use "Invigilated" flag assign karta hai. Counter par billing complete hote hi shelf clearance update hoti hai.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
