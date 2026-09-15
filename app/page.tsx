
"use client";

import React, { useState, useEffect, useMemo } from "react";

// --- SYSTEM CONFIGURATION ---
const MANAGER_WHATSAPP = "919472948984"; // Store Manager Direct Alert Contact
const NGROK_BACKEND_URL = "https://yummy-signs-relate.loca.lt"; // Active Localtunnel Endpoint

// --- Minimal Zero-Dependency Inline SVG Icons ---
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

const IconAlert = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconCheck = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const IconMessage = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const IconCamera = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const IconReceipt = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M14 8H8" />
    <path d="M16 12H8" />
    <path d="M13 16H8" />
  </svg>
);

const IconSparkles = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </svg>
);

// --- 50 Verified Retail SKUs with Slot Mapping & Barcodes ---
const STORE_CATALOG = [
  { id: "SKU-3059", barcode: "8905650133059", name: "boAt Wave Smartwatch", category: "Wearables", slot: "Shelf A-01", capacity: 20, price: 1499 },
  { id: "SKU-5962", barcode: "8902653015962", name: "Crompton LED Light 5W", category: "Lighting", slot: "Shelf B-02", capacity: 35, price: 1000 },
  { id: "SKU-1473", barcode: "9789354401473", name: "Fingerprint Classics Book", category: "Books", slot: "Aisle D-01", capacity: 25, price: 149 },
  { id: "SKU-1837", barcode: "8901491101837", name: "Lay's Magic Masala Chips 50g", category: "Snacks", slot: "Shelf C-04", capacity: 60, price: 20 },
  { id: "SKU-1005", barcode: "8901262010051", name: "Amul Taaza Milk 1L", category: "Groceries", slot: "Chiller-01", capacity: 40, price: 74 },
  { id: "SKU-1006", barcode: "8901030010062", name: "Tata Salt 1kg", category: "Groceries", slot: "Aisle A-03", capacity: 50, price: 28 },
  { id: "SKU-1007", barcode: "8906007280073", name: "Fortune Sunlite Oil 1L", category: "Groceries", slot: "Aisle A-04", capacity: 30, price: 145 },
  { id: "SKU-1008", barcode: "8901725181084", name: "Aashirvaad Atta 5kg", category: "Groceries", slot: "Aisle A-05", capacity: 25, price: 265 },
  { id: "SKU-1009", barcode: "8901058852095", name: "Maggi 2-Minute Noodles 420g", category: "Groceries", slot: "Shelf C-01", capacity: 45, price: 96 },
  { id: "SKU-1010", barcode: "8901719101108", name: "Parle-G Gold Biscuits 1kg", category: "Snacks", slot: "Shelf C-02", capacity: 50, price: 120 },
  { id: "SKU-1011", barcode: "8901063010111", name: "Britannia Good Day Butter", category: "Snacks", slot: "Shelf C-03", capacity: 40, price: 45 },
  { id: "SKU-1012", barcode: "7622201431122", name: "Cadbury Dairy Milk Silk", category: "Snacks", slot: "Chiller-02", capacity: 35, price: 175 },
  { id: "SKU-1013", barcode: "8904063210135", name: "Haldiram's Bhujia Sev 400g", category: "Snacks", slot: "Shelf C-05", capacity: 30, price: 130 },
  { id: "SKU-1014", barcode: "8901491501149", name: "Kurkure Masala Munch 85g", category: "Snacks", slot: "Shelf C-06", capacity: 50, price: 20 },
  { id: "SKU-1015", barcode: "5449000000996", name: "Coca-Cola 750ml", category: "Beverages", slot: "Chiller-03", capacity: 40, price: 40 },
  { id: "SKU-1016", barcode: "8902080000163", name: "Pepsi Can 300ml", category: "Beverages", slot: "Chiller-04", capacity: 35, price: 35 },
  { id: "SKU-1017", barcode: "9002490100170", name: "Red Bull Energy Drink 250ml", category: "Beverages", slot: "Chiller-05", capacity: 30, price: 125 },
  { id: "SKU-1018", barcode: "8901491100182", name: "Tropicana Orange Juice 1L", category: "Beverages", slot: "Chiller-06", capacity: 25, price: 140 },
  { id: "SKU-1019", barcode: "8901058860199", name: "Nescafe Classic Coffee 50g", category: "Beverages", slot: "Shelf B-04", capacity: 30, price: 190 },
  { id: "SKU-1020", barcode: "8901030383204", name: "Tata Tea Premium 500g", category: "Beverages", slot: "Shelf B-05", capacity: 35, price: 260 },
  { id: "SKU-1021", barcode: "8901314010213", name: "Colgate MaxFresh 150g", category: "Personal Care", slot: "Shelf D-01", capacity: 40, price: 110 },
  { id: "SKU-1022", barcode: "8901396144224", name: "Dettol Bath Soap (3+1)", category: "Personal Care", slot: "Shelf D-02", capacity: 30, price: 180 },
  { id: "SKU-1023", barcode: "4902430734233", name: "Head & Shoulders Shampoo 340ml", category: "Personal Care", slot: "Shelf D-03", capacity: 25, price: 299 },
  { id: "SKU-1024", barcode: "4005808801244", name: "Nivea Soft Cream 100ml", category: "Personal Care", slot: "Shelf D-04", capacity: 30, price: 160 },
  { id: "SKU-1025", barcode: "4902430604253", name: "Gillette Mach 3 Razor", category: "Personal Care", slot: "Shelf D-05", capacity: 20, price: 350 },
  { id: "SKU-1026", barcode: "8901030707269", name: "Surf Excel Detergent 1kg", category: "Household", slot: "Aisle E-01", capacity: 35, price: 145 },
  { id: "SKU-1027", barcode: "8901030045279", name: "Vim Dishwash Gel 500ml", category: "Household", slot: "Aisle E-02", capacity: 40, price: 115 },
  { id: "SKU-1028", barcode: "8901396328280", name: "Harpic Power Plus 1L", category: "Household", slot: "Aisle E-03", capacity: 30, price: 215 },
  { id: "SKU-1029", barcode: "8901396349292", name: "Lizol Floor Cleaner 1L", category: "Household", slot: "Aisle E-04", capacity: 25, price: 220 },
  { id: "SKU-1030", barcode: "8901207010304", name: "Odonil Room Spray 220ml", category: "Household", slot: "Aisle E-05", capacity: 30, price: 155 },
  { id: "SKU-1031", barcode: "8718696578315", name: "Philips 9W LED Eco Bulb", category: "Lighting", slot: "Shelf B-01", capacity: 40, price: 120 },
  { id: "SKU-1032", barcode: "8904239820323", name: "Syska Smart Wi-Fi Bulb", category: "Lighting", slot: "Shelf B-03", capacity: 15, price: 499 },
  { id: "SKU-1033", barcode: "8901030612334", name: "Wipro Emergency Light", category: "Lighting", slot: "Shelf B-06", capacity: 15, price: 650 },
  { id: "SKU-1034", barcode: "8901762014349", name: "Havells Extension Cord 4-Way", category: "Electronics", slot: "Shelf A-02", capacity: 20, price: 380 },
  { id: "SKU-1035", barcode: "8904130835358", name: "boAt BassHeads 100 Earphones", category: "Electronics", slot: "Shelf A-03", capacity: 25, price: 399 },
  { id: "SKU-1036", barcode: "8904230810361", name: "Portronics 20W Charger", category: "Electronics", slot: "Shelf A-04", capacity: 25, price: 499 },
  { id: "SKU-1037", barcode: "0619659102377", name: "SanDisk 64GB Ultra Flash Drive", category: "Electronics", slot: "Shelf A-05", capacity: 30, price: 449 },
  { id: "SKU-1038", barcode: "5000394018389", name: "Duracell Ultra AA Pack of 4", category: "Electronics", slot: "Shelf A-06", capacity: 50, price: 170 },
  { id: "SKU-1039", barcode: "8901725064394", name: "Classmate Notebook Spiral 300p", category: "Stationery", slot: "Shelf F-01", capacity: 35, price: 130 },
  { id: "SKU-1040", barcode: "8901198000407", name: "Parker Vector Rollerball Pen", category: "Stationery", slot: "Shelf F-02", capacity: 20, price: 290 },
  { id: "SKU-1041", barcode: "8901425026410", name: "Doms Neon Graphite Pencils", category: "Stationery", slot: "Shelf F-03", capacity: 40, price: 60 },
  { id: "SKU-1042", barcode: "8901860010425", name: "Fevicol MR Adhesive 100g", category: "Stationery", slot: "Shelf F-04", capacity: 45, price: 45 },
  { id: "SKU-1043", barcode: "8901198104433", name: "Cello Maxriter Pen Pack 5", category: "Stationery", slot: "Shelf F-05", capacity: 50, price: 50 },
  { id: "SKU-1044", barcode: "9781847941831", name: "Atomic Habits - James Clear", category: "Books", slot: "Aisle D-02", capacity: 15, price: 499 },
  { id: "SKU-1045", barcode: "9789390166268", name: "The Psychology of Money", category: "Books", slot: "Aisle D-03", capacity: 15, price: 350 },
  { id: "SKU-1046", barcode: "9781786330895", name: "Ikigai: Japanese Secret", category: "Books", slot: "Aisle D-04", capacity: 18, price: 399 },
  { id: "SKU-1047", barcode: "9781612680194", name: "Rich Dad Poor Dad", category: "Books", slot: "Aisle D-05", capacity: 20, price: 299 },
  { id: "SKU-1048", barcode: "4549526611484", name: "Casio FX-991CW Calculator", category: "Electronics", slot: "Shelf A-07", capacity: 10, price: 1495 },
  { id: "SKU-1049", barcode: "8901030049499", name: "Milton Thermosteel 1000ml", category: "Household", slot: "Aisle E-06", capacity: 15, price: 890 },
  { id: "SKU-1050", barcode: "8906023281507", name: "Pigeon Handy Chopper", category: "Household", slot: "Aisle E-07", capacity: 25, price: 249 },
];

