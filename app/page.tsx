"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const MANAGER_PHONE = "9472948984";
const NTFY_TOPIC = `retail-vision-${MANAGER_PHONE}`;
const BACKEND_TUNNEL_URL = "https://puny-lands-flow.loca.lt";

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
  { id: "SKU-1837", barcode: "8901491101837", name: "Lays Magic Masala Chips", category: "Snacks", price: 20, capacity: 50, stock: 15, slot: "Shelf C-04" },
  { id: "SKU-1005", barcode: "8901262010051", name: "Amul Taaza Milk 1L", category: "Dairy", price: 74, capacity: 40, stock: 11, slot: "Chiller-01" },
  { id: "SKU-1009", barcode: "8901058852095", name: "Maggi 2-Minute Noodles", category: "Snacks", price: 96, capacity: 45, stock: 12, slot: "Shelf C-02" },
  { id: "SKU-2001", barcode: "8901030584201", name: "Colgate Strong Teeth 200g", category: "Essentials", price: 115, capacity: 35, stock: 9, slot: "Shelf E-01" },
  { id: "SKU-2002", barcode: "8901138501202", name: "Surf Excel Easy Wash 1kg", category: "Essentials", price: 135, capacity: 25, stock: 6, slot: "Shelf E-03" },
  { id: "SKU-2003", barcode: "8901030351203", name: "Clinic Plus Shampoo 340ml", category: "Essentials", price: 210, capacity: 30, stock: 8, slot: "Shelf E-04" },
  { id: "SKU-2004", barcode: "8901450021204", name: "Bru Instant Coffee 100g", category: "Beverages", price: 280, capacity: 20, stock: 4, slot: "Shelf F-01" },
];

