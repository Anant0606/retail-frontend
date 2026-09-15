"use client";

import React, { useState, useEffect } from "react";

const MANAGER_PHONE = "9472948984";
const BACKEND_TUNNEL_URL = "https://yummy-signs-relate.loca.lt";

const STORE_SKUS = [
  { id: "SKU-3059", barcode: "8905650133059", name: "boAt Wave Smartwatch", slot: "Shelf A-01", capacity: 20, price: 1499 },
  { id: "SKU-5962", barcode: "8902653015962", name: "Crompton LED Bulb 5W", slot: "Shelf B-02", capacity: 35, price: 1000 },
  { id: "SKU-1473", barcode: "9789354401473", name: "Fingerprint Classics", slot: "Aisle D-01", capacity: 25, price: 149 },
  { id: "SKU-1837", barcode: "8901491101837", name: "Lay's Magic Masala", slot: "Shelf C-04", capacity: 60, price: 20 },
  { id: "SKU-1005", barcode: "8901262010051", name: "Amul Taaza Milk 1L", slot: "Chiller-01", capacity: 40, price: 74 },
  { id: "SKU-1009", barcode: "8901058852095", name: "Maggi 2-Minute Noodles", slot: "Shelf C-01", capacity: 45, price: 96 },
];

export default function RetailerVisionDashboard() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [thermalFrame, setThermalFrame] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Counter Load
  const [counters, setCounters] = useState({ c1: 5, c2: 4, c3Active: false });
  const isQueueBottleneck = (counters.c1 >= 4 && counters.c2 >= 4) && !counters.c3Active;

  // Footfall Stats
  const [footfall, setFootfall] = useState({ in: 72, out: 44 });
  const activeShoppers = Math.max(0, footfall.in - footfall.out);

  // Dynamic Shelf Stock
  const [slotData, setSlotData] = useState<Record<string, { inCart: number; sold: number; restocked: number }>>({
    "SKU-3059": { inCart: 3, sold: 13, restocked: 0 },
    "SKU-1837": { inCart: 5, sold: 44, restocked: 0 },
    "SKU-5962": { inCart: 2, sold: 25, restocked: 0 },
  });

  // Dwell Hotspots
  const [dwellSpots] = useState([
    { shelf: "Shelf C (Snacks)", dwell: 215, intensity: "Critical Red Hotspot", alert: true },
    { shelf: "Shelf A (Wearables)", dwell: 146, intensity: "Warm Wave Dwell", alert: true },
    { shelf: "Shelf B (Lighting)", dwell: 52, intensity: "Normal Warm", alert: false },
  ]);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Depleted SKUs (< 70%)
  const lowStockItems = STORE_SKUS.map(item => {
    const live = slotData[item.id] || { inCart: 0, sold: 0, restocked: 0 };
    const cur = Math.max(0, item.capacity - (live.inCart + live.sold) + live.restocked);
    const ratio = cur / item.capacity;
    return { ...item, cur, ratio };
  }).filter(s => s.ratio < 0.7);

  // Poll Thermal Stream from Backend
  useEffect(() => {
    let active = true;
    const fetchStream = async () => {
      try {
        const res = await fetch(`${BACKEND_TUNNEL_URL}/thermal_frame`, {
          headers: { "bypass-tunnel-reminder": "true" }
        });
        const data = await res.json();
        if (data.status === "ok" && data.image && active) {
          setThermalFrame(`data:image/jpeg;base64,${data.image}`);
          setStreamActive(true);
        }
      } catch {
        // Fallback simulation stays active
      } finally {
        if (active) setTimeout(fetchStream, 90);
      }
    };
    fetchStream();
    return () => { active = false; };
  }, []);

  // --- DISPATCH HANDLERS (WHATSAPP, SMS, OR DUAL) ---
  const sendWhatsAppNotification = (title: string, msg: string) => {
    const text = encodeURIComponent(
      `🚨 *RETAILER VISION OS ALERT*\n\n` +
      `📌 *Event:* ${title}\n` +
      `⚠️ *Details:* ${msg}\n` +
      `⏱️ *Time:* ${new Date().toLocaleTimeString()}\n\n` +
      `👉 *Target Phone:* +91-${MANAGER_PHONE}`
    );
    window.open(`https://wa.me/91${MANAGER_PHONE}?text=${text}`, "_blank");
    notify(`WhatsApp alert prepared for +91-${MANAGER_PHONE}`);
  };

  const sendSMSNotification = (title: string, msg: string) => {
    const text = encodeURIComponent(`ALERT [${title}]: ${msg}. Retailer Vision OS`);
    window.open(`sms:+91${MANAGER_PHONE}?body=${text}`, "_blank");
    notify(`SMS Gateway opened for +91-${MANAGER_PHONE}`);
  };

  const sendDualAlert = async (title: string, msg: string) => {
    notify("Dispatching Dual WhatsApp + SMS alert...");
    try {
      await fetch(`${BACKEND_TUNNEL_URL}/notify-dual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true"
        },
        body: JSON.stringify({ title, details: msg, channel: "BOTH" })
      });
      notify("Dual WhatsApp & SMS dispatched via Backend Gateway!");
    } catch {
      // Direct Web fallback if backend offline
      sendWhatsAppNotification(title, msg);
    }
  };

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 lg:p-6 space-y-4 relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* 🚨 DUAL-CHANNEL ALERT NOTIFICATION CENTER (WhatsApp + SMS) */}
      <section className="space-y-2">
        {/* Queue Congestion Alert */}
        {isQueueBottleneck && (
          <div className="p-4 bg-rose-950/40 border border-rose-600/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide text-rose-400">Queue Bottleneck Detected</h4>
                <p className="text-xs text-slate-300">
                  Counter 1 ({counters.c1} persons) & Counter 2 ({counters.c2} persons) congested. Deploy Counter 3 immediately!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* WhatsApp Action */}
              <button
                onClick={() => sendWhatsAppNotification(
                  "QUEUE CONGESTION",
                  `C1 (${counters.c1}) & C2 (${counters.c2}) congested. Open Counter 3 immediately!`
                )}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>WhatsApp</span>
              </button>

              {/* SMS Action */}
              <button
                onClick={() => sendSMSNotification(
                  "QUEUE CONGESTION",
                  `C1 (${counters.c1}) & C2 (${counters.c2}) congested. Open Counter 3!`
                )}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>SMS</span>
              </button>

              {/* Dual WhatsApp + SMS */}
              <button
                onClick={() => sendDualAlert(
                  "CRITICAL BHEED ALERT",
                  `Counter 1 (${counters.c1}) & Counter 2 (${counters.c2}) congested. Open Counter 3 immediately!`
                )}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
              >
                Dual Alert (WA + SMS)
              </button>

              <button
                onClick={() => setCounters(prev => ({ ...prev, c3Active: true }))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
              >
                Open C3
              </button>
            </div>
          </div>
        )}

        {/* Shelf Depletion Alert */}
        {lowStockItems.length > 0 && (
          <div className="p-3.5 bg-amber-950/30 border border-amber-500/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-xs text-amber-200">
                <b>{lowStockItems.length} Shelf Slots</b> fallen below 70%: {lowStockItems.map(i => `${i.name} (${Math.round(i.ratio * 100)}%)`).join(", ")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => sendWhatsAppNotification(
                  "LOW STOCK REFILL NOTICE",
                  `Restock needed: ${lowStockItems.map(i => `${i.slot} - ${i.name}`).join(" | ")}`
                )}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold whitespace-nowrap"
              >
                WhatsApp Staff
              </button>

              <button
                onClick={() => sendSMSNotification(
                  "LOW STOCK REFILL NOTICE",
                  `Restock needed: ${lowStockItems.map(i => `${i.slot} - ${i.name}`).join(" | ")}`
                )}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold whitespace-nowrap"
              >
                SMS Staff
              </button>
            </div>
          </div>
        )}
      </section>

      {/* TOP HEADER */}
      <header className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
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
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">Active Footfall</span>
            <span className="text-xl font-black text-indigo-400">{activeShoppers}</span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <form onSubmit={handleBarcodeInputSubmit} className="flex gap-2">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan Barcode / SKU Code..."
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-slate-100"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm"
            >
              Scan Bar Prod
            </button>
          </form>
        </div>

        <div className="lg:col-span-3 flex justify-end">
          <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-800/60 text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Manager Alert Target</span>
            <span className="text-xs font-black text-indigo-300 tracking-wider">+91-{MANAGER_PHONE}</span>
          </div>
        </div>
      </header>

      {/* TWO-COLUMN LAYOUT (Paper Sketch Aligned) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Counter + Action */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Counter Queue + Action</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Channel: WhatsApp + SMS Ready
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
                <p className="text-[11px] text-slate-500">Scroll down to see active products in cart</p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/50 px-2 py-1 rounded border border-amber-800">
                FIFO Monitored
              </span>
            </div>

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

        {/* RIGHT COLUMN: Thermal Warm Wave Surveillance Stream */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Camera Stream</h3>
                <p className="text-[10px] text-slate-500 font-mono">Warm Wave Overlay • Facial Anonymization Active</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>DPDP IR SENSOR</span>
              </span>
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center shadow-inner">
              {streamActive && thermalFrame ? (
                <img src={thermalFrame} alt="Thermal Warm Wave CCTV" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-950 p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                    <span>AISLE_CAM_01 [DROIDCAM / IR OVERLAY]</span>
                    <span>NO PII RECORDED</span>
                  </div>

                  <div className="relative w-full h-28 my-auto flex items-center justify-center">
                    <div className="absolute left-10 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 opacity-80 blur-xs animate-pulse" />
                      <div className="mt-1 px-2 py-0.5 bg-red-950/80 border border-red-600 rounded text-[9px] font-mono text-red-300">
                        WARM WAVE: DWELL 146s
                      </div>
                    </div>

                    <div className="absolute right-12 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full border-2 border-red-500 bg-red-600/30 flex items-center justify-center animate-ping" />
                      <div className="mt-1 px-2 py-0.5 bg-amber-950/80 border border-amber-500 rounded text-[9px] font-mono text-amber-300">
                        HOTSPOT: SHELF C (215s)
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono flex justify-between">
                    <span>Centroid: Warm Wave Active</span>
                    <span>Face Identity: Stripped</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dwell Time Analytics */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2.5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Camera Data (Dwell Time)</h3>
              <span className="text-[10px] font-mono text-amber-400">Heat Signature</span>
            </div>
            <div className="space-y-2 text-xs">
              {dwellSpots.map((spot, i) => (
                <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">{spot.shelf}</span>
                    <span className={`text-[10px] block font-mono ${spot.alert ? "text-red-400 font-bold" : "text-slate-500"}`}>
                      {spot.intensity}
                    </span>
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
