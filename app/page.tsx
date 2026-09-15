"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

const MANAGER_PHONE = "9472948984";
const NTFY_TOPIC = `retail-vision-${MANAGER_PHONE}`;
const BACKEND_TUNNEL_URL = "https://yummy-signs-relate.loca.lt";

const STORE_SKUS = [
  { id: "SKU-3059", barcode: "8905650133059", name: "boAt Wave Smartwatch", slot: "Shelf A-01", capacity: 20, price: 1499 },
  { id: "SKU-5962", barcode: "8902653015962", name: "Crompton LED Bulb 5W", slot: "Shelf B-02", capacity: 35, price: 1000 },
  { id: "SKU-1473", barcode: "9789354401473", name: "Fingerprint Classics", slot: "Aisle D-01", capacity: 25, price: 149 },
  { id: "SKU-1837", barcode: "8901491101837", name: "Lay's Magic Masala Chips", slot: "Shelf C-04", capacity: 60, price: 20 },
  { id: "SKU-1005", barcode: "8901262010051", name: "Amul Taaza Milk 1L", slot: "Chiller-01", capacity: 40, price: 74 },
  { id: "SKU-1009", barcode: "8901058852095", name: "Maggi 2-Minute Noodles", slot: "Shelf C-01", capacity: 45, price: 96 },
];