export default function ARISMasterOS() {
  const [mounted, setMounted] = useState(false);
  
  // ---> Added back your original state logic for the menu <---
  const [activeView, setActiveView] = useState<"home" | "stock" | "dwell" | "billing">("home");
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [toast, setToast] = useState<string | null>(null);

  // Dynamic Logical Footfall State
  const [footfall, setFootfall] = useState({ in: 96, out: 63 });
  const activeInStore = Math.max(0, footfall.in - footfall.out);

  // Dynamic Live Counters State
  const [counters, setCounters] = useState({ c1: 5, c2: 2, c3Active: false });
  const lastAlertTimestamp = useRef<number>(0);
  const isQueueCritical = counters.c1 > 5 || counters.c2 > 5;

  const [skus, setSkus] = useState<SKUItem[]>(MASTER_SKUS);
  
  // Category-wise Continuous Live Sales
  const [categorySales, setCategorySales] = useState<Record<string, number>>({
    Gadgets: 1499,
    Essentials: 1154,
    Apparel: 923,
    Dairy: 508,
    Snacks: 462,
    Other: 92
  });

  const totalRevenue = Object.values(categorySales).reduce((a, b) => a + b, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerNtfyAlert = (title: string, msg: string) => {
    setToast(`🔔 Manager Alert Triggered: ${title}`);
    setTimeout(() => setToast(null), 3500);
  };

  const lowStockItems = skus.filter(s => (s.stock / s.capacity) <= 0.3).sort((a, b) => (a.stock / a.capacity) - (b.stock / b.capacity));

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#1e2330] text-white p-6 font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-md shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-[#252b3b] p-4 rounded-xl border border-gray-700 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-slate-700 p-2 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide flex items-center gap-2">
                ARIS <span className="text-sm font-normal text-gray-400">(AUTOMATED RETAIL INTELLIGENCE SYSTEM)</span>
              </h1>
              <p className="text-xs text-gray-400">DYNAMIC VISION INTELLIGENCE - AUTONOMOUS FOOTFALL & STOCK SYNCHRONIZATION</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#1b202c] border border-gray-600 px-3 py-1.5 rounded-full">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-400 tracking-wider">VISION ACTIVE</span>
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            
            {/* WORKABLE HAMBURGER MENU DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className={`p-2 rounded-md transition-colors ${menuOpen ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {menuOpen ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#252b3b] border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden">
                  {["home", "stock", "dwell", "billing"].map((view) => (
                    <button
                      key={view}
                      onClick={() => {
                        setActiveView(view as any);
                        setMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b last:border-b-0 border-gray-700 ${
                        activeView === view
                          ? "bg-[#6366f1] text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      {view} View
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* RENDER CONTENT BASED ON ACTIVE VIEW */}
        {activeView === "home" ? (
          <>
            {/* TOP ROW GRID */}
            <div className="grid grid-cols-12 gap-4">
              
              {/* IN GATE */}
              <div className="col-span-2 bg-[#252b3b] rounded-xl p-5 border border-gray-700 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <h3 className="text-xs font-semibold text-gray-300 text-center uppercase tracking-widest">Cam In<br/><span className="text-[10px] text-gray-500 normal-case">Optical In-Gate Entry</span></h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{footfall.in}</span>
                  <span className="text-sm font-semibold text-green-400">+5%</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">vs. previous hr</p>
                <div className="flex items-end gap-1 mt-4 h-6 w-full justify-center">
                  {[4, 6, 3, 7, 5, 8, 4, 9, 6].map((h, i) => (
                    <div key={i} className="w-1.5 bg-yellow-500 rounded-t-sm" style={{ height: `${h * 10}%` }}></div>
                  ))}
                </div>
              </div>

              {/* EXIT OUT */}
              <div className="col-span-2 bg-[#252b3b] rounded-xl p-5 border border-gray-700 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                 <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <h3 className="text-xs font-semibold text-gray-300 text-center uppercase tracking-widest">Exit Out<br/><span className="text-[10px] text-gray-500 normal-case">Checkout Gate Exit</span></h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{footfall.out}</span>
                  <span className="text-sm font-semibold text-gray-400">±0%</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">vs. previous hr</p>
                <div className="flex items-end gap-1 mt-4 h-6 w-full justify-center">
                   {[3, 4, 3, 5, 4, 6, 3, 4, 4].map((h, i) => (
                    <div key={i} className="w-1.5 bg-blue-500 rounded-t-sm opacity-50" style={{ height: `${h * 10}%` }}></div>
                  ))}
                </div>
              </div>

              {/* ACTIVE SHOPPERS */}
              <div className="col-span-2 bg-[#252b3b] rounded-xl p-5 border border-gray-700 flex flex-col items-center justify-center shadow-lg">
                 <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <h3 className="text-xs font-semibold text-gray-300 text-center uppercase tracking-widest">Active Shoppers<br/><span className="text-[10px] text-gray-500 normal-case">In-Floor Zone Occupancy</span></h3>
                <div className="mt-4 flex items-baseline gap-2 text-cyan-400">
                  <span className="text-5xl font-bold">{activeInStore}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">In-Floor Zone</p>
              </div>

              {/* QUEUE MONITORING */}
              <div className="col-span-6 bg-[#252b3b] rounded-xl p-5 border border-gray-700 shadow-lg flex flex-col justify-between">
                <h2 className="text-sm font-bold tracking-wider text-gray-200 mb-4 uppercase">Queue Monitoring & Live Alerts</h2>
                
                <div className="flex gap-6 h-full">
                  {/* Left Side: Counters */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span>COUNTER 1</span>
                        <span className="text-yellow-400">{counters.c1}/10 people</span>
                      </div>
                      <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(counters.c1/10)*100}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span>COUNTER 2</span>
                        <span className="text-blue-400">{counters.c2}/10</span>
                      </div>
                      <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(counters.c2/10)*100}%` }}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-4 bg-gray-600 rounded-full relative cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                         </div>
                         <span className="text-[10px] text-gray-400 font-bold tracking-wider">AUTO-LIMIT: &gt;5 IN LINE</span>
                       </div>
                       <button className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-4 py-1.5 rounded uppercase tracking-wider">
                         Open Counter 3
                       </button>
                    </div>
                  </div>

                  {/* Right Side: Alerts */}
                  <div className="w-64 bg-[#1b202c] border border-gray-700 rounded-lg p-4 flex flex-col justify-between">
                    <h3 className="text-[10px] text-gray-400 font-bold tracking-widest text-center uppercase">Alerts & Manager Notification</h3>
                    <div className="flex items-center justify-center gap-3 my-3 bg-red-900/20 border border-red-500/30 p-2 rounded-md">
                      <svg className="w-6 h-6 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <span className="text-red-400 font-bold text-sm tracking-wider">COUNTER ALERT</span>
                    </div>
                    <button 
                      onClick={() => triggerNtfyAlert("Counter Overload", "Queue limit exceeded")}
                      className="w-full bg-[#6366f1] hover:bg-indigo-500 text-white text-[10px] font-bold py-2 rounded uppercase flex items-center justify-center gap-2">
                      Notify Manager & Sound Alert
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW GRID */}
            <div className="grid grid-cols-12 gap-4">
              
              {/* LIVE DAILY SALES */}
              <div className="col-span-6 bg-[#252b3b] rounded-xl p-5 border border-gray-700 shadow-lg relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-bold tracking-wider text-gray-200 uppercase">Live Daily Sales & Telemetry Breakdown</h2>
                  <span className="text-2xl font-bold text-white tracking-wide">₹{totalRevenue.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-8 mt-4">
                  {/* Donut Chart (Simulated via CSS Conic Gradient) */}
                  <div className="relative w-48 h-48 rounded-full flex items-center justify-center" style={{
                    background: `conic-gradient(#06b6d4 0% 32%, #eab308 32% 57%, #3b82f6 57% 77%, #a855f7 77% 88%, #f97316 88% 98%, #64748b 98% 100%)`
                  }}>
                    <div className="w-32 h-32 bg-[#252b3b] rounded-full flex flex-col items-center justify-center shadow-inner">
                      <span className="text-[10px] text-gray-400 font-bold">TOTAL REV</span>
                      <span className="text-lg font-bold">₹{totalRevenue.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400">(Live)</span>
                    </div>
                  </div>

                  {/* Legend & Breakdown */}
                  <div className="flex-1 space-y-3">
                    {[
                      { name: "Gadgets", pct: "32%", color: "bg-cyan-500", val: categorySales.Gadgets },
                      { name: "Essentials", pct: "25%", color: "bg-yellow-500", val: categorySales.Essentials },
                      { name: "Apparel", pct: "20%", color: "bg-blue-500", val: categorySales.Apparel },
                      { name: "Dairy", pct: "11%", color: "bg-purple-500", val: categorySales.Dairy },
                      { name: "Snacks", pct: "10%", color: "bg-orange-500", val: categorySales.Snacks },
                      { name: "Other", pct: "2%", color: "bg-gray-500", val: categorySales.Other },
                    ].map(item => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 w-28">
                          <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
                          <span className="text-gray-300">{item.name} ({item.pct})</span>
                        </div>
                        <div className="flex-1 mx-3 h-1.5 bg-gray-700 rounded-full">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: item.pct }}></div>
                        </div>
                        <span className="font-medium text-gray-300 w-12 text-right">₹{item.val.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FIFO LOW STOCK ALERTS */}
              <div className="col-span-6 bg-[#252b3b] rounded-xl p-5 border border-gray-700 shadow-lg flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                   <h2 className="text-sm font-bold tracking-wider text-gray-200 uppercase">FIFO Low Stock Alerts</h2>
                   <span className="text-xs font-bold text-red-400 bg-red-900/30 px-3 py-1 rounded-md border border-red-500/30">
                     {lowStockItems.length} SKUs Critical
                   </span>
                </div>

                <div className="flex-1 overflow-hidden mb-4">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="pb-2 font-medium">Item</th>
                        <th className="pb-2 font-medium">Shelf/Aisle</th>
                        <th className="pb-2 font-medium">Quantity Left (%)</th>
                        <th className="pb-2 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.slice(0, 4).map((item, idx) => {
                        const pct = Math.round((item.stock / item.capacity) * 100);
                        let badgeClass = "bg-yellow-500 text-black";
                        let label = "Low Alert";
                        if (pct <= 20) {
                          badgeClass = "bg-red-500 text-white";
                          label = "Critical";
                        } else if (pct <= 27) {
                          badgeClass = "bg-orange-500 text-white";
                          label = "High Alert";
                        }

                        return (
                          <tr key={item.id} className="border-b border-gray-700/50 hover:bg-[#1b202c]">
                            <td className="py-2.5 flex items-center gap-2">
                              <span className="text-gray-500 font-mono">({idx + 1})</span>
                              <div className="w-6 h-6 bg-gray-800 rounded border border-gray-600 flex items-center justify-center text-[10px]">📦</div>
                              <span className="text-gray-200 truncate w-32">{item.name}</span>
                            </td>
                            <td className="py-2.5 text-gray-400">{item.slot}</td>
                            <td className="py-2.5 text-gray-300 font-mono">{item.stock}/{item.capacity} ({pct}%)</td>
                            <td className="py-2.5 text-right flex items-center justify-end gap-2">
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${badgeClass}`}>
                                 {label}
                               </span>
                               <button className="text-gray-400 hover:text-white" onClick={() => triggerNtfyAlert("Refill", item.name)}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                               </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button 
                  onClick={() => triggerNtfyAlert("Bulk Stock Check", "Automated scan requested")}
                  className="w-full bg-[#6366f1] hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded uppercase tracking-wider flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Push Bulk FIFO Alerts To Manager
                </button>
              </div>

            </div>
          </>
        ) : (
          /* PLACEHOLDER FOR OTHER VIEWS (STOCK, DWELL, BILLING) */
          <div className="flex flex-col items-center justify-center h-64 bg-[#252b3b] rounded-xl border border-gray-700">
            <svg className="w-16 h-16 text-gray-500 mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <h2 className="text-xl font-bold text-gray-300 uppercase tracking-widest">{activeView} View</h2>
            <p className="text-gray-500 mt-2">Replace this section with your {activeView} component code.</p>
          </div>
        )}
      </div>
    </div>
  );
}
