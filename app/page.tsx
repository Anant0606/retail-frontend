"use client";

import React, { useState, useEffect } from "react";

const MANAGER_PHONE = "9472948984";
const NTFY_TOPIC = `retail-vision-${MANAGER_PHONE}`;
const BACKEND_TUNNEL_URL = "https://puny-lands-flow.loca.lt"; // Verify current active tunnel

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

  // Live Camera Stream State
  const [dwellStreamBlob, setDwellStreamBlob] = useState<string | null>(null);
  const [streamConnected, setStreamConnected] = useState(false);

  // Barcode Viewfinder Modal State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanMode, setScanMode] = useState<"REFILL" | "CHECKOUT">("CHECKOUT");
  const [isScanning, setIsScanning] = useState(false);

  // Dynamic Variable Footfall
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
    { text: "Camera Vision Engine: Live human tracking engaged", time: "Just now" },
    { text: "Dual-Mode Barcode Scanner Ready (Refill & Sold modes)", time: "1m ago" },
    { text: "FIFO Depletion monitor: Critical items listed below 70%", time: "3m ago" },
  ]);

  // Web Audio Context Synthesizer
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
    setTimeout(() => setToast(null), 3500);
  };

  // Variable Footfall Engine
  useEffect(() => {
    const timer = setInterval(() => {
      setFootfall(prev => {
        const rand = Math.random();
        if (rand > 0.55) {
          const nextIn = prev.in + 1;
          setLastEvent("IN");
          setActivities(a => [{ text: `🟢 Shopper Entered via Entrance Gate (Total In: ${nextIn})`, time: "Just now" }, ...a.slice(0, 6)]);
          return { ...prev, in: nextIn };
        } else if (rand < 0.35 && (prev.in - prev.out) > 4) {
          const nextOut = prev.out + 1;
          setLastEvent("OUT");
          setActivities(a => [{ text: `🔴 Shopper Checkout Exit Complete (Total Out: ${nextOut})`, time: "Just now" }, ...a.slice(0, 6)]);
          return { ...prev, out: nextOut };
        }
        return prev;
      });
      setTimeout(() => setLastEvent(null), 1200);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Poll Psychological Stream
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

  // Live Camera Stream Consumer (For Dwell View & Scanner Viewfinder)
  useEffect(() => {
    let active = true;
    const fetchStreamFrame = async () => {
      try {
        const res = await fetch(`${BACKEND_TUNNEL_URL}/thermal_blob`, {
          headers: { "bypass-tunnel-reminder": "true" },
          cache: "no-store"
        });
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("image") && active) {
          const blob = await res.blob();
          if (blob.size > 1000) {
            const objectUrl = URL.createObjectURL(blob);
            setDwellStreamBlob(prev => {
              if (prev) URL.revokeObjectURL(prev);
              return objectUrl;
            });
            setStreamConnected(true);
          }
        }
      } catch {
        if (active) setStreamConnected(false);
      } finally {
        if (active) setTimeout(fetchStreamFrame, 50);
      }
    };

    if (activeView === "dwell" || scannerOpen) {
      fetchStreamFrame();
    }

    return () => {
      active = false;
    };
  }, [activeView, scannerOpen]);

  // Alert Dispatcher via ntfy
  const triggerNtfyAlert = async (title: string, msg: string) => {
    playTone(320, "sawtooth", 0.3);
    setTimeout(() => playTone(240, "sawtooth", 0.35), 180);
    notify(`Pushing alert to manager (${NTFY_TOPIC})...`);

    try {
      const encodedTitle = encodeURIComponent(`🚨 ${title}`);
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}?title=${encodedTitle}&priority=urgent&tags=warning,rotating_light`, {
        method: "POST",
        body: msg,
      });
      notify("🔔 Notification pushed to Manager's Phone!");
    } catch {
      try {
        await fetch(`${BACKEND_TUNNEL_URL}/trigger-alert`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "bypass-tunnel-reminder": "true" },
          body: JSON.stringify({ title, message: msg, priority: "urgent" })
        });
        notify("🔔 Alert sent via server bridge!");
      } catch {
        notify("❌ Push error. Check Python bridge.");
      }
    }
  };

  // --- DUAL-MODE BARCODE WORKFLOW (MODAL VIEWFINDER + HARDWARE SCAN) ---
  const startScannerModal = async (mode: "REFILL" | "CHECKOUT") => {
    setScanMode(mode);
    setScannerOpen(true);
    setIsScanning(true);
    playTone(600, "sine", 0.1);
    notify(`📷 [${mode} MODE] Aim barcode inside red laser viewfinder...`);

    try {
      const res = await fetch(`${BACKEND_TUNNEL_URL}/scan-barcode`, {
        method: "POST",
        headers: { "bypass-tunnel-reminder": "true" }
      });
      const data = await res.json();

      if (data.status === "success" && data.barcode) {
        const item = skus.find(s => s.barcode === data.barcode || s.id === data.barcode);

        if (item) {
          if (mode === "REFILL") {
            // MODE 1: REFILL SHELF LOT
            playTone(980, "sine", 0.25);
            setSkus(prev => prev.map(s => s.id === item.id ? { ...s, stock: s.capacity } : s));
            triggerNtfyAlert("SHELF LOT REFILLED", `Refill verified for ${item.name} (${item.slot}). Stock restored to ${item.capacity} units.`);
            setActivities(a => [{ text: `📦 Lot Refilled: ${item.name} restored to ${item.capacity}`, time: "Just now" }, ...a.slice(0, 6)]);
            notify(`✅ [REFILLED]: ${item.name} capacity restored! Manager notified.`);
          } else {
            // MODE 2: PRODUCT SOLD OUT CHECKOUT
            playTone(850, "sine", 0.15);
            setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
            setSkus(prev => prev.map(s => s.id === item.id ? { ...s, stock: Math.max(0, s.stock - 1) } : s));

            const remaining = item.stock - 1;
            setActivities(a => [{ text: `💳 Sold & Added to Bill: ${item.name} (Left: ${remaining})`, time: "Just now" }, ...a.slice(0, 6)]);
            notify(`✅ [SOLD]: Added ${item.name} to bill. Remaining stock: ${remaining}`);

            if (remaining / item.capacity < 0.7) {
              setTimeout(() => {
                triggerNtfyAlert("LOW STOCK AUTO-TRIGGER", `${item.name} dropped to ${remaining} units (<70%).`);
              }, 600);
            }
          }
          // Auto close scanner on success after brief confirmation
          setTimeout(() => setScannerOpen(false), 900);
        } else {
          playTone(250, "square", 0.2);
          notify(`⚠️ Scanned Barcode: ${data.barcode} (Unregistered SKU)`);
        }
      } else {
        playTone(220, "square", 0.25);
        notify("❌ No barcode detected. Ensure barcode is well lit.");
      }
    } catch {
      notify("❌ Backend bridge offline. Check Python terminal.");
    } finally {
      setIsScanning(false);
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

  // --- NATIVE PDF EXPORT ENGINE 1: TAX INVOICE BILL ---
  const saveInvoiceAsPDF = () => {
    const totalAmount = Object.entries(cart).reduce((acc, [id, qty]) => {
      const item = skus.find(s => s.id === id);
      return acc + (item ? item.price * qty : 0);
    }, 0);

    if (totalAmount === 0) {
      notify("Cart is empty! Scan or add items to generate bill.");
      return;
    }

    playTone(950, "sine", 0.2);
    const invoiceId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceDate = new Date().toLocaleString();

    const itemsRows = Object.entries(cart).map(([skuId, qty]) => {
      const item = skus.find(s => s.id === skuId);
      if (!item) return "";
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><b>${item.name}</b><br><small style="color:#666">${item.id} • ${item.slot}</small></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${qty}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">₹${(item.price * qty).toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${invoiceId} - Tax Invoice</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #111; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: 900; color: #1e3a8a; margin: 0; }
          .meta { font-size: 12px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
          .total-box { margin-top: 25px; text-align: right; }
          .total-box h2 { font-size: 22px; color: #1e3a8a; margin: 5px 0; }
          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">ARIS RETAIL INTELLIGENCE</h1>
            <div class="meta">Automated Retail Intelligence System • Official Tax Invoice</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 16px;">${invoiceId}</div>
            <div class="meta">${invoiceDate}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <div class="total-box">
          <div style="font-size: 14px; color: #444;">Subtotal: ₹${totalAmount.toFixed(2)}</div>
          <div style="font-size: 14px; color: #16a34a; font-weight: bold;">Store Discount: -₹0.00</div>
          <h2>Grand Total: ₹${totalAmount.toFixed(2)}</h2>
        </div>
        <div class="footer">
          Thank you for shopping with us! • Generated via ARIS POS Terminal
        </div>
      </body>
      </html>
    `;

    const printWin = window.open("", "_blank", "width=850,height=950");
    if (printWin) {
      printWin.document.write(printHtml);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        printWin.close();
        setCart({});
        notify("✅ Invoice saved as PDF!");
      }, 350);
    }
  };

  // --- NATIVE PDF EXPORT ENGINE 2: PSYCHOLOGICAL REPORT ---
  const savePsychologicalReportAsPDF = () => {
    playTone(880, "sine", 0.15);
    const reportDate = new Date().toLocaleString();
    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ARIS - Customer Psychological Dwell Audit</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #111; }
          .header { border-bottom: 2px solid #7c3aed; padding-bottom: 12px; margin-bottom: 20px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
          .tag { display: inline-block; padding: 3px 8px; font-size: 11px; background: #ede9fe; color: #6d28d9; border-radius: 4px; font-weight: bold; }
          h2 { font-size: 26px; color: #1e1b4b; margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; color: #4c1d95; font-size: 24px;">ARIS CUSTOMER PSYCHOLOGICAL REPORT</h1>
          <p style="margin: 4px 0; color: #64748b; font-size: 12px;">Computer Vision Heatwave & Shelf Dwell Analytics • Generated: ${reportDate}</p>
        </div>
        <div class="box">
          <span class="tag">Dwell Duration</span>
          <h2>${insights.dwell_seconds} Seconds Active Stop</h2>
          <p><b>Target Shelf Location:</b> ${insights.zone}</p>
          <p><b>Target Product / Offer:</b> ${insights.active_sku}</p>
          <p><b>Inferred Behavior Intent:</b> ${insights.intent_state}</p>
        </div>
        <div class="box" style="background: #fdf4ff; border-color: #f0abfc;">
          <span class="tag" style="background: #fae8ff; color: #a21caf;">AI Behavioral Diagnosis</span>
          <p style="font-size: 14px; margin-top: 10px; line-height: 1.5;">"${insights.psychology_insight}"</p>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open("", "_blank", "width=850,height=950");
    if (printWin) {
      printWin.document.write(reportHtml);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        printWin.close();
        notify("✅ Psychological Report saved as PDF!");
      }, 350);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-3 lg:p-5 space-y-4 relative selection:bg-indigo-600">
      
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl animate-bounce border border-indigo-400">
          {toast}
        </div>
      )}

      {menuOpen && (
        <div 
          onClick={() => setMenuOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        />
      )}

      {/* TOP HEADER */}
      <nav className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xl relative z-40">
        <div className="flex items-center gap-3">
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

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Vision Active
          </span>
        </div>
      </nav>

      {/* SOLID SLIDE-OUT MENU */}
      {menuOpen && (
        <div className="fixed top-16 left-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-2 animate-fadeIn ring-2 ring-indigo-500/30">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">ARIS System Modules</span>
            <button onClick={() => setMenuOpen(false)} className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-slate-800">✕ Close</button>
          </div>

          <div className="space-y-1.5 pt-1">
            <button 
              onClick={() => { playTone(600, "sine", 0.05); setActiveView("home"); setMenuOpen(false); }} 
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeView === "home" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-300 bg-slate-950 hover:bg-slate-800"}`}
            >
              <span className="text-base">🏠</span>
              <div>
                <span className="block">Main Home Dashboard</span>
                <span className="text-[10px] opacity-70 font-normal">Footfall, Counters & FIFO Alerts</span>
              </div>
            </button>

            <button 
              onClick={() => { playTone(600, "sine", 0.05); setActiveView("stock"); setMenuOpen(false); }} 
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeView === "stock" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-300 bg-slate-950 hover:bg-slate-800"}`}
            >
              <span className="text-base">📦</span>
              <div>
                <span className="block">1) Stock Shelf Data (50+ SKUs)</span>
                <span className="text-[10px] opacity-70 font-normal">Live Catalog & &lt;70% Capacity Alerts</span>
              </div>
            </button>

            <button 
              onClick={() => { playTone(600, "sine", 0.05); setActiveView("dwell"); setMenuOpen(false); }} 
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeView === "dwell" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-300 bg-slate-950 hover:bg-slate-800"}`}
            >
              <span className="text-base">🧠</span>
              <div>
                <span className="block">2) Dwell Time & Psychology</span>
                <span className="text-[10px] opacity-70 font-normal">Live Thermal Stream + PDF Export</span>
              </div>
            </button>

            <button 
              onClick={() => { playTone(600, "sine", 0.05); setActiveView("billing"); setMenuOpen(false); }} 
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${activeView === "billing" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-300 bg-slate-950 hover:bg-slate-800"}`}
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 grid grid-cols-3 gap-2.5">
              <div className={`bg-slate-900 border ${lastEvent === "IN" ? "border-emerald-500 scale-[1.02]" : "border-slate-800"} p-3 rounded-2xl text-center relative overflow-hidden transition-all duration-300`}>
                <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Cam In
                </span>
                <span className="text-2xl lg:text-3xl font-black text-white">{footfall.in}</span>
                <span className="text-[9px] text-slate-400 font-mono block">Optical Gate</span>
              </div>

              <div className={`bg-slate-900 border ${lastEvent === "OUT" ? "border-rose-500 scale-[1.02]" : "border-slate-800"} p-3 rounded-2xl text-center relative overflow-hidden transition-all duration-300`}>
                <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  Exit Out
                </span>
                <span className="text-2xl lg:text-3xl font-black text-white">{footfall.out}</span>
                <span className="text-[9px] text-slate-400 font-mono block">Checkout Gate</span>
              </div>

              <div className="bg-slate-900 border border-indigo-900/60 p-3 rounded-2xl text-center relative overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-indigo-300 block">Active Shoppers</span>
                <span className="text-2xl lg:text-3xl font-black text-indigo-400">{activeInStore}</span>
                <span className="text-[9px] text-indigo-400/70 font-mono block">In Floor Zone</span>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Counter Queue Monitoring & Alerts</h3>
                {isRushAlert && (
                  <span className="text-[10px] bg-rose-950 border border-rose-600 text-rose-400 px-2 py-0.5 rounded font-bold animate-pulse">
                    Rush Alert: Counters Congested
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5 items-center">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 font-bold">Counter 1</span>
                    <span className="text-white font-mono font-bold">{counters.c1} in Line</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, counters.c1 * 20)}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400 font-bold">Counter 2</span>
                    <span className="text-white font-mono font-bold">{counters.c2} in Line</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, counters.c2 * 20)}%` }} />
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      playTone(counters.c3Active ? 300 : 700, "sine", 0.1);
                      setCounters(prev => ({ ...prev, c3Active: !prev.c3Active }));
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow ${
                      counters.c3Active ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                    }`}
                  >
                    {counters.c3Active ? "Close Counter 3" : "Open Counter 3"}
                  </button>
                </div>
              </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
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

                        <button
                          onClick={() => {
                            triggerNtfyAlert(`LOW STOCK: ${item.slot}`, `${item.name} is down to ${item.stock} units (${ratio}%). Dispatch restock lot.`);
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow transition active:scale-95"
                        >
                          <span>🚨 Alert Buzzer</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

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

      {/* ================= OPTION 1: STOCK SHELF DATA ================= */}
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
                            <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-600 text-rose-300 text-[10px] font-bold">🚨 Low Stock (&lt;70%)</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 text-[10px] font-bold">Optimal</span>
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

      {/* ================= OPTION 2: DWELL TIME & PSYCHOLOGICAL DATA ================= */}
      {activeView === "dwell" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-black text-white">2) Dwell Time Calculation & Psychological Heatwave</h2>
              <p className="text-xs text-slate-400">Thermal live stream, customer stop duration, shelf attraction estimates, and PDF export.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={savePsychologicalReportAsPDF}
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
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Thermal Heatwave Camera Feed</h3>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {streamConnected ? "Live Heatwave Active" : "Connecting..."}
                </span>
              </div>

              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center shadow-inner">
                {dwellStreamBlob ? (
                  <img src={dwellStreamBlob} alt="Live Thermal Heatwave Stream" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2.5 p-4 text-center">
                    <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono text-slate-300 font-bold">Connecting to Phone Thermal Sensor...</span>
                    <span className="text-[10px] font-mono text-slate-500">Bypassing Localtunnel Gateway • Zero PII</span>
                  </div>
                )}
              </div>
            </div>

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
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">"{insights.psychology_insight}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= OPTION 3: COUNTER BOY BILLING & DUAL BARCODE WORKFLOW ================= */}
      {activeView === "billing" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-black text-white">3) Counter Boy Billing & Dual-Mode Barcode Workflow</h2>
              <p className="text-xs text-slate-400">Same barcode scanner works in 2 modes: Refill shelf lot (notifies manager) OR Checkout sold product (auto-bills).</p>
            </div>
            <button 
              onClick={() => { playTone(400, "sine", 0.05); setActiveView("home"); }} 
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl whitespace-nowrap"
            >
              ← Back to Home
            </button>
          </div>

          {/* DUAL-MODE BARCODE TRIGGER CONTROLS */}
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

            {/* SCANNER MODAL TRIGGER BUTTONS */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
              <button
                onClick={() => startScannerModal("REFILL")}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2 active:scale-95"
              >
                <span>📦</span>
                <span>Scan Barcode: Refill Lot & Notify Manager</span>
              </button>

              <button
                onClick={() => startScannerModal("CHECKOUT")}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2 active:scale-95"
              >
                <span>💳</span>
                <span>Scan Barcode: Product Sold Checkout</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">50+ SKUs Quick Select Catalog</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {skus.slice(0, 16).map(item => (
                  <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.slot} • ₹{item.price} • Stock: {item.stock}</span>
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
                  onClick={saveInvoiceAsPDF}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>📥 Checkout & Save Bill as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= LIVE BARCODE SCANNER VIEWFINDER MODAL ================= */}
      {scannerOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl relative">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${scanMode === "REFILL" ? "bg-amber-500" : "bg-emerald-500"} animate-ping`} />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  {scanMode === "REFILL" ? "Mode 1: Shelf Lot Restock Scanner" : "Mode 2: Product Sold Checkout Scanner"}
                </h3>
              </div>
              <button 
                onClick={() => setScannerOpen(false)} 
                className="text-slate-400 hover:text-white px-2.5 py-1 rounded-xl bg-slate-800 text-xs font-bold"
              >
                ✕ Cancel
              </button>
            </div>

            {/* Targeting Viewfinder with Laser Aim */}
            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden relative border-2 border-indigo-500/50 flex items-center justify-center shadow-inner">
              {dwellStreamBlob ? (
                <img src={dwellStreamBlob} alt="Live Scanner Feed" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-slate-400">Connecting Camera Viewfinder...</span>
                </div>
              )}

              {/* Laser Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-52 h-32 border-2 border-dashed border-emerald-400 rounded-2xl relative shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                  <div className="w-full h-0.5 bg-rose-500 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                </div>
                <span className="text-[10px] font-mono text-emerald-300 mt-3 bg-black/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  Align product barcode inside red laser
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <p className="text-xs text-slate-300">
                {scanMode === "REFILL" 
                  ? "Scanning lot will instantly refill shelf capacity to 100% and notify the manager."
                  : "Scanning product will deduct 1 unit from stock and add directly to billing cart."}
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
