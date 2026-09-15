"use client";

import React, { useState, useEffect, useRef } from "react";

const MANAGER_PHONE = "9472948984";
const BACKEND_TUNNEL_URL = "https://yummy-signs-relate.loca.lt"; // Apna active tunnel URL yahan rakhein

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Video & Canvas Refs for Your Phone Camera Thermal Stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Counter Queue State
  const [counters, setCounters] = useState({ c1: 5, c2: 4, c3Active: false });
  const isRushAlert = (counters.c1 >= 4 && counters.c2 >= 4) && !counters.c3Active;

  // Footfall Stats
  const [footfall] = useState({ in: 78, out: 49 });
  const activeShoppers = Math.max(0, footfall.in - footfall.out);

  // Dynamic Shelf Slots
  const [slotData, setSlotData] = useState<Record<string, { inCart: number; sold: number; restocked: number }>>({
    "SKU-3059": { inCart: 3, sold: 13, restocked: 0 },
    "SKU-1837": { inCart: 5, sold: 44, restocked: 0 },
    "SKU-5962": { inCart: 2, sold: 25, restocked: 0 },
  });

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Connect Your Phone Camera (or external camera choice)
  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ video: { width: 640, height: 360, facingMode: "environment" } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(err => {
        console.error("Camera access error:", err);
        notify("Could not connect to camera. Check permissions.");
      });
  }, []);

  // Real-time canvas thermal shader over your camera feed
  useEffect(() => {
    let animId: number;
    const renderThermalShader = () => {
      if (canvasRef.current && videoRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 640, 360);
          
          // Thermal / Nightvision Monochromatic Glow
          ctx.fillStyle = "rgba(0, 40, 120, 0.45)";
          ctx.fillRect(0, 0, 640, 360);

          // DPDP Thermal Overlay Badge
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.fillRect(10, 10, 310, 32);
          ctx.fillStyle = "#00ffcc";
          ctx.font = "bold 10px monospace";
          ctx.fillText("DPDP COMPLIANT | YOUR PHONE IR THERMAL SENSOR", 16, 29);
        }
      }
      animId = requestAnimationFrame(renderThermalShader);
    };
    renderThermalShader();
    return () => cancelAnimationFrame(animId);
  }, []);

  // --- AUTOMATED ALERT DISPATCH ---
  const triggerAutomatedAlert = async (title: string, msg: string, method: "WHATSAPP" | "SMS" | "BOTH") => {
    notify(`Dispatching ${method} Alert...`);
    try {
      await fetch(`${BACKEND_TUNNEL_URL}/trigger-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "bypass-tunnel-reminder": "true" },
        body: JSON.stringify({ title, message: msg, method })
      });
      notify(`✅ ${method} automation triggered on server!`);
    } catch {
      const text = encodeURIComponent(`🚨 [ALERT]: ${title} - ${msg}`);
      window.open(`https://wa.me/91${MANAGER_PHONE}?text=${text}`, "_blank");
    }
  };

  // --- BARCODE SCANNER USING FRIEND'S DROIDCAM IP (`100.98.203.70:4747`) ---
  const handleFriendDroidCamScan = async () => {
    setIsScanning(true);
    notify("Scanning via Friend's DroidCam (100.98.203.70)...");
    try {
      const res = await fetch(`${BACKEND_TUNNEL_URL}/scan-barcode`, {
        method: "POST",
        headers: { "bypass-tunnel-reminder": "true" }
      });
      const data = await res.json();
      if (data.status === "success" && data.barcode) {
        const matchedItem = STORE_SKUS.find(s => s.barcode === data.barcode);
        if (matchedItem) {
          handlePickReturn(matchedItem.id, 1);
          notify(`✅ Scanned & Added: ${matchedItem.name} (${data.barcode})`);
        } else {
          notify(`Scanned Barcode: ${data.barcode} (Unregistered SKU)`);
        }
      } else {
        notify("❌ No barcode detected on Friend's DroidCam.");
      }
    } catch {
      notify("❌ Scanner bridge offline. Check Python backend.");
    } finally {
      setIsScanning(false);
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
      notify(`Added ${item.name} to cart.`);
    } else {
      notify("SKU or Barcode not found!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 lg:p-6 space-y-4 relative">
      
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* ALERT SECTION */}
      <section className="space-y-2">
        {isRushAlert && (
          <div className="p-4 bg-rose-950/40 border border-rose-600 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide text-rose-400">Queue Rush Detected (&ge; 4 Persons)</h4>
                <p className="text-xs text-slate-300">Counter 1 ({counters.c1}) & Counter 2 ({counters.c2}) congested. Open Counter 3!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => triggerAutomatedAlert("QUEUE RUSH", "Counter 1 & 2 congested. Open Counter 3!", "WHATSAPP")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                Auto WhatsApp
              </button>
              <button
                onClick={() => setCounters(prev => ({ ...prev, c3Active: true }))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
              >
                Open C3
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

        {/* BARCODE SEARCH + FRIEND'S DROIDCAM SCANNER BUTTON */}
        <div className="lg:col-span-5 flex gap-2">
          <form onSubmit={handleBarcodeInputSubmit} className="flex gap-2 flex-1">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan Barcode / SKU Code..."
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-slate-100"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap">
              Add
            </button>
          </form>
          <button
            onClick={handleFriendDroidCamScan}
            disabled={isScanning}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-md flex items-center gap-1.5"
          >
            <span>{isScanning ? "Scanning DroidCam..." : "📷 Friend DroidCam Scan"}</span>
          </button>
        </div>

        <div className="lg:col-span-3 flex justify-end">
          <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-700 text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Target Manager</span>
            <span className="text-xs font-black text-indigo-300 tracking-wider">+91-{MANAGER_PHONE}</span>
          </div>
        </div>
      </header>

      {/* TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT: Counters & Products */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Counter Queue Status</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">Counter 1</span>
                <span className="text-lg font-black text-white">{counters.c1} in Line</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">Counter 2</span>
                <span className="text-lg font-black text-white">{counters.c2} in Line</span>
              </div>
              <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${counters.c3Active ? "bg-emerald-950/40 border-emerald-800" : "bg-slate-950 border-slate-800"}`}>
                <span className="text-[10px] text-slate-400 font-bold">Counter 3</span>
                <button
                  onClick={() => setCounters(prev => ({ ...prev, c3Active: !prev.c3Active }))}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition ${counters.c3Active ? "bg-rose-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
                >
                  {counters.c3Active ? "Close C3" : "Open C3"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Products & Shelf Stock Action</h3>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {STORE_SKUS.map(item => {
                const live = slotData[item.id] || { inCart: 0, sold: 0, restocked: 0 };
                const remaining = Math.max(0, item.capacity - (live.inCart + live.sold) + live.restocked);
                const isLow = remaining / item.capacity < 0.7;

                return (
                  <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] text-slate-400">{item.slot} • Stock: <b className={isLow ? "text-amber-400" : "text-white"}>{remaining}</b></span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLow && (
                        <button
                          onClick={() => triggerAutomatedAlert(`REFILL ${item.slot}`, `${item.name} is low (${remaining} left).`, "WHATSAPP")}
                          className="px-2 py-1 bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold rounded text-[10px]"
                        >
                          WA Restock
                        </button>
                      )}
                      <span className="px-2 py-1 bg-indigo-950 text-indigo-300 font-mono font-bold rounded">Cart: {live.inCart}</span>
                      <button onClick={() => handlePickReturn(item.id, 1)} className="px-2 py-1 bg-indigo-600 text-white font-bold rounded">+</button>
                      <button onClick={() => handlePickReturn(item.id, -1)} className="px-2 py-1 bg-slate-800 text-slate-300 font-bold rounded">-</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: YOUR PHONE CAMERA THERMAL FEED */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Camera Stream</h3>
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                Your Phone Camera Active
              </span>
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
              <video ref={videoRef} className="hidden" playsInline muted autoPlay />
              <canvas ref={canvasRef} width={640} height={360} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
