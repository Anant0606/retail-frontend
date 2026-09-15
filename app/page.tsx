"use client";

import React, { useState, useEffect } from "react";

const MANAGER_PHONE = "9472948984";
const NTFY_TOPIC = `retail-vision-${MANAGER_PHONE}`;
// Apne active localtunnel URL ko yahan verify karein (without trailing slash)
const BACKEND_TUNNEL_URL = "https://puny-lands-flow.loca.lt";

interface RetailItem {
  id: string;
  barcode: string;
  name: string;
  category: string;
  sub: string;
  price: number;
  capacity: number;
  icon: string;
}

const PRODUCTS: RetailItem[] = [
  { id: "SKU-3059", barcode: "8905650133059", name: "boAt Wave Smartwatch", category: "Gadgets", sub: "1.69 HD display, bio-sensor & health tracking", price: 1499.00, capacity: 20, icon: "⌚" },
  { id: "SKU-5962", barcode: "8902653015962", name: "Crompton LED Light 5W", category: "Lighting", sub: "Cool daylight b22 energy-saving LED bulb", price: 1000.00, capacity: 25, icon: "💡" },
  { id: "SKU-1473", barcode: "9789354401473", name: "Fingerprint Classics / Chess", category: "Games/Books", sub: "Deluxe strategic wooden board & classics", price: 149.00, capacity: 30, icon: "♟️" },
  { id: "SKU-1837", barcode: "8901491101837", name: "Lays Magic Masala / Biscuits", category: "Snacks", sub: "Crispy salted spicy crunch combo rack", price: 20.00, capacity: 50, icon: "🍪" },
  { id: "SKU-1005", barcode: "8901262010051", name: "Amul Taaza Milk 1L", category: "Dairy", sub: "Homogenized toned fresh milk chiller", price: 74.00, capacity: 40, icon: "🥛" },
];