export default function WireframeDashboard() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [feedMode, setFeedMode] = useState<"LIVE_THERMAL" | "DEMO_HEATWAVE">("DEMO_HEATWAVE");
  const [thermalFrame, setThermalFrame] = useState<string | null>(null);

  // Counter Load Management
  const [counters, setCounters] = useState({ c1: 4, c2: 4, c3Active: false, rushAlert: true });

  // Footfall Stats
  const [footfall, setFootfall] = useState({ in: 62, out: 38 });
  const activeFootfall = Math.max(0, footfall.in - footfall.out);

  // Shelf Inventory & In-Cart Tracking
  const [slotData, setSlotData] = useState<Record<string, { inCart: number; sold: number; restocked: number }>>({
    "SKU-3059": { inCart: 2, sold: 13, restocked: 0 },
    "SKU-1837": { inCart: 4, sold: 42, restocked: 0 },
    "SKU-5962": { inCart: 1, sold: 26, restocked: 0 },
  });

  // Dwell Hotspots
  const [dwellSpots] = useState([
    { shelf: "Shelf A (Smartwatches)", dwell: 146, intensity: "Red Hotspot" },
    { shelf: "Shelf B (Lighting)", dwell: 52, intensity: "Moderate Warm" },
    { shelf: "Shelf C (Snacks)", dwell: 215, intensity: "Critical Red Hotspot" },
  ]);

  // Polling DPDP-Compliant Thermal Stream
  useEffect(() => {
    let active = true;
    const fetchThermal = async () => {
      try {
        const res = await fetch(`${BACKEND_TUNNEL_URL}/thermal_frame`, {
          headers: { "bypass-tunnel-reminder": "true" }
        });
        const data = await res.json();
        if (data.status === "ok" && data.image && active) {
          setThermalFrame(`data:image/jpeg;base64,${data.image}`);
          setFeedMode("LIVE_THERMAL");
        }
      } catch {
        // Keeps DEMO_HEATWAVE active with zero flicker
      } finally {
        if (active) setTimeout(fetchThermal, 100);
      }
    };
    fetchThermal();
    return () => { active = false; };
  }, []);

  const handlePickReturn = (skuId: string, delta: number) => {
    setSlotData(prev => {
      const cur = prev[skuId] || { inCart: 0, sold: 0, restocked: 0 };
      const nextCart = Math.max(0, cur.inCart + delta);
      return { ...prev, [skuId]: { ...cur, inCart: nextCart } };
    });
  };

  const handleBarcodeInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = STORE_SKUS.find(s => s.barcode === barcodeInput.trim() || s.id === barcodeInput.trim());
    if (item) {
      handlePickReturn(item.id, 1);
      setBarcodeInput("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 lg:p-6 space-y-4">

      {/* TOP HEADER: In / Out / Footfall + About AIRS Team + Scan Barcode */}
      <header className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        
        {/* Footfall Micro Cards (In, Out, Active) */}
        <div className="lg:col-span-4 flex items-center gap-2">
          <div className="flex-1 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Cam In</span>
            <span className="text-xl font-black text-white">{footfall.in}</span>
          </div>
          <div className="flex-1 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-rose-400 block">Exit Out</span>
            <span className="text-xl font-black text-white">{footfall.out}</span>
          </div>
          <div className="flex-1 bg-slate-950 border border-indigo-900/60 p-2.5 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">Footfall</span>
            <span className="text-xl font-black text-indigo-400">{activeFootfall}</span>
          </div>
        </div>

        {/* Scan Bar Product Form */}
        <div className="lg:col-span-5">
          <form onSubmit={handleBarcodeInputSubmit} className="flex gap-2">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan Barcode / SKU Code..."
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm"
            >
              Scan Bar Prod
            </button>
          </form>
        </div>

        {/* About AIRS Team Badge */}
        <div className="lg:col-span-3 flex justify-end">
          <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-800/60 text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Powered By</span>
            <span className="text-xs font-black text-indigo-300 tracking-wider">TEAM AIRS</span>
          </div>
        </div>

      </header>

      {/* MAIN TWO-COLUMN SPLIT (Layout matching hand-drawn paper sketch) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* LEFT COLUMN: Counter Load + Products Left / Cart (Scrollable) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Counter + Action */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Counter Queue + Action</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300">
                Threshold: &ge; 4 Rush
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">Counter 1</span>
                <span className="text-lg font-black text-white">{counters.c1} in Line</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">Counter 2</span>
                <span className="text-lg font-black text-white">{counters.c2} in Line</span>
              </div>
              <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                counters.c3Active ? "bg-emerald-950/40 border-emerald-800" : "bg-slate-950 border-slate-800"
              }`}>
                <span className="text-[10px] text-slate-400 font-bold">Counter 3</span>
                <button
                  onClick={() => setCounters(prev => ({ ...prev, c3Active: !prev.c3Active }))}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition ${
                    counters.c3Active ? "bg-rose-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                >
                  {counters.c3Active ? "Close C3" : "Open C3"}
                </button>
              </div>
            </div>
          </div>

          {/* Products Left Action + Scrollable Cart List */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Products Left Action (Shelf Slots)</h3>
                <p className="text-[11px] text-slate-500">Scroll down to see active products in customer cart</p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/50 px-2 py-1 rounded border border-amber-800">
                FIFO Monitored
              </span>
            </div>

            {/* Scrollable Container */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {STORE_SKUS.map(item => {
                const live = slotData[item.id] || { inCart: 0, sold: 0, restocked: 0 };
                const remaining = Math.max(0, item.capacity - (live.inCart + live.sold) + live.restocked);
                const isLow = remaining / item.capacity < 0.7;

                return (
                  <div key={item.id} className="p-3 bg-slate-950 border border-slate-800/90 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{item.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 bg-slate-900 rounded">{item.slot}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Shelf Stock: <b className={isLow ? "text-amber-400" : "text-white"}>{remaining}</b> / {item.capacity} units
                        {isLow && <span className="text-amber-400 ml-1 font-bold">(&lt; 70%)</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-[11px] font-mono font-bold ${
                        live.inCart > 0 ? "bg-indigo-950 text-indigo-300 border border-indigo-800" : "text-slate-500"
                      }`}>
                        Cart: {live.inCart}
                      </span>
                      <button
                        onClick={() => handlePickReturn(item.id, 1)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded"
                      >
                        + Pick
                      </button>
                      <button
                        onClick={() => handlePickReturn(item.id, -1)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded"
                      >
                        - Return
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Live Feeds + DPDP-Compliant Dwell Heatwave */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Live Feeds Container */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Feeds (Thermal CCTV)</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded">
                DPDP Anonymized
              </span>
            </div>

            {/* Video / Heatwave Screen */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
              {feedMode === "LIVE_THERMAL" && thermalFrame ? (
                <img src={thermalFrame} alt="Thermal CCTV Feed" className="w-full h-full object-cover" />
              ) : (
                /* DPDP-Compliant Pre-loaded Heatwave Simulation (Zero Facial Data) */
                <div className="w-full h-full bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950 p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                    <span>IR THERMAL SENSOR [AISLE 02]</span>
                    <span>NO PII RECORDED</span>
                  </div>

                  {/* Red Heat Spots (Dwell Footprint without faces) */}
                  <div className="relative w-full h-24 my-auto flex items-center justify-center">
                    <div className="absolute left-8 w-16 h-16 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center animate-ping" />
                    <div className="absolute left-8 px-2 py-1 bg-red-950/80 border border-red-600 rounded text-[9px] font-mono text-red-300">
                      RED SPOT: DWELL 146s
                    </div>

                    <div className="absolute right-12 w-20 h-20 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center" />
                    <div className="absolute right-12 px-2 py-1 bg-amber-950/80 border border-amber-500 rounded text-[9px] font-mono text-amber-300">
                      WARM: DWELL 52s
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono flex justify-between">
                    <span>Target: Heat wave centroid</span>
                    <span>Face data: Stripped</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dwell Time Analytics Card */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Camera Data (Dwell Time)</h3>
            <div className="space-y-2 text-xs">
              {dwellSpots.map((spot, i) => (
                <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">{spot.shelf}</span>
                    <span className="text-[10px] text-red-400 block font-mono">{spot.intensity}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">{spot.dwell}s linger</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

