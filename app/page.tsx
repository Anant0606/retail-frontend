"use client";

import React, { useState, useEffect } from "react";

const MANAGER_PHONE = "9472948984";
const NTFY_TOPIC = `retail-vision-${MANAGER_PHONE}`;
const BACKEND_TUNNEL_URL = "https://puny-lands-flow.loca.lt"; // Apna active localtunnel URL

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

// 50+ SKUs Expanded Catalog Mock
const MASTER_SKUS: SKUItem[] = [
  { id: "SKU-3059", barcode: "8905650133059", name: "boAt Wave Smartwatch", category: "Gadgets", price: 1499, capacity: 20, stock: 4, slot: "Shelf A-01" },
  { id: "SKU-5962", barcode: "8902653015962", name: "Crompton LED Light 5W", category: "Lighting", price: 1000, capacity: 25, stock: 5, slot: "Shelf B-02" },
  { id: "SKU-1473", barcode: "9789354401473", name: "Fingerprint Classics Book", category: "Books", price: 149, capacity: 30, stock: 13, slot: "Aisle D-01" },
  { id: "SKU-1837", barcode: "8901491101837", name: "Lays Magic Masala Chips", category: "Snacks", price: 20, capacity: 50, stock: 7, slot: "Shelf C-04" },
  { id: "SKU-1005", barcode: "8901262010051", name: "Amul Taaza Milk 1L", category: "Dairy", price: 74, capacity: 40, stock: 35, slot: "Chiller-01" },
  { id: "SKU-1009", barcode: "8901058852095", name: "Maggi 2-Minute Noodles", category: "Snacks", price: 96, capacity: 45, stock: 12, slot: "Shelf C-02" },
  { id: "SKU-2001", barcode: "8901030584201", name: "Colgate Strong Teeth 200g", category: "Essentials", price: 115, capacity: 35, stock: 22, slot: "Shelf E-01" },
  { id: "SKU-2002", barcode: "8901138501202", name: "Surf Excel Easy Wash 1kg", category: "Essentials", price: 135, capacity: 25, stock: 6, slot: "Shelf E-03" },
  { id: "SKU-2003", barcode: "8901030351203", name: "Clinic Plus Shampoo 340ml", category: "Essentials", price: 210, capacity: 30, stock: 8, slot: "Shelf E-04" },
  { id: "SKU-2004", barcode: "8901450021204", name: "Bru Instant Coffee 100g", category: "Beverages", price: 280, capacity: 20, stock: 4, slot: "Shelf F-01" },
  // Generating simulated items up to 50+ SKUs programmatically for complete enterprise view
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `SKU-30${i + 10}`,
    barcode: `8905650133${i + 10}0`,
    name: `Retail Item Pro Series #${i + 11}`,
    category: i % 2 === 0 ? "Groceries" : "Hardware",
    price: (i + 1) * 45,
    capacity: 50,
    stock: Math.floor(Math.random() * 45) + 5,
    slot: `Zone-${String.fromCharCode(65 + (i % 5))}-${i + 1}`
  }))
];