export default function CoffeehouseRetailOS() {
  const [activeCategory, setActiveCategory] = useState("All menu");
  const [selectedProduct, setSelectedProduct] = useState<RetailItem>(PRODUCTS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [streamLoaded, setStreamLoaded] = useState(false);

  // Real-Time Psychological State from Python Backend
  const [insights, setInsights] = useState({
    person_detected: false,
    dwell_seconds: 0.0,
    zone: "Scanning Aisle...",
    active_sku: "None",
    intent_state: "Aisle Clear",
    psychology_insight: "Monitoring retail aisle...",
    dwell_confidence: 0,
  });

  // Bill/Cart items tracking: { [skuId]: quantity }
  const [cart, setCart] = useState<Record<string, number>>({
    "SKU-3059": 1,
    "SKU-1837": 2,
    "SKU-1473": 1,
  });

  // Footfall Stats
  const [footfall] = useState({ in: 78, out: 49 });
  const activeInStore = Math.max(0, footfall.in - footfall.out);

  // Queue Counters
  const [counters, setCounters] = useState({ c1: 5, c2: 4, c3Active: false });
  const isRushAlert = counters.c1 >= 4 && counters.c2 >= 4 && !counters.c3Active;

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Poll Psychological Insights every 350ms
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_TUNNEL_URL}/shopper_insights`, {
          headers: { "bypass-tunnel-reminder": "true" }
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setInsights(data);
        }
      } catch {
        // Backend tunnel silent reconnect
      }
    }, 350);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Lock-Screen Direct Push Alert via ntfy
  const triggerNtfyAlert = async (title: string, msg: string) => {
    notify(`Pushing alert to phone (${NTFY_TOPIC})...`);
    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        body: msg,
        headers: { "Title": `🚨 ${title}`, "Priority": "urgent", "Tags": "warning,shopping_cart" }
      });
      notify("🔔 Notification pushed to lock-screen!");
    } catch {
      notify("Error pushing alert.");
    }
  };

  // Barcode Scanning via Friend's DroidCam (IP 100.98.203.70)
  const handleFriendScan = async () => {
    setIsScanning(true);
    notify("Scanning via Friend's DroidCam (100.98.203.70)...");
    try {
      const res = await fetch(`${BACKEND_TUNNEL_URL}/scan-barcode`, {
        method: "POST",
        headers: { "bypass-tunnel-reminder": "true" }
      });
      const data = await res.json();
      if (data.status === "success" && data.barcode) {
        const item = PRODUCTS.find(p => p.barcode === data.barcode) || PRODUCTS[0];
        addToCart(item.id);
        notify(`✅ Scanned & Added: ${item.name}`);
      } else {
        notify("❌ No barcode detected. Hold item closer to camera.");
      }
    } catch {
      notify("❌ Backend bridge offline. Check Python terminal.");
    } finally {
      setIsScanning(false);
    }
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

  // Financial Calculations
  const subtotal = Object.entries(cart).reduce((acc, [id, qty]) => {
    const item = PRODUCTS.find(p => p.id === id);
    return acc + (item ? item.price * qty : 0);
  }, 0);
  const discount = subtotal > 100 ? 50.00 : 0;
  const total = Math.max(0, subtotal - discount);

  const categories = [
    { label: "All menu", icon: "🛒" },
    { label: "Gadgets", icon: "⌚" },
    { label: "Games/Books", icon: "♟️" },
    { label: "Snacks", icon: "🍪" },
    { label: "Lighting", icon: "💡" },
    { label: "Dairy", icon: "🥛" },
  ];

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === "All menu" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#e87348] p-2 sm:p-4 flex items-center justify-center font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-8 z-50 bg-[#1e2229] border border-[#e87348] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Main Curved Dashboard Container */}
      <div className="w-full max-w-[1440px] h-[94vh] bg-[#1e2229] rounded-[36px] shadow-2xl flex overflow-hidden border border-[#2c323d]/50">
        
        {/* ================= LEFT SLIM ICON SIDEBAR ================= */}
        <aside className="w-20 bg-[#17191e] flex flex-col items-center justify-between py-6 border-r border-[#262b35]/60 shrink-0">
          <div className="flex flex-col items-center gap-7">
            {/* Brand Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#2a2f3a] flex items-center justify-center text-xl text-[#e87348] shadow-inner">
              🏪
            </div>

            {/* Nav Action Buttons */}
            <div className="flex flex-col gap-6 text-slate-400">
              <button className="w-10 h-10 rounded-xl bg-[#e87348] text-white flex items-center justify-center shadow-lg shadow-[#e87348]/30">
                🏠
              </button>
              <button 
                onClick={() => triggerNtfyAlert("FLOOR CALL", "Manager assistance requested at checkout zone.")} 
                className="hover:text-white transition"
                title="Trigger Manual Alert"
              >
                📢
              </button>
              <button 
                onClick={handleFriendScan} 
                className="hover:text-white transition" 
                title="Friend DroidCam Scan"
              >
                📷
              </button>
              <button 
                onClick={() => triggerNtfyAlert("RESTOCK AUDIT", "Shelf audit required for snacks and biscuits.")}
                className="hover:text-white transition"
                title="Restock Warning"
              >
                📦
              </button>
            </div>
          </div>

          <div className="w-10 h-10 rounded-xl bg-[#262b35] flex items-center justify-center text-slate-400 text-xs font-mono">
            AIRS
          </div>
        </aside>

        {/* ================= CENTER MAIN CATALOG & THERMAL OPS ================= */}
        <main className="flex-1 p-5 lg:p-6 overflow-y-auto flex flex-col space-y-5">
          
          {/* Top Bar: Title + Search & Scan Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Retailer Vision OS</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                  DPDP Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Autonomous Invigilation & Real-Time Psychological Dwell Tracking</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search SKU or item..."
                  className="bg-[#17191e] border border-[#2c323d] text-xs text-slate-200 rounded-2xl px-4 py-2.5 pl-9 w-full sm:w-60 focus:outline-none focus:border-[#e87348]"
                />
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
              </div>
              
              <button
                onClick={handleFriendScan}
                disabled={isScanning}
                className="px-3.5 py-2.5 bg-[#2a2f3a] hover:bg-[#343b48] border border-[#3b4352] text-xs font-bold text-[#e87348] rounded-2xl whitespace-nowrap transition flex items-center gap-1.5"
              >
                <span>{isScanning ? "Scanning..." : "📷 Friend DroidCam Scan"}</span>
              </button>
            </div>
          </div>

          {/* Queue Rush Notification Banner */}
          {isRushAlert && (
            <div className="p-3 bg-rose-950/40 border border-rose-600/60 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs text-rose-300 font-bold">
                  Queue Bottleneck: C1 ({counters.c1}) & C2 ({counters.c2}) congested!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerNtfyAlert("QUEUE BOTTLENECK", "Congestion at C1 & C2. Open Counter 3 immediately.")}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-bold"
                >
                  Push Phone Alert
                </button>
                <button
                  onClick={() => setCounters(prev => ({ ...prev, c3Active: true }))}
                  className="px-3 py-1 bg-[#17191e] text-slate-200 rounded-xl text-[11px] font-bold"
                >
                  Open C3
                </button>
              </div>
            </div>
          )}

          {/* Category Scroller */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categories.map((cat, idx) => {
              const active = activeCategory === cat.label;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 shrink-0 border transition ${
                    active
                      ? "bg-[#332420] border-[#e87348] text-white shadow-lg"
                      : "bg-[#17191e] border-[#262b35] text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${active ? "bg-[#e87348] text-white" : "bg-[#20252e]"}`}>
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-bold truncate px-1">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Catalog Row 1: Selected Item Card + Zero-Lag MJPEG Stream */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Left: Interactive Selected Product Card */}
            <div className="bg-[#17191e] border border-[#282e38] rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-md">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl bg-[#222731] flex items-center justify-center text-4xl shrink-0">
                  {selectedProduct.icon}
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-mono text-[#e87348] uppercase font-bold">{selectedProduct.category}</span>
                  <h3 className="text-sm font-black text-white mt-0.5">{selectedProduct.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{selectedProduct.sub}</p>
                  <div className="mt-2 text-base font-black text-white">₹{selectedProduct.price.toLocaleString()}</div>
                </div>
              </div>

              {/* Status Sync Pills */}
              <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-400">
                <div className="bg-[#121418] p-2.5 rounded-xl border border-[#232731]">
                  <span className="block text-[10px] text-slate-500 uppercase mb-1">Queue Sync</span>
                  <div className="flex gap-1.5 font-mono">
                    <span className="text-slate-300">C1: {counters.c1}</span>
                    <span>•</span>
                    <span className="text-slate-300">C2: {counters.c2}</span>
                  </div>
                </div>
                <div className="bg-[#121418] p-2.5 rounded-xl border border-[#232731]">
                  <span className="block text-[10px] text-slate-500 uppercase mb-1">Floor Occupancy</span>
                  <div className="flex gap-1.5 font-mono">
                    <span className="text-emerald-400">In: {footfall.in}</span>
                    <span>•</span>
                    <span className="text-rose-400">Out: {footfall.out}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart(selectedProduct.id);
                  notify(`Added ${selectedProduct.name} to bill!`);
                }}
                className="w-full py-3 bg-[#e87348] hover:bg-[#d8663d] text-white font-black text-xs rounded-2xl shadow-lg shadow-[#e87348]/25 transition"
              >
                Add to billing
              </button>
            </div>

            {/* Right: CONTINUOUS ZERO-LAG MJPEG THERMAL STREAM */}
            <div className="bg-[#17191e] border border-[#282e38] rounded-3xl p-4 flex flex-col justify-between space-y-3 shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-white">Live Thermal Stream</h3>
                  <p className="text-[10px] font-mono text-emerald-400">Zero-Lag MJPEG • Pulsing Red Hotspot</p>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${streamLoaded ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              </div>

              {/* Connected to /thermal_stream endpoint */}
              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden relative flex items-center justify-center border border-[#2e3440]">
                <img
                  src={`${BACKEND_TUNNEL_URL}/thermal_stream`}
                  alt="Live Real-time MJPEG Thermal Stream"
                  className="w-full h-full object-cover"
                  onLoad={() => setStreamLoaded(true)}
                  onError={(e) => {
                    setStreamLoaded(false);
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                {!streamLoaded && (
                  <div className="absolute inset-0 bg-[#121418] flex flex-col items-center justify-center space-y-2">
                    <div className="w-8 h-8 border-2 border-[#e87348] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[11px] font-mono text-slate-400">Connecting to zero-lag MJPEG stream...</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => triggerNtfyAlert("STORE AUDIT", "Sensor verification check requested by supervisor.")}
                className="w-full py-2 bg-[#252a34] hover:bg-[#2e3542] text-slate-200 text-xs font-bold rounded-2xl transition border border-[#343b48]"
              >
                Trigger System Health Ping
              </button>
            </div>

          </div>

          {/* LIVE SHOPPER PSYCHOLOGICAL INTENT CARD */}
          <div className="bg-[#17191e] border border-[#2c323d] rounded-3xl p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${insights.person_detected ? "bg-rose-500 animate-ping" : "bg-slate-600"}`} />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">AI Shopper Psychological Profile</h4>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-xl bg-[#20252e] text-[#e87348] border border-[#e87348]/40 font-bold">
                {insights.dwell_seconds}s Dwell Time
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-[#101216] p-2.5 rounded-xl border border-[#232731]">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Target Shelf</span>
                <span className="font-bold text-slate-200 text-xs">{insights.zone}</span>
              </div>
              <div className="bg-[#101216] p-2.5 rounded-xl border border-[#232731]">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Target Product</span>
                <span className="font-mono font-bold text-amber-400 text-xs">{insights.active_sku}</span>
              </div>
              <div className="bg-[#101216] p-2.5 rounded-xl border border-[#232731]">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Behavior State</span>
                <span className="font-bold text-emerald-400 text-xs">{insights.intent_state}</span>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-rose-950/30 to-[#17191e] border border-rose-800/40 rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                  <span>🧠</span>
                  <span>Psychological Trigger Analysis:</span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">
                  "{insights.psychology_insight}"
                </p>
              </div>

              {insights.person_detected && insights.dwell_seconds >= 6 && (
                <button 
                  onClick={() => triggerNtfyAlert("OFFER PUSH", `Customer hesitating at ${insights.zone}. Push 10% coupon!`)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-[10px] whitespace-nowrap shadow-md"
                >
                  Push 10% Coupon
                </button>
              )}
            </div>
          </div>

          {/* Bottom Secondary Product Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.slice(1, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedProduct(item)}
                className="p-3.5 bg-[#17191e] border border-[#282e38] hover:border-[#e87348]/60 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#222731] flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{item.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{item.sub}</p>
                    <span className="text-xs font-black text-white mt-0.5 block">₹{item.price.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item.id);
                  }}
                  className="w-8 h-8 rounded-xl bg-[#272c37] hover:bg-[#e87348] text-white flex items-center justify-center font-bold text-sm transition"
                >
                  +
                </button>
              </div>
            ))}
          </div>

        </main>

        {/* ================= RIGHT BILLS PANEL ================= */}
        <aside className="w-80 bg-[#17191e] p-6 border-l border-[#262b35]/60 flex flex-col justify-between shrink-0">
          
          <div>
            {/* Top Admin Profile Card */}
            <div className="flex items-center justify-between pb-6 border-b border-[#262b35]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#e87348] flex items-center justify-center text-white font-black text-sm">
                  AR
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Admin</span>
                  <h4 className="text-xs font-black text-white">Anant Raj</h4>
                </div>
              </div>

              <button
                onClick={() => triggerNtfyAlert("TEST AUDIT", "Lock-screen push pipeline verified.")}
                className="w-8 h-8 rounded-xl bg-[#222731] flex items-center justify-center text-slate-400 hover:text-white"
                title="Send test alert"
              >
                🔔
              </button>
            </div>

            {/* Bills Section Title */}
            <div className="flex justify-between items-center my-4">
              <h3 className="text-base font-black text-white">Bills</h3>
              <span className="text-[10px] font-mono text-slate-500">{Object.keys(cart).length} items</span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-[38vh] overflow-y-auto pr-1">
              {Object.entries(cart).map(([skuId, qty]) => {
                const item = PRODUCTS.find(p => p.id === skuId);
                if (!item) return null;

                return (
                  <div key={skuId} className="flex items-center justify-between text-xs py-1.5 border-b border-[#232731]/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#20252e] flex items-center justify-center text-base">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-bold text-white max-w-[130px] truncate">{item.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">x {qty}</span>
                          <button
                            onClick={() => removeFromCart(skuId)}
                            className="px-1.5 py-0.2 bg-[#282d38] text-slate-400 hover:text-rose-400 rounded text-[9px]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <span className="font-black text-white font-mono">₹{(item.price * qty).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Financial Summary & Checkout Button */}
          <div className="space-y-4 pt-4 border-t border-[#262b35]">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Discount</span>
                <span className="font-mono text-emerald-400">-₹{discount.toLocaleString()}</span>
              </div>
              <div className="border-t border-dashed border-[#343b47] pt-2 flex justify-between text-sm font-black text-white">
                <span>Total</span>
                <span className="font-mono text-[#e87348]">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (subtotal === 0) {
                  notify("Bill is empty!");
                  return;
                }
                setCart({});
                notify(`✅ Order Completed! Invoiced: ₹${total.toLocaleString()}`);
              }}
              className="w-full py-3.5 bg-[#e87348] hover:bg-[#d8663d] text-white font-black text-xs rounded-2xl shadow-lg shadow-[#e87348]/20 transition"
            >
              Checkout
            </button>
          </div>

        </aside>

      </div>
    </div>
  );
}
