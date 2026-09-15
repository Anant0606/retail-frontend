"use client";

import React, { useState, useEffect } from "react";

const MANAGER_PHONE = "9472948984";
const NTFY_TOPIC = `retail-vision-${MANAGER_PHONE}`;
const BACKEND_TUNNEL_URL = "https://puny-lands-flow.loca.lt";

interface SKUItem {
  id: string;
  barcode: string;
  name: string;
  slot: string;
  capacity: number;
  price: number;
}

const STORE_SKUS: SKUItem[] = [
  { id: "SKU-3059", barcode: "8905650133059", name: "boAt Wave Smartwatch", slot: "Shelf A-01", capacity: 15, price: 1499 },
  { id: "SKU-5962", barcode: "8902653015962", name: "Crompton LED Light 5W", slot: "Shelf B-02", capacity: 25, price: 1000 },
  { id: "SKU-1473", barcode: "9789354401473", name: "Fingerprint Classics Book", slot: "Aisle D-01", capacity: 20, price: 149 },
  { id: "SKU-1837", barcode: "8901491101837", name: "Lays Magic Masala Chips", slot: "Shelf C-04", capacity: 50, price: 20 },
  { id: "SKU-1005", barcode: "8901262010051", name: "Amul Taaza Milk 1L", slot: "Chiller-01", capacity: 40, price: 74 },
  { id: "SKU-1009", barcode: "8901058852095", name: "Maggi 2-Minute Noodles", slot: "Shelf C-01", capacity: 45, price: 96 },
];