export default function ARISCleanDashboard() {
  const [activeView, setActiveView] = useState<"home" | "stock" | "dwell" | "billing">("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [skus, setSkus] = useState<SKUItem[]>(MASTER_SKUS);
  const [footfall] = useState({ in: 84, out: 52 });
  const activeInStore = Math.max(0, footfall.in - footfall.out);

  const [counters, setCounters] = useState({ c1: 5, c2: 4, c3Active: false });
  const isRushAlert = counters.c1 >= 4 && counters.c2 >= 4 && !counters.c3Active;

  // Billing & Counter State
  const [cart, setCart] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");

  // Live Insights from Python Backend
  const [insights, setInsights] = useState({
    person_detected: false,
    dwell_seconds: 0.0,
    zone: "Scanning Aisle...",
    active_sku: "None",
    intent_state: "Browsing",
    psychology_insight: "Monitoring store traffic & offer triggers...",
  });

  // Live Updation Table Activities
  const [activities, setActivities] = useState([
    { text: "ARIS Intelligence Core Booted Successfully", time: "Just now", type: "success" },
    { text: "DroidCam Barcode Bridge Connected (100.98.203.70)", time: "2m ago", type: "info" },
    { text: "FIFO Stock Level Evaluated (<70% check active)", time: "5m ago", type: "info" },
  ]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Poll Backend Psychological Dwell Data
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
      } catch {
        // Silent background sync
      }
    }, 400);
    return () => { active = false; clearInterval(interval); };
  }, []);

  const triggerNtfyAlert = async (title: string, msg: string) => {
    notify(`Pushing alert to phone (${NTFY_TOPIC})...`);
    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        body: msg,
        headers: { "Title": `🚨 ${title}`, "Priority": "urgent", "Tags": "warning,shopping_cart" }
      });
      notify("🔔 Notification pushed to manager's lock-screen!");
    } catch {
      notify("Alert push error.");
    }
  };

  // Barcode Scan Handler for Refill vs Checkout
  const handleBarcodeScanWorkflow = async (mode: "REFILL" | "CHECKOUT") => {
    notify(`Scanning via DroidCam for ${mode}...`);
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
            setSkus(prev => prev.map(s => s.id === item.id ? { ...s, stock: s.capacity } : s));
            triggerNtfyAlert("SHELF LOT REFILLED", `Manager notified: Lot refilled for ${item.name} (${item.slot}). Stock restored.`);
            logActivity(`Stock Refilled via Barcode: ${item.name} lot updated.`);
          } else {
            addToCart(item.id);
            logActivity(`Sold & Added to Cart via Barcode: ${item.name}`);
          }
        } else {
          notify(`Scanned Barcode: ${data.barcode} (Unregistered SKU)`);
        }
      } else {
        notify("❌ No barcode detected. Hold item closer.");
      }
    } catch {
      notify("❌ Scanner offline. Check Python backend.");
    }
  };

  const logActivity = (text: string) => {
    setActivities(prev => [{ text, time: "Just now", type: "info" }, ...prev.slice(0, 6)]);
  };

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });
  };

  const lowStockItems = skus.filter(s => (s.stock / s.capacity) < 0.7);

  // PDF Export simulators
  const exportPsychologyPDF = () => {
    notify("📄 Exporting Customer Psychological Dwell Report PDF...");
    setTimeout(() => notify("✅ Psychological Data PDF Exported Successfully!"), 2000);
  };

  const exportBillPDF = () => {
    notify("📄 Generating Official Tax Invoice PDF...");
    setTimeout(() => {
      notify("✅ Bill PDF Exported & Printed!");
      setCart({});
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-3 lg:p-5 space-y-4 relative selection:bg-indigo-600">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl animate-bounce border border-indigo-400">
          {toast}
        </div>
      )}

      {/* ================= TOP NAVBAR & HAMBURGER MENU ================= */}
      <nav className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xl relative z-40">
        
        <div className="flex items-center gap-3">
          {/* Hamburger 3-Line Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-xl bg-slate-950 border border-indigo-500/40 hover:border-indigo-400 flex flex-col items-center justify-center gap-1.5 transition shadow-inner"
            aria-label="Toggle Navigation Menu"
          >
            <span className="w-5 h-0.5 bg-indigo-400 rounded-full" />
            <span className="w-5 h-0.5 bg-indigo-400 rounded-full" />
            <span className="w-5 h-0.5 bg-indigo-400 rounded-full" />
          </button>

          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-wider text-white">
              ARIS <span className="text-[10px] text-indigo-400 font-normal block sm:inline">(AUTOMATED RETAIL INTELLIGENCE SYSTEM)</span>
            </h1>
            <p className="text-[10px] text-slate-400">Team AIRS Enterprise Retail Platform</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button onClick={() => setActiveView("home")} className={`px-3 py-1.5 rounded-lg transition ${activeView === "home" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>Home Dashboard</button>
          <button onClick={() => setActiveView("stock")} className={`px-3 py-1.5 rounded-lg transition ${activeView === "stock" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>1) Stock Shelf Data</button>
          <button onClick={() => setActiveView("dwell")} className={`px-3 py-1.5 rounded-lg transition ${activeView === "dwell" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>2) Dwell Time & Psychology</button>
          <button onClick={() => setActiveView("billing")} className={`px-3 py-1.5 rounded-lg transition ${activeView === "billing" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>3) Counter Billing & Scan</button>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
        </div>
      </nav>

      {/* Hamburger Dropdown Menu (3 Options) */}
      {menuOpen && (
        <div className="absolute top-16 left-4 z-50 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl space-y-1.5 animate-fadeIn">
          <div className="text-[10px] font-mono uppercase text-indigo-400 px-2 py-1 font-bold">Navigation Options</div>
          <button onClick={() => { setActiveView("home"); setMenuOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${activeView === "home" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
            🏠 Main Home Dashboard
          </button>
          <button onClick={() => { setActiveView("stock"); setMenuOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${activeView === "stock" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
            📦 1) Stock Shelf Data (50+ SKUs)
          </button>
          <button onClick={() => { setActiveView("dwell"); setMenuOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${activeView === "dwell" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
            🧠 2) Dwell Time & Psychological Data
          </button>
          <button onClick={() => { setActiveView("billing"); setMenuOpen(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold ${activeView === "billing" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
            💳 3) Counter Boy Billing & Barcode Workflow
          </button>
        </div>
      )}

      {/* ================= MAIN HOMEPAGE DASHBOARD ================= */}
      {activeView === "home" && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Top Header Banner & Counters with Alert Button */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Footfall Stats */}
            <div className="lg:col-span-4 grid grid-cols-3 gap-2">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Cam In</span>
                <span className="text-2xl font-black text-white">{footfall.in}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-rose-400 block">Exit Out</span>
                <span className="text-2xl font-black text-white">{footfall.out}</span>
              </div>
              <div className="bg-slate-900 border border-indigo-900/60 p-3 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-indigo-300 block">Active Shoppers</span>
                <span className="text-2xl font-black text-indigo-400">{activeInStore}</span>
              </div>
            </div>

            {/* Counter Status & Alert Button */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Counter Queue Monitoring & Alerts</h3>
                {isRushAlert && <span className="text-[10px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded font-bold animate-pulse">Rush Detected</span>}
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Counter 1</span>
                  <span className="text-base font-black text-white">{counters.c1} in Line</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Counter 2</span>
                  <span className="text-base font-black text-white">{counters.c2} in Line</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCounters(prev => ({ ...prev, c3Active: !prev.c3Active }))}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition ${counters.c3Active ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
                  >
                    {counters.c3Active ? "C3 Active" : "Open C3"}
                  </button>
                </div>
              </div>

              {/* Alert button near counter section */}
              <div className="flex justify-end pt-1 border-t border-slate-800">
                <button
                  onClick={() => triggerNtfyAlert("COUNTER CONGESTION", `Counter 1 (${counters.c1}) & Counter 2 (${counters.c2}) are congested. Open C3!`)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <span>🔔 Send Counter Alert to Manager</span>
                </button>
              </div>
            </div>

          </div>

          {/* Lower Split: Live Updation Table & FIFO Low Stock Alert Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Side: Live Updation Data Table */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Updation Store Activity</h3>
                <span className="text-[10px] font-mono text-indigo-400">Real-time Stream</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activities.map((act, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs flex justify-between items-center">
                    <span className="text-slate-200">{act.text}</span>
                    <span className="text-[10px] font-mono text-slate-500">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: FIFO Low Stock Alert Table (<70%) with Alert Button */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">FIFO Low Stock Alert Table (&lt;70%)</h3>
                  <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-bold">
                    {lowStockItems.length} SKUs Alert
                  </span>
                </div>

                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {lowStockItems.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">All shelves are sufficiently stocked.</p>
                  ) : (
                    lowStockItems.slice(0, 5).map(item => {
                      const ratio = Math.round((item.stock / item.capacity) * 100);
                      return (
                        <div key={item.id} className="p-2.5 bg-slate-950 border border-amber-900/50 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.slot} • <b className="text-amber-400">{item.stock}/{item.capacity} ({ratio}%)</b></span>
                          </div>
                          <button
                            onClick={() => {
                              setSkus(prev => prev.map(s => s.id === item.id ? { ...s, stock: s.capacity } : s));
                              notify(`Refilled ${item.name} lot!`);
                              logActivity(`Refilled: ${item.name}`);
                            }}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-[10px]"
                          >
                            Refilled
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Alert button near FIFO section */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-400">FIFO Queue Ready</span>
                <button
                  onClick={() => triggerNtfyAlert("FIFO LOW STOCK BATCH", `Refill required for ${lowStockItems.length} critical shelf lots.`)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  🔔 Push FIFO Alerts to Manager
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= OPTION 1: STOCK SHELF DATA (50+ SKUs) ================= */}
      {activeView === "stock" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-black text-white">1) Stock Shelf Data & Live SKU Inventory (50+ SKUs)</h2>
              <p className="text-xs text-slate-400">Complete catalog tracking with real-time stock levels and automated alerts for items under 70% capacity.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter 50+ SKUs..."
                className="bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs rounded-xl text-white w-full sm:w-48"
              />
              <button onClick={() => setActiveView("home")} className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl whitespace-nowrap">
                ← Back
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto max-h-[65vh]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="p-3.5">SKU ID & Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Shelf Slot</th>
                    <th className="p-3.5">Stock Left / Capacity</th>
                    <th className="p-3.5">Status</th>
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
                          <span className={`font-mono font-black ${isLow ? "text-amber-400" : "text-emerald-400"}`}>
                            {item.stock} / {item.capacity} ({Math.round(ratio * 100)}%)
                          </span>
                        </td>
                        <td className="p-3.5">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-600 text-amber-300 text-[10px] font-bold">⚠️ Low Stock (&lt;70%)</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 text-[10px] font-bold">Optimal</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => {
                              setSkus(prev => prev.map(s => s.id === item.id ? { ...s, stock: s.capacity } : s));
                              notify(`Refilled ${item.name} to full capacity!`);
                              logActivity(`Stock Refilled: ${item.name}`);
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
              <p className="text-xs text-slate-400">Thermal live stream, customer stop duration, shelf attraction estimates, and psychological data export.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportPsychologyPDF}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <span>📥 Export Psychological Data PDF</span>
              </button>
              <button onClick={() => setActiveView("home")} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl">
                ← Back
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Live Thermal Stream */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Thermal Heatwave Camera Feed</h3>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  DPDP Compliant Zero-PII
                </span>
              </div>

              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center shadow-inner">
                <img
                  src={`${BACKEND_TUNNEL_URL}/thermal_stream`}
                  alt="Live Thermal Heatwave Stream"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Real-time Psychological Data Panel */}
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
                    <span className="text-slate-400">Variable Estimate Intent:</span>
                    <span className="font-bold text-emerald-400">{insights.intent_state}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-gradient-to-r from-indigo-950/60 to-slate-950 border border-indigo-900/60 rounded-xl">
                  <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold">AI Psychological Breakdown</div>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    "{insights.psychology_insight}"
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= OPTION 3: COUNTER BOY BILLING & BARCODE WORKFLOW ================= */}
      {activeView === "billing" && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-black text-white">3) Counter Boy Billing & Barcode Workflow</h2>
              <p className="text-xs text-slate-400">Manual SKU addition/removal for 50+ SKUs, bill PDF export, and DroidCam barcode scanner for lot refilling & sales checkout.</p>
            </div>
            <button onClick={() => setActiveView("home")} className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl whitespace-nowrap">
              ← Back
            </button>
          </div>

          {/* Top Barcode Scanner & Manual Entry Actions */}
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
                    notify("SKU not found!");
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
              >
                Add to Cart
              </button>
            </div>

            {/* DroidCam Barcode Workflow Buttons */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
              <button
                onClick={() => handleBarcodeScanWorkflow("REFILL")}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <span>📷 Scan Barcode: Refill Lot & Notify Manager</span>
              </button>
              <button
                onClick={() => handleBarcodeScanWorkflow("CHECKOUT")}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <span>📷 Scan Barcode: Product Sold Checkout</span>
              </button>
            </div>
          </div>

          {/* Catalog & Billing Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Quick Select SKU Catalog */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">50+ SKUs Quick Select Catalog</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {skus.slice(0, 16).map(item => (
                  <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.slot} • ₹{item.price}</span>
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

            {/* Right: Active Cart & Bill PDF Export */}
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
                  onClick={exportBillPDF}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
                >
                  <span>📥 Checkout & Export Bill PDF</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
