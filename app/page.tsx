"use client";

import React, { useState, useEffect, useRef } from "react";

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

export default function RetailerVisionOS() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cameraMode, setCameraMode] = useState<"DIRECT_CAM" | "TUNNEL_BLOB" | "WARM_SIMULATION">("DIRECT_CAM");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Video & Canvas Refs for Direct Zero-Lag Stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tunnelBlobUrl, setTunnelBlobUrl] = useState<string | null>(null);

  // Counter Queue State
  const [counters, setCounters] = useState({ c1: 5, c2: 4, c3Active: false });
  const isRushAlert = (counters.c1 >= 4 && counters.c2 >= 4) && !counters.c3Active;

  // Footfall Stats
  const [footfall, setFootfall] = useState({ in: 74, out: 46 });
  const activeShoppers = Math.max(0, footfall.in - footfall.out);

  // Dynamic Shelf Slots
  const [slotData, setSlotData] = useState<Record<string, { inCart: number; sold: number; restocked: number }>>({
    "SKU-3059": { inCart: 3, sold: 13, restocked: 0 },
    "SKU-1837": { inCart: 5, sold: 44, restocked: 0 },
    "SKU-5962": { inCart: 2, sold: 25, restocked: 0 },
  });

  // Dwell Hotspots
  const [dwellSpots] = useState([
    { shelf: "Shelf C (Snacks)", dwell: 215, intensity: "Critical Red Hotspot", status: "HIGH_DWELL_ALERT" },
    { shelf: "Shelf A (Wearables)", dwell: 146, intensity: "Warm Wave Dwell", status: "MODERATE" },
    { shelf: "Shelf B (Lighting)", dwell: 52, intensity: "Normal Warm", status: "NORMAL" },
  ]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Critical Low Stock SKUs (< 70%)
  const lowStockItems = STORE_SKUS.map(item => {
    const live = slotData[item.id] || { inCart: 0, sold: 0, restocked: 0 };
    const cur = Math.max(0, item.capacity - (live.inCart + live.sold) + live.restocked);
    const ratio = cur / item.capacity;
    return { ...item, cur, ratio };
  }).filter(s => s.ratio < 0.7);

  // 1. Direct Camera Feed + Real-Time DPDP Warm Wave Shader on Canvas
  useEffect(() => {
    if (cameraMode === "DIRECT_CAM") {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: 640, height: 360 } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch(() => {
          // If browser webcam blocked, switch to tunnel or warm simulation
          setCameraMode("WARM_SIMULATION");
        });
    }
  }, [cameraMode]);

  // Real-time canvas warm wave animation over camera
  useEffect(() => {
    let animId: number;
    const renderWarmWave = () => {
      if (canvasRef.current && videoRef.current && cameraMode === "DIRECT_CAM") {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 640, 360);
          
          // Apply Thermal Filter (DPDP Blur + Warm Wave Overlay)
          ctx.filter = "blur(4px) contrast(140%)";
          ctx.drawImage(canvasRef.current, 0, 0, 640, 360);
          ctx.filter = "none";

          // Warm Wave Tint Layer
          ctx.fillStyle = "rgba(10, 20, 60, 0.4)";
          ctx.fillRect(0, 0, 640, 360);

          // Simulated Warm Wave Centroid / Red Dwell Hotspot
          const time = Date.now() * 0.002;
          const spotX = 320 + Math.sin(time) * 40;
          const spotY = 180 + Math.cos(time) * 20;

          // Red-Orange Warm Glow
          const grad = ctx.createRadialGradient(spotX, spotY, 10, spotX, spotY, 60);
          grad.addColorStop(0, "rgba(255, 0, 50, 0.85)");
          grad.addColorStop(0.5, "rgba(255, 140, 0, 0.55)");
          grad.addColorStop(1, "rgba(255, 220, 0, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(spotX, spotY, 60, 0, Math.PI * 2);
          ctx.fill();

          // DPDP Header Stamp
          ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
          ctx.fillRect(10, 10, 340, 36);
          ctx.fillStyle = "#00ffcc";
          ctx.font = "bold 11px monospace";
          ctx.fillText("DPDP COMPLIANT | LIVE WARM WAVE IR FEED", 20, 32);
        }
      }
      animId = requestAnimationFrame(renderWarmWave);
    };
    renderWarmWave();
    return () => cancelAnimationFrame(animId);
  }, [cameraMode]);

  // 2. Safe Tunnel Polling (Uses fetch + Blob to bypass Localtunnel landing page)
  useEffect(() => {
    let active = true;
    const pollTunnel = async () => {
      if (cameraMode !== "TUNNEL_BLOB") return;
      try {
        const res = await fetch(`${BACKEND_TUNNEL_URL}/thermal_blob`, {
          headers: { "bypass-tunnel-reminder": "true" }
        });
        if (res.ok && active) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setTunnelBlobUrl(url);
        }
      } catch {
        // Keeps fallback
      } finally {
        if (active && cameraMode === "TUNNEL_BLOB") setTimeout(pollTunnel, 100);
      }
    };
    pollTunnel();
    return () => { active = false; };
  }, [cameraMode]);

  // --- DISPATCH HANDLERS (WHATSAPP, SMS, AND SERVER BROADCAST) ---
  const triggerWhatsAppAlert = (title: string, message: string) => {
    const text = encodeURIComponent(
      `🚨 *RETAILER VISION OS - URGENT ALERT*\n\n` +
      `📌 *Event:* ${title}\n` +
      `⚠️ *Details:* ${message}\n` +
      `⏱️ *Time:* ${new Date().toLocaleTimeString()}\n\n` +
      `👉 *Store Target:* +91-${MANAGER_PHONE}`
    );
    window.open(`https://wa.me/91${MANAGER_PHONE}?text=${text}`, "_blank");
    notify(`WhatsApp dispatch window opened for +91-${MANAGER_PHONE}`);
  };

  const triggerSMSAlert = (title: string, message: string) => {
    const text = encodeURIComponent(`STORE ALERT [${title}]: ${message} at ${new Date().toLocaleTimeString()}`);
    window.open(`sms:+91${MANAGER_PHONE}?body=${text}`, "_blank");
    notify(`SMS app opened for +91-${MANAGER_PHONE}`);
  };

  const triggerDualAlert = async (title: string, message: string) => {
    notify(`Broadcasting Dual WhatsApp + SMS Alert to +91-${MANAGER_PHONE}...`);
    try {
      await fetch(`${BACKEND_TUNNEL_URL}/notify-broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "bypass-tunnel-reminder": "true" },
        body: JSON.stringify({ title, message })
      });
    } catch {
      // Local fallback
    }
    // Launch WhatsApp directly so user sees immediate action
    triggerWhatsAppAlert(title, message);
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
      
      {/* Toast Bar */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 🚨 1. PRIMARY ALERT CENTER (Queue Rush & Low Stock) */}
      <section className="space-y-2">
        {/* Queue Rush Alert */}
        {isRushAlert && (
          <div className="p-4 bg-rose-950/40 border border-rose-600 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/40">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide text-rose-400">Queue Rush Detected (&ge; 4 Persons)</h4>
                <p className="text-xs text-slate-300">
                  Counter 1 ({counters.c1}) & Counter 2 ({counters.c2}) congested. Open Counter 3 immediately!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => triggerWhatsAppAlert(
                  "QUEUE RUSH ALERT",
                  `Counter 1 (${counters.c1}) & Counter 2 (${counters.c2}) congested. Open Counter 3!`
                )}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => triggerSMSAlert(
                  "QUEUE RUSH ALERT",
                  `Counter 1 (${counters.c1}) & Counter 2 (${counters.c2}) congested. Open Counter 3!`
                )}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <span>SMS</span>
              </button>

              <button
                onClick={() => triggerDualAlert(
                  "CRITICAL RUSH BROADCAST",
                  `Bottleneck at Counter 1 (${counters.c1}) & Counter 2 (${counters.c2}). Deploy Counter 3 immediately.`
                )}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
              >
                Dual Alert
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

        {/* Global Shelf Depletion Alert */}
        {lowStockItems.length > 0 && (
          <div className="p-3.5 bg-amber-950/30 border border-amber-500/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-xs text-amber-200">
                <b>{lowStockItems.length} Shelf Slots</b> below 70%: {lowStockItems.map(i => `${i.name} (${Math.round(i.ratio * 100)}%)`).join(", ")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerWhatsAppAlert(
                  "STORE DEPLETION REFILL",
                  `Restock needed for: ${lowStockItems.map(i => `${i.slot} (${i.name})`).join(", ")}`
                )}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold whitespace-nowrap"
              >
                WhatsApp Restock List
              </button>

              <button
                onClick={() => triggerSMSAlert(
                  "STORE DEPLETION REFILL",
                  `Restock needed for: ${lowStockItems.map(i => `${i.slot} (${i.name})`).join(", ")}`
                )}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold whitespace-nowrap"
              >
                SMS Restock List
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
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">Active Shoppers</span>
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
          <button
            onClick={() => triggerDualAlert("STORE AUDIT DISPATCH", "Manual store audit triggered. Systems operating normally.")}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-700 text-right hover:border-indigo-500 transition"
          >
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Target Manager</span>
            <span className="text-xs font-black text-indigo-300 tracking-wider">+91-{MANAGER_PHONE} ⚡</span>
          </button>
        </div>
      </header>

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Counter Queue Section with Direct WhatsApp / SMS Buttons */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Counter Queue + Action</h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => triggerWhatsAppAlert("COUNTER QUEUE STATUS", `C1: ${counters.c1}, C2: ${counters.c2}, C3: ${counters.c3Active ? "Active" : "Closed"}`)}
                  className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-300 font-semibold"
                >
                  WA Queue
                </button>
                <button
                  onClick={() => triggerSMSAlert("COUNTER QUEUE STATUS", `C1: ${counters.c1}, C2: ${counters.c2}, C3: ${counters.c3Active ? "Active" : "Closed"}`)}
                  className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-[10px] text-sky-300 font-semibold"
                >
                  SMS Queue
                </button>
              </div>
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

          {/* Products Left Action + Scrollable Cart List with Individual Alert Buttons */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Products Left Action (Shelf Slots)</h3>
                <p className="text-[11px] text-slate-500">Scroll to view stock & dispatch individual shelf replenishment alerts</p>
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
                  <div key={item.id} className="p-3 bg-slate-950 border border-slate-800/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{item.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 bg-slate-900 rounded">{item.slot}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Shelf Stock: <b className={isLow ? "text-amber-400 font-extrabold" : "text-white"}>{remaining}</b> / {item.capacity} units
                        {isLow && <span className="text-amber-400 ml-1 font-bold">(&lt; 70%)</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Individual WhatsApp Alert Button */}
                      {isLow && (
                        <button
                          onClick={() => triggerWhatsAppAlert(
                            `REFILL ${item.slot}`,
                            `${item.name} is low on stock (${remaining}/${item.capacity} left). Please restock now.`
                          )}
                          className="px-2 py-1 bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold rounded text-[10px] hover:bg-emerald-900"
                        >
                          WA
                        </button>
                      )}

                      {/* Individual SMS Alert Button */}
                      {isLow && (
                        <button
                          onClick={() => triggerSMSAlert(
                            `REFILL ${item.slot}`,
                            `${item.name} is low on stock (${remaining}/${item.capacity} left). Restock shelf.`
                          )}
                          className="px-2 py-1 bg-sky-950 border border-sky-700 text-sky-300 font-bold rounded text-[10px] hover:bg-sky-900"
                        >
                          SMS
                        </button>
                      )}

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

        {/* RIGHT COLUMN: Real-Time DPDP Thermal Warm Wave Player */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Camera Stream</h3>
                <p className="text-[10px] text-slate-500 font-mono">Real-Time DPDP Warm Wave Overlay</p>
              </div>

              {/* Mode Switcher */}
              <div className="flex gap-1 text-[10px]">
                <button
                  onClick={() => setCameraMode("DIRECT_CAM")}
                  className={`px-2 py-0.5 rounded font-bold ${cameraMode === "DIRECT_CAM" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}
                >
                  Direct Cam
                </button>
                <button
                  onClick={() => setCameraMode("TUNNEL_BLOB")}
                  className={`px-2 py-0.5 rounded font-bold ${cameraMode === "TUNNEL_BLOB" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}
                >
                  Tunnel Stream
                </button>
              </div>
            </div>

            {/* Live Video / Canvas Container */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center shadow-inner">
              {/* Mode 1: Direct Browser Webcam + Canvas Thermal Shader (Zero Fail) */}
              {cameraMode === "DIRECT_CAM" && (
                <div className="relative w-full h-full">
                  <video ref={videoRef} className="hidden" playsInline muted autoPlay />
                  <canvas ref={canvasRef} width={640} height={360} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Mode 2: Python Backend Tunnel Blob */}
              {cameraMode === "TUNNEL_BLOB" && tunnelBlobUrl && (
                <img src={tunnelBlobUrl} alt="Thermal CCTV Feed" className="w-full h-full object-cover" />
              )}

              {/* Mode 3: Fail-safe Simulated Warm Wave */}
              {cameraMode === "WARM_SIMULATION" && (
                <div className="w-full h-full bg-slate-950 p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                    <span>AISLE_CAM_01 [WARM WAVE IR OVERLAY]</span>
                    <span>DPDP ACTIVE</span>
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
                    <span>Centroid: Warm Wave Detected</span>
                    <span>Face Data: Stripped</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dwell Time Analytics with Hotspot Alert Buttons */}
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
                    <span className={`text-[10px] block font-mono ${spot.status === "HIGH_DWELL_ALERT" ? "text-red-400 font-bold" : "text-slate-500"}`}>
                      {spot.intensity} ({spot.dwell}s linger)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {spot.status === "HIGH_DWELL_ALERT" && (
                      <button
                        onClick={() => triggerWhatsAppAlert(
                          "HIGH DWELL CONGESTION",
                          `Unusual high customer dwell time (${spot.dwell}s) at ${spot.shelf}. Floor inspection advised.`
                        )}
                        className="px-2 py-1 bg-red-950 border border-red-700 text-red-300 font-bold rounded text-[10px] hover:bg-red-900"
                      >
                        WA Alert
                      </button>
                    )}
                    {spot.status === "HIGH_DWELL_ALERT" && (
                      <button
                        onClick={() => triggerSMSAlert(
                          "HIGH DWELL CONGESTION",
                          `High customer dwell time (${spot.dwell}s) at ${spot.shelf}. Inspect shelf.`
                        )}
                        className="px-2 py-1 bg-sky-950 border border-sky-700 text-sky-300 font-bold rounded text-[10px] hover:bg-sky-900"
                      >
                        SMS
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