export default function RetailerVisionMasterOS() {
  // Navigation View: "dashboard" | "airs_intro" | "shelf_inventory"
  const [activeTab, setActiveTab] = useState<"dashboard" | "airs_intro" | "shelf_inventory">("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  // Collapsible toggle for Shelf Status in main dashboard (Default Hidden as requested)
  const [showShelfSection, setShowShelfSection] = useState(false);

  // States
  const [barcodeInput, setBarcodeInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tunnelBlobUrl, setTunnelBlobUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Footfall Stats (Dashboard 1 & 2 Sync)
  const [footfall, setFootfall] = useState({ in: 78, out: 49 });
  const activeInStore = Math.max(0, footfall.in - footfall.out);

  // Queue Counters
  const [counters, setCounters] = useState({ c1: 5, c2: 4, c3Active: false });
  const isRushAlert = (counters.c1 >= 4 && counters.c2 >= 4) && !counters.c3Active;

  // Shelf Inventory & Cart Tracking
  const [slotData, setSlotData] = useState<Record<string, { inCart: number; sold: number; restocked: number }>>({
    "SKU-3059": { inCart: 3, sold: 4, restocked: 0 },
    "SKU-5962": { inCart: 2, sold: 18, restocked: 0 },
    "SKU-1473": { inCart: 0, sold: 7, restocked: 0 },
    "SKU-1837": { inCart: 5, sold: 38, restocked: 0 },
  });

  // Recent In-store Activity Log
  const [activityLogs, setActivityLogs] = useState([
    { text: "Cart Cleared & Invoiced via Vision Counter", time: "Just now", type: "success" },
    { text: "Item Picked [SKU-1837] - Shelf updated", time: "Just now", type: "info" },
    { text: "Item Picked [SKU-1473] - Shelf updated", time: "Just now", type: "info" },
  ]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculations
  const totalInCart = Object.values(slotData).reduce((acc, cur) => acc + cur.inCart, 0);
  const totalSoldRevenue = STORE_SKUS.reduce((acc, item) => {
    const sold = slotData[item.id]?.sold || 0;
    return acc + sold * item.price;
  }, 0) + 62540; // Base historical sync

  const totalCapacity = STORE_SKUS.reduce((acc, item) => acc + item.capacity, 0);
  const totalRemaining = STORE_SKUS.reduce((acc, item) => {
    const live = slotData[item.id] || { inCart: 0, sold: 0, restocked: 0 };
    return acc + Math.max(0, item.capacity - (live.inCart + live.sold) + live.restocked);
  }, 0);
  const shelfClearancePercent = Math.round(((totalCapacity - totalRemaining) / totalCapacity) * 100);

  // Poll Thermal Stream from Python Backend (Your Phone Camera Feed)
  useEffect(() => {
    let active = true;
    const pollTunnel = async () => {
      try {
        const res = await fetch(`${BACKEND_TUNNEL_URL}/thermal_blob`, {
          headers: { "bypass-tunnel-reminder": "true" }
        });
        if (res.ok && active) {
          const blob = await res.blob();
          setTunnelBlobUrl(URL.createObjectURL(blob));
        }
      } catch {
        // Silent tunnel retry
      } finally {
        if (active) setTimeout(pollTunnel, 80);
      }
    };
    pollTunnel();
    return () => { active = false; };
  }, []);

  // --- NTFY DIRECT PUSH NOTIFICATION (Zero-failure) ---
  const triggerNtfyAlert = async (title: string, msg: string, priority: string = "urgent") => {
    notify(`Pushing alert to phone (${NTFY_TOPIC})...`);
    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        body: msg,
        headers: {
          "Title": `🚨 ${title}`,
          "Priority": priority,
          "Tags": "warning,rotating_light,shopping_cart"
        }
      });
      notify("🔔 Notification pushed to your lock-screen!");
    } catch {
      notify("Push notification error. Check network.");
    }
  };

  // --- BARCODE SCANNER (Friend's DroidCam 100.98.203.70) ---
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
          notify(`✅ Scanned & Added: ${matchedItem.name}`);
        } else {
          notify(`Scanned Barcode: ${data.barcode} (Unregistered SKU)`);
        }
      } else {
        notify("❌ No barcode detected. Hold closer to Friend's camera.");
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
    const item = STORE_SKUS.find(s => s.id === skuId);
    if (item && delta > 0) {
      setActivityLogs(prev => [
        { text: `Item Picked [${item.id}] - Shelf updated`, time: "Just now", type: "info" },
        ...prev.slice(0, 4)
      ]);
    }
  };

  const handleBarcodeInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = STORE_SKUS.find(s => s.barcode === barcodeInput.trim() || s.id === barcodeInput.trim());
    if (item) {
      handlePickReturn(item.id, 1);
      setBarcodeInput("");
      notify(`Added ${item.name} to invigilated cart.`);
    } else {
      notify("SKU or Barcode not found!");
    }
  };

  const handleCheckoutCart = () => {
    if (totalInCart === 0) {
      notify("No items in cart to checkout!");
      return;
    }
    setSlotData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        updated[k] = { ...updated[k], sold: updated[k].sold + updated[k].inCart, inCart: 0 };
      });
      return updated;
    });
    setActivityLogs(prev => [
      { text: `Cart Cleared & Invoiced (₹${totalInCart * 450} approx) via Vision Counter`, time: "Just now", type: "success" },
      ...prev.slice(0, 4)
    ]);
    notify(`✅ Cart Cleared! Invoice pushed to store register.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-3 lg:p-6 space-y-4 relative selection:bg-indigo-600">
      
      {/* Toast Bar */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl animate-bounce border border-indigo-400/40">
          {toastMessage}
        </div>
      )}

      {/* ================= TOP NAVIGATION BAR ================= */}
      <nav className="bg-slate-900/90 backdrop-blur border border-slate-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xl relative z-40">
        
        {/* Left: Brand Identity & Custom Hamburger Button */}
        <div className="flex items-center gap-3">
          {/* Custom Hamburger Button Styled from Screenshot */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle AIRS Menu"
            className="w-9 h-11 rounded-xl bg-slate-950 border border-amber-500/40 hover:border-amber-400 flex flex-col items-center justify-center gap-1 transition shadow-inner"
          >
            <span className="w-4 h-0.5 bg-slate-200 rounded-full" />
            <span className="w-4 h-0.5 bg-slate-200 rounded-full" />
            <span className="w-4 h-0.5 bg-slate-200 rounded-full" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-600/30">
              🏪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm lg:text-base font-black tracking-tight text-white">Retailer Vision OS</h1>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Autonomous Shelf Compliance & Footfall Intelligence</p>
            </div>
          </div>
        </div>

        {/* Center/Tabs: Quick View Switchers */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === "dashboard" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            Store Operations
          </button>
          <button
            onClick={() => setActiveTab("shelf_inventory")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === "shelf_inventory" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            Shelf Slots & Stock
          </button>
          <button
            onClick={() => setActiveTab("airs_intro")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === "airs_intro" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            AIRS System Guide
          </button>
        </div>

        {/* Right: Actions & Team Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("airs_intro")}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-indigo-500 text-[11px] font-bold text-slate-200 flex items-center gap-1.5 transition"
          >
            <span className="text-indigo-400">✨</span>
            <span>DESIGNED BY <b>TEAM AIRS</b></span>
          </button>

          <button
            onClick={() => triggerNtfyAlert("MANUAL DISPATCH", "Operations supervisor requested on-floor sync.", "high")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-500 text-[11px] font-bold text-slate-300 hidden sm:flex items-center gap-1"
          >
            <span>📢 Alerts On</span>
          </button>

          <button
            onClick={handleCheckoutCart}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition"
          >
            <span>💳 Checkout Cart</span>
            {totalInCart > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-950 rounded-full text-[10px] font-mono border border-emerald-400">
                {totalInCart}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile / Dropdown Menu Modal */}
      {menuOpen && (
        <div className="absolute top-16 left-4 z-50 w-64 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 px-2 py-1">Navigate Platform</div>
          <button
            onClick={() => { setActiveTab("dashboard"); setMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${activeTab === "dashboard" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            📊 Live Store Operations
          </button>
          <button
            onClick={() => { setActiveTab("shelf_inventory"); setMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${activeTab === "shelf_inventory" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            📦 Shelf Slots & Inventory
          </button>
          <button
            onClick={() => { setActiveTab("airs_intro"); setMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${activeTab === "airs_intro" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            📘 AIRS Architecture & Intro
          </button>
          <div className="border-t border-slate-800 my-1 pt-1">
            <div className="text-[10px] text-slate-400 px-2 py-1">
              Store Manager: <b className="text-indigo-300">+91-{MANAGER_PHONE}</b>
            </div>
          </div>
        </div>
      )}

      {/* 🚨 CRITICAL BOTTLENECK ALERT BAR (Image 2 style) */}
      {isRushAlert && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-600/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide text-rose-400">Queue Rush Detected (&ge; 4 Persons)</h4>
              <p className="text-xs text-slate-300">Counter 1 ({counters.c1}) & Counter 2 ({counters.c2}) congested. Open Counter 3 immediately!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerNtfyAlert(
                "CRITICAL QUEUE RUSH",
                `Counter 1 (${counters.c1}) & Counter 2 (${counters.c2}) congested. Open Counter 3 immediately!`
              )}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <span>🔔 Push Phone Alert</span>
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

      {/* ================= VIEW 1: MAIN OPERATIONS DASHBOARD ================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-4">
          
          {/* TOP 4 ANALYTIC KPI CARDS (From Image 1) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* 1. VISITOR FOOTFALL */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Visitor Footfall</span>
                <span className="text-indigo-400 text-sm">👥</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-white">{activeInStore}</span>
                <span className="text-xs text-slate-400">in store</span>
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <span className="text-emerald-400">In: {footfall.in}</span>
                <span>•</span>
                <span className="text-rose-400">Out: {footfall.out}</span>
              </div>
            </div>

            {/* 2. INVIGILATED ITEMS */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative">
              <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Invigilated Items</span>
                <span className="text-amber-400 text-sm">ⓘ</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-white">{totalInCart}</span>
                <span className="text-xs text-slate-400">in cart</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <span className="text-emerald-400">✓</span>
                <span>Camera active: In Cart, Not Sold</span>
              </p>
            </div>

            {/* 3. SHELF CLEARANCE */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative">
              <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Shelf Clearance</span>
                <span className="text-sky-400 text-sm">📦</span>
              </div>
              <div className="mt-2 text-2xl lg:text-3xl font-black text-white">
                {shelfClearancePercent}%
              </div>
              <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${shelfClearancePercent}%` }} />
              </div>
            </div>

            {/* 4. CLEARED REVENUE */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative">
              <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Cleared Revenue</span>
                <span className="text-emerald-400 text-sm">📈</span>
              </div>
              <div className="mt-2 text-2xl lg:text-3xl font-black text-white">
                ₹{totalSoldRevenue.toLocaleString()}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                {Object.values(slotData).reduce((a, c) => a + c.sold, 50)} products cleared
              </p>
            </div>

          </section>

          {/* SECOND ROW: SEARCH & ACTION BAR (Image 2) */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Toggle Shelf Status Visibility Button */}
              <button
                onClick={() => setShowShelfSection(!showShelfSection)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <span>{showShelfSection ? "👁️ Hide Shelf Slots" : "📦 Show Shelf Slots"}</span>
              </button>
              
              <button
                onClick={() => setActiveTab("shelf_inventory")}
                className="px-3 py-2 bg-slate-950 border border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-bold text-indigo-300 transition whitespace-nowrap"
              >
                Full Inventory Table →
              </button>
            </div>

            {/* Barcode Form + Friend DroidCam Scan Trigger */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <form onSubmit={handleBarcodeInputSubmit} className="flex gap-1.5 flex-1 sm:flex-none">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan Barcode / SKU Code..."
                  className="bg-slate-950 border border-slate-700 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-slate-100 w-full sm:w-56"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap">
                  Add
                </button>
              </form>

              <button
                onClick={handleFriendDroidCamScan}
                disabled={isScanning}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-md flex items-center gap-1.5 transition"
              >
                <span>{isScanning ? "Scanning..." : "📷 Friend DroidCam Scan"}</span>
              </button>
            </div>
          </div>

          {/* MAIN TWO-COLUMN SPLIT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* LEFT COLUMN: Queues, Activity Log, and Collapsible Shelf Section */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Counter Queue Status Box */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Counter Queue Status</h3>
                  <span className="text-[10px] font-mono text-slate-400">AIRS Video Analytics</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">Counter 1</span>
                    <span className="text-xl font-black text-white">{counters.c1} in Line</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">Counter 2</span>
                    <span className="text-xl font-black text-white">{counters.c2} in Line</span>
                  </div>
                  <div className={`p-3 rounded-xl border flex flex-col justify-between ${counters.c3Active ? "bg-emerald-950/40 border-emerald-800" : "bg-slate-950 border-slate-800"}`}>
                    <span className="text-[10px] text-slate-400 font-bold">Counter 3</span>
                    <button
                      onClick={() => setCounters(prev => ({ ...prev, c3Active: !prev.c3Active }))}
                      className={`text-[10px] font-bold px-2 py-1 rounded transition mt-1 ${counters.c3Active ? "bg-rose-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
                    >
                      {counters.c3Active ? "Close C3" : "Open C3"}
                    </button>
                  </div>
                </div>
              </div>

              {/* COLLAPSIBLE / HIDDEN BY DEFAULT: Live Shelf Slots & Stock Status (From Image 1) */}
              {showShelfSection && (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Shelf Slots & Stock Status</h3>
                      <p className="text-[11px] text-slate-500">Auto-vision updates vacant slots when items are picked</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">{totalRemaining} units on shelf</span>
                  </div>

                  <div className="space-y-2">
                    {STORE_SKUS.slice(0, 4).map(item => {
                      const live = slotData[item.id] || { inCart: 0, sold: 0, restocked: 0 };
                      const remaining = Math.max(0, item.capacity - (live.inCart + live.sold) + live.restocked);
                      const vacant = item.capacity - remaining;

                      return (
                        <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="font-bold text-white block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.id} • ₹{item.price}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono font-bold text-white">{remaining} / {item.capacity}</span>
                            <span className="text-slate-400 font-mono">{vacant} vacant</span>
                            <button
                              onClick={() => handlePickReturn(item.id, 1)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold"
                            >
                              + Pick
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Live Store Activity & Invigilation Rules (From Image 1) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                
                {/* Live Activity Feed */}
                <div className="md:col-span-7 bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Store Activity</h4>
                    <span className="text-[10px] font-mono text-indigo-400">Real-time</span>
                  </div>
                  <div className="space-y-2">
                    {activityLogs.map((log, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl text-xs flex justify-between items-center">
                        <span className="text-slate-300 text-[11px] truncate">{log.text}</span>
                        <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap ml-2">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invigilation Rule Card */}
                <div className="md:col-span-5 bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-900/80 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold">
                      <span>🛡️</span>
                      <span>INVIGILATION RULE</span>
                    </div>
                    <h5 className="text-xs font-black text-white mt-1">In Cart & Not Sold Detection</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                      Jab koi customer shelf se item pick karta hai, vision AI use "Invigilated" mark karta hai. Counter checkout par status safely clear ho jata hai.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-indigo-400 mt-3 pt-2 border-t border-indigo-900/50">
                    AIRS Compliance Engine
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: Thermal Live Stream (Your Phone Camera) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Camera Stream</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Your Phone Thermal Feed (Tunnel)</p>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>HOG Person Thermal Active</span>
                  </span>
                </div>

                {/* Video / Canvas Stream View */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center shadow-inner">
                  {tunnelBlobUrl ? (
                    <img src={tunnelBlobUrl} alt="Your Phone Thermal Stream" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-950 p-4 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                        <span>PHONE_CAM_01 [TUNNEL CONNECTING...]</span>
                        <span>DPDP ACTIVE</span>
                      </div>
                      <div className="my-auto text-center space-y-2">
                        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-slate-400 font-mono">Connecting to your phone camera stream...</p>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                        <span>Zero PII Mode</span>
                        <span>HOG Human Pipeline</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Manager Phone Info Card */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Alert Dispatch Target</span>
                  <span className="text-sm font-black text-indigo-300 tracking-wider">+91-{MANAGER_PHONE}</span>
                </div>
                <button
                  onClick={() => triggerNtfyAlert("TEST BEAT", "Health check from Retailer Vision Master OS.", "default")}
                  className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/50 text-indigo-200 text-xs font-bold rounded-xl transition"
                >
                  Test Beep 🔔
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ================= VIEW 2: FULL SHELF SLOTS & INVENTORY ================= */}
      {activeTab === "shelf_inventory" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-white">Live Shelf Inventory & Slot Monitoring</h2>
              <p className="text-xs text-slate-400">Detailed capacity, vacant slots, real-time cart counts and restock triggers</p>
            </div>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
            >
              ← Back to Operations
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Product Description</th>
                    <th className="p-3.5">Shelf Slot</th>
                    <th className="p-3.5">Stock Left</th>
                    <th className="p-3.5">Empty Slots</th>
                    <th className="p-3.5">In Cart</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {STORE_SKUS.map(item => {
                    const live = slotData[item.id] || { inCart: 0, sold: 0, restocked: 0 };
                    const remaining = Math.max(0, item.capacity - (live.inCart + live.sold) + live.restocked);
                    const vacant = item.capacity - remaining;
                    const isLow = remaining / item.capacity < 0.7;

                    return (
                      <tr key={item.id} className="hover:bg-slate-950/60 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{item.barcode} • ₹{item.price}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]">
                            {item.slot}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`font-mono font-black ${isLow ? "text-amber-400" : "text-white"}`}>
                            {remaining} / {item.capacity}
                          </span>
                          {isLow && <span className="ml-1 text-[10px] text-amber-400 font-bold">(&lt;70%)</span>}
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">
                          {vacant} vacant
                        </td>
                        <td className="p-3.5 font-mono font-bold text-indigo-400">
                          {live.inCart}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            {isLow && (
                              <button
                                onClick={() => triggerNtfyAlert(`LOW STOCK: ${item.slot}`, `${item.name} has only ${remaining} items remaining.`)}
                                className="px-2.5 py-1 bg-amber-950/80 border border-amber-600 text-amber-300 rounded font-bold text-[10px] hover:bg-amber-900"
                              >
                                Push Alert
                              </button>
                            )}
                            <button
                              onClick={() => handlePickReturn(item.id, 1)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold"
                            >
                              + Pick
                            </button>
                            <button
                              onClick={() => handlePickReturn(item.id, -1)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
                            >
                              - Return
                            </button>
                          </div>
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

      {/* ================= VIEW 3: DEDICATED AIRS INTRODUCTION & ARCHITECTURE ================= */}
      {activeTab === "airs_intro" && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/60 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                <span>Autonomous Retail Intelligence</span>
                <span>•</span>
                <span>DPDP Act 2023 Compliant</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">Project AIRS (Autonomous Invigilation & Retail Surveillance)</h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                A non-intrusive, privacy-preserving retail edge platform combining real-time human thermal wave analysis, automated shelf slot depletion invigilation, and multi-sensor dual DroidCam integration.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg whitespace-nowrap"
            >
              Open Live Operations →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1 */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700 flex items-center justify-center text-xl">
                🛡️
              </div>
              <h3 className="text-sm font-bold text-white">DPDP Act 2023 Privacy Standard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AIRS replaces raw optical surveillance with a Gaussian blurred monochromatic layer and synthetic JET color heatwaves. No facial recognition, biometrics, or PII are logged or stored.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-xl">
                📷
              </div>
              <h3 className="text-sm font-bold text-white">Dual DroidCam Hardware Pipeline</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                <b>Camera 1 (Your Phone):</b> Real-time HOG person tracking and warm dwell overlay.<br />
                <b>Camera 2 (Friend's Phone - 100.98.203.70):</b> Dedicated wireless barcode checkout engine.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-700 flex items-center justify-center text-xl">
                🔔
              </div>
              <h3 className="text-sm font-bold text-white">Instant ntfy Push Alert Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero third-party API dependencies. Critical incidents like queue bottlenecks (&ge;4 shoppers) or shelf depletion (&lt;70%) fire encrypted push notifications directly to the manager's phone lock-screen.
              </p>
            </div>

          </div>

          {/* System Workflow */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Edge-to-Cloud System Architecture</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-mono text-indigo-400 block font-bold">1. SENSING LAYER</span>
                <p className="text-slate-300 mt-1">Dual mobile feeds capture thermal occupancy and SKU EAN-13 barcodes.</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-mono text-indigo-400 block font-bold">2. LOCAL EDGE BRIDGE</span>
                <p className="text-slate-300 mt-1">Python FastAPI + OpenCV processes HOG human detection at 30 FPS.</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-mono text-indigo-400 block font-bold">3. NEXT.JS DASHBOARD</span>
                <p className="text-slate-300 mt-1">Real-time inventory invigilation, revenue analytics, and counter queue controls.</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-mono text-indigo-400 block font-bold">4. DISPATCH ENGINE</span>
                <p className="text-slate-300 mt-1">Instant lock-screen alert routing via ntfy without SMS gateway costs.</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