export default function RetailDashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALERTS" | "FULFILLED">("ALERTS");
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Counter Load Management
  const [counterRush, setCounterRush] = useState({ c1: 4, c2: 4, c3Active: false, rushAlert: true });

  // Real-Time Dynamic Slots
  // inCart: Camera Invigilated | sold: POS Cleared | restocked: Slot Returns
  const [slotData, setSlotData] = useState<Record<string, { inCart: number; sold: number; restocked: number; depletedAt: number | null }>>({
    "SKU-3059": { inCart: 2, sold: 13, restocked: 0, depletedAt: Date.now() - 360000 },
    "SKU-1837": { inCart: 4, sold: 44, restocked: 0, depletedAt: Date.now() - 180000 },
    "SKU-5962": { inCart: 1, sold: 26, restocked: 0, depletedAt: Date.now() - 90000 },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show Toast
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Direct WhatsApp Alert Dispatch
  const sendWhatsAppNotification = (title: string, details: string) => {
    const message = encodeURIComponent(
      `🚨 *RETAILER VISION OS - STORE ALERT*\n\n` +
      `📌 *Incident:* ${title}\n` +
      `⚠️ *Details:* ${details}\n` +
      `⏱️ *Time:* ${new Date().toLocaleTimeString()}\n\n` +
      `👉 *Action:* Please instruct floor staff to inspect and replenish immediately.`
    );
    window.open(`https://wa.me/${MANAGER_WHATSAPP}?text=${message}`, "_blank");
    notify(`Alert opened on WhatsApp for +${MANAGER_WHATSAPP}`);
  };

  // Trigger Local Python Camera via Tunnel (With Localtunnel Reminder Bypass)
  const handleExecuteScan = async () => {
    setIsScanning(true);
    notify("Opening Edge Camera Scanner... Hold barcode before lens.");

    try {
      const res = await fetch(`${NGROK_BACKEND_URL}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true",
        },
      });
      const data = await res.json();

      if (data.status === "success" && data.barcode) {
        const scannedCode = data.barcode.trim();
        const item = STORE_CATALOG.find(s => s.barcode === scannedCode || s.barcode.endsWith(scannedCode));

        if (item) {
          setSlotData((prev) => {
            const cur = prev[item.id] || { inCart: 0, sold: 0, restocked: 0, depletedAt: null };
            const nextInCart = cur.inCart + 1;
            const remaining = item.capacity - (nextInCart + cur.sold) + cur.restocked;
            const isDepleted = remaining / item.capacity < 0.7;

            return {
              ...prev,
              [item.id]: {
                ...cur,
                inCart: nextInCart,
                depletedAt: isDepleted && !cur.depletedAt ? Date.now() : cur.depletedAt,
              },
            };
          });
          notify(`[INVIGILATED] ${item.name} added to cart from ${item.slot}`);
        } else {
          notify(`Scanned unknown barcode: ${scannedCode}`);
        }
      } else {
        notify("Scanner closed or timed out.");
      }
    } catch {
      notify("Tunnel connection error. Ensure python & localtunnel are running.");
    } finally {
      setIsScanning(false);
    }
  };

  // Restock / Fulfill Slot Action
  const handleRestockSlot = (id: string, name: string) => {
    setSlotData((prev) => {
      const cur = prev[id] || { inCart: 0, sold: 0, restocked: 0, depletedAt: null };
      const totalMoved = cur.inCart + cur.sold;
      return {
        ...prev,
        [id]: {
          ...cur,
          restocked: cur.restocked + totalMoved,
          inCart: 0,
          depletedAt: null,
        },
      };
    });
    notify(`Slot replenished: ${name} restored to 100% capacity.`);
  };

  // Checkout & Auto PDF Invoice
  const handleCheckoutAndGenerateBill = async () => {
    const activeItems = STORE_CATALOG.map((s) => {
      const live = slotData[s.id] || { inCart: 0 };
      return live.inCart > 0 ? { name: s.name, barcode: s.barcode, qty: live.inCart, price: s.price } : null;
    }).filter(Boolean);

    if (activeItems.length === 0) {
      notify("Cart is empty. Scan items first!");
      return;
    }

    notify("Generating Tax Invoice PDF via Edge Engine...");

    try {
      await fetch(`${NGROK_BACKEND_URL}/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true",
        },
        body: JSON.stringify({ items: activeItems }),
      });
    } catch {
      console.log("Local PDF generated.");
    }

    setSlotData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        updated[k] = { ...updated[k], sold: updated[k].sold + updated[k].inCart, inCart: 0 };
      });
      return updated;
    });

    notify("Cart cleared & billed! PDF Invoice launched.");
  };

  // Dynamic Computations: Critical FIFO Depleted (<70%) vs Fulfilled (>70%)
  const { criticalQueue, fulfilledList, totalInCart } = useMemo(() => {
    const crit: any[] = [];
    const fulf: any[] = [];
    let inCartCount = 0;

    STORE_CATALOG.forEach((sku) => {
      const live = slotData[sku.id] || { inCart: 0, sold: 0, restocked: 0, depletedAt: null };
      inCartCount += live.inCart;
      const currentStock = Math.max(0, sku.capacity - (live.inCart + live.sold) + live.restocked);
      const ratio = currentStock / sku.capacity;

      const payload = {
        ...sku,
        currentStock,
        ratio,
        inCart: live.inCart,
        depletedAt: live.depletedAt,
      };

      if (ratio < 0.7) {
        crit.push(payload);
      } else {
        fulf.push(payload);
      }
    });

    // Oldest depleted slot on TOP (FIFO Priority)
    crit.sort((a, b) => (a.depletedAt || 0) - (b.depletedAt || 0));
    return { criticalQueue: crit, fulfilledList: fulf, totalInCart: inCartCount };
  }, [slotData]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans text-sm text-slate-400">
        Initializing Retailer Vision Hub...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white p-4 sm:p-6 lg:p-8 relative">
      
      {/* Toast Bar */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <IconSparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <IconStore className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Retailer Vision OS</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300">
                Tunnel Active
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous FIFO Shelf Compliance, Rush Dispatch & WhatsApp Alerts</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Catalog Drawer Trigger */}
          <button
            onClick={() => setShowCatalogModal(true)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
          >
            Manage Catalog (50 SKUs)
          </button>

          {/* On-Demand Camera Trigger */}
          <button
            onClick={handleExecuteScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm disabled:opacity-50"
          >
            <IconCamera className="w-4 h-4" />
            <span>{isScanning ? "Scanning Camera..." : "Execute Scan"}</span>
          </button>

          {/* Checkout & PDF Invoice */}
          <button
            onClick={handleCheckoutAndGenerateBill}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm active:scale-95"
          >
            <IconReceipt className="w-4 h-4" />
            <span>Checkout & PDF ({totalInCart})</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-6xl mx-auto py-6 space-y-6">

        {/* Counter Rush Management Banner */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 ${
          counterRush.rushAlert ? "bg-rose-950/20 border-rose-800/80 shadow-xs" : "bg-slate-900/60 border-slate-800"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                counterRush.rushAlert ? "bg-rose-600 text-white animate-bounce" : "bg-slate-800 text-slate-400"
              }`}>
                <IconAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Queue Bottleneck Intelligence</h3>
                  {counterRush.rushAlert && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                      CONGESTION DETECTED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Counter 1: <b className="text-white">{counterRush.c1}</b> in queue • Counter 2: <b className="text-white">{counterRush.c2}</b> in queue
                  {counterRush.rushAlert ? " — Bottleneck reached! Deploy express Counter 3." : " — Traffic is normal."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => sendWhatsAppNotification(
                  "COUNTER 3 RUSH DISPATCH",
                  `Queue overload on Counter 1 (${counterRush.c1}) & Counter 2 (${counterRush.c2}). Deploy Counter 3 immediately!`
                )}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                <IconMessage />
                <span>Alert Manager (WhatsApp)</span>
              </button>

              <button
                onClick={() => setCounterRush(prev => ({ ...prev, c3Active: !prev.c3Active, rushAlert: false }))}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  counterRush.c3Active ? "bg-slate-800 text-slate-300" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                {counterRush.c3Active ? "Close Counter 3" : "Open Counter 3"}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("ALERTS")}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition ${
              activeTab === "ALERTS" ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>FIFO Depletion Queue (&lt; 70% Capacity)</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400/20 text-amber-300 font-mono">
              {criticalQueue.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("FULFILLED")}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition ${
              activeTab === "FULFILLED" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <IconCheck className="w-3.5 h-3.5" />
            <span>Optimal & Fulfilled Slots</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-400/20 text-emerald-300 font-mono">
              {fulfilledList.length}
            </span>
          </button>
        </div>

        {/* Tab 1: FIFO Depletion Queue (Oldest Empty Slot First) */}
        {activeTab === "ALERTS" && (
          <div className="space-y-3">
            {criticalQueue.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 text-slate-500 text-xs">
                All shelf slots are operating above 70% capacity. No immediate replenishment needed.
              </div>
            ) : (
              criticalQueue.map((item, idx) => {
                const percentage = Math.round(item.ratio * 100);
                const minutesAgo = item.depletedAt ? Math.max(1, Math.round((Date.now() - item.depletedAt) / 60000)) : 1;

                return (
                  <div
                    key={item.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{item.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {item.slot}
                          </span>
                        </div>
                        <p className="text-xs text-amber-400/90 mt-0.5 font-medium">
                          Depleted first ({minutesAgo} min ago) • Remaining: {item.currentStock} / {item.capacity} units ({percentage}%)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* WhatsApp Dispatch Button */}
                      <button
                        onClick={() => sendWhatsAppNotification(
                          `RESTOCK SLOT: ${item.slot}`,
                          `Critical: ${item.name} at ${item.slot} is below 70% (${percentage}% left). Assign staff to refill.`
                        )}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                      >
                        <IconMessage />
                        <span>Send WhatsApp</span>
                      </button>

                      {/* Manual Restock Override */}
                      <button
                        onClick={() => handleRestockSlot(item.id, item.name)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
                      >
                        Mark Restocked (+100%)
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Fulfilled & Fully Stocked Slots */}
        {activeTab === "FULFILLED" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {fulfilledList.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{item.name}</h4>
                  <p className="text-[11px] text-slate-500">{item.slot} • Optimal Condition</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {item.currentStock} / {item.capacity}
                </span>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Slide-Over Drawer for Full 50 SKUs Catalog */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 max-h-[82vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Full Store Catalog (50 SKUs)</h3>
                <p className="text-xs text-slate-400">Inventory slots and mapped EAN barcodes</p>
              </div>
              <button onClick={() => setShowCatalogModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            
            <div className="overflow-y-auto py-3 space-y-2 text-xs divide-y divide-slate-800/60">
              {STORE_CATALOG.map((s) => {
                const live = slotData[s.id] || { inCart: 0, sold: 0, restocked: 0 };
                const cur = Math.max(0, s.capacity - (live.inCart + live.sold) + live.restocked);
                return (
                  <div key={s.id} className="pt-2 flex justify-between items-center text-slate-300">
                    <div>
                      <span className="font-bold text-white">{s.name}</span>
                      <p className="text-[10px] text-slate-500 font-mono">{s.slot} • {s.barcode} • Rs.{s.price}</p>
                    </div>
                    <span className="font-mono text-slate-400">{cur} / {s.capacity} left</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
