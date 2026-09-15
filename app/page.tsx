"use client";

import React, { useState, useEffect } from "react";

const MANAGER_PHONE = "9472948984";
const NTFY_TOPIC = `retail-vision-${MANAGER_PHONE}`;
const BACKEND_TUNNEL_URL = "https://yummy-signs-relate.loca.lt"; // Apna localtunnel link

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
  { id: "SKU-3059", barcode: "8905650133059", name: "Americano Passion Coffee", category: "Coffee", sub: "Coffee americano passion 2 shot caramel", price: 5.30, capacity: 20, icon: "☕" },
  { id: "SKU-5962", barcode: "8902653015962", name: "Macchiato Peper Chocochip", category: "Coffee", sub: "Hot coffee with extract chocochip", price: 8.21, capacity: 25, price: 8.21, icon: "🍫" },
  { id: "SKU-1473", barcode: "9789354401473", name: "Caffe Latte With Dalgona", category: "Coffee", sub: "A hot coffee with the top dalgona sugar", price: 6.28, capacity: 30, icon: "🥛" },
  { id: "SKU-1837", barcode: "8901491101837", name: "Frappucino Velvet Crisp", category: "Boba / Cold", sub: "Chilled blended mocha cream", price: 7.10, capacity: 40, icon: "🧋" },
  { id: "SKU-1005", barcode: "8901262010051", name: "Pure Berry Dessert Slice", category: "Dessert", sub: "Rich strawberry cream layered sponge", price: 4.50, capacity: 15, icon: "🍰" },
];

export default function CoffeehouseRetailOS() {
  const [activeCategory, setActiveCategory] = useState("Coffee");
  const [selectedProduct, setSelectedProduct] = useState<RetailItem>(PRODUCTS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tunnelBlobUrl, setTunnelBlobUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Bill/Cart items tracking: { [skuId]: quantity }
  const [cart, setCart] = useState<Record<string, number>>({
    "SKU-3059": 1,
    "SKU-5962": 1,
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

  // Tunnel Polling for Your Phone Thermal Stream
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
        // Fallback
      } finally {
        if (active) setTimeout(pollTunnel, 100);
      }
    };
    pollTunnel();
    return () => { active = false; };
  }, []);

  // Push Alert
  const triggerNtfyAlert = async (title: string, msg: string) => {
    notify(`Pushing alert to phone (${NTFY_TOPIC})...`);
    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        body: msg,
        headers: { "Title": `🚨 ${title}`, "Priority": "urgent", "Tags": "warning,coffee" }
      });
      notify("🔔 Notification pushed to lock-screen!");
    } catch {
      notify("Error pushing alert.");
    }
  };

  // Barcode Scanning via Friend's DroidCam
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
        notify("❌ No barcode detected.");
      }
    } catch {
      notify("❌ Backend bridge offline.");
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

  // Bill Calculations
  const subtotal = Object.entries(cart).reduce((acc, [id, qty]) => {
    const item = PRODUCTS.find(p => p.id === id);
    return acc + (item ? item.price * qty : 0);
  }, 0);
  const discount = subtotal > 0 ? 2.50 : 0;
  const total = Math.max(0, subtotal - discount);

  const categories = [
    { label: "All menu", icon: "🥤" },
    { label: "Coffee", icon: "☕" },
    { label: "Milky milk", icon: "🥛" },
    { label: "Bobaan", icon: "🧋" },
    { label: "Ice cream", icon: "🍦" },
    { label: "Dessert", icon: "🍰" },
  ];

  return (
    <div className="min-h-screen bg-[#e87348] p-3 sm:p-5 flex items-center justify-center font-sans">
      
      {toast && (
        <div className="fixed top-5 right-10 z-50 bg-[#1e2229] border border-[#e87348] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Outer Curved Container Styled Exact to Screenshot */}
      <div className="w-full max-w-[1400px] h-[92vh] bg-[#1e2229] rounded-[36px] shadow-2xl flex overflow-hidden border border-[#2c323d]/50">
        
        {/* ================= LEFT SLIM ICON SIDEBAR ================= */}
        <aside className="w-20 bg-[#17191e] flex flex-col items-center justify-between py-6 border-r border-[#262b35]/60 shrink-0">
          <div className="flex flex-col items-center gap-7">
            {/* Brand Cup Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#2a2f3a] flex items-center justify-center text-xl text-[#e87348] shadow-inner">
              ☕
            </div>

            {/* Nav Icons */}
            <div className="flex flex-col gap-6 text-slate-400">
              <button className="w-10 h-10 rounded-xl bg-[#e87348] text-white flex items-center justify-center shadow-lg shadow-[#e87348]/30">
                🏠
              </button>
              <button onClick={() => triggerNtfyAlert("FLOOR CALL", "Manager assistance requested at counter.")} className="hover:text-white transition">
                📄
              </button>
              <button onClick={handleFriendScan} className="hover:text-white transition" title="Scan Barcode">
                📷
              </button>
              <button className="hover:text-white transition">
                ❤️
              </button>
              <button className="hover:text-white transition">
                ⚙️
              </button>
            </div>
          </div>

          <div className="w-10 h-10 rounded-xl bg-[#262b35] flex items-center justify-center text-slate-400 text-sm">
            🚪
          </div>
        </aside>

        {/* ================= CENTER MAIN CATALOG & THERMAL OPS ================= */}
        <main className="flex-1 p-6 overflow-y-auto flex flex-col space-y-6">
          
          {/* Top Bar: Greeting + Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Welcome to Coffeehouse</h1>
              <p className="text-xs text-slate-400 mt-0.5">Choose the category • AIRS Retail Compliance Active</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search product or SKU..."
                  className="bg-[#17191e] border border-[#2c323d] text-xs text-slate-200 rounded-2xl px-4 py-2.5 pl-9 w-full sm:w-64 focus:outline-none focus:border-[#e87348]"
                />
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
              </div>
              
              <button
                onClick={handleFriendScan}
                disabled={isScanning}
                className="px-3 py-2 bg-[#2a2f3a] hover:bg-[#343b48] border border-[#3b4352] text-xs font-bold text-[#e87348] rounded-2xl whitespace-nowrap transition"
              >
                {isScanning ? "Scanning..." : "📷 Friend DroidCam"}
              </button>
            </div>
          </div>

          {/* Queue Rush Notification Pill */}
          {isRushAlert && (
            <div className="p-3 bg-rose-950/40 border border-rose-600/60 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs text-rose-300 font-bold">Queue Bottleneck: C1 ({counters.c1}) & C2 ({counters.c2}) congested!</span>
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

          {/* Category Cards Carousel (Row from screenshot) */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categories.map((cat, idx) => {
              const active = activeCategory === cat.label;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`w-24 h-28 rounded-2xl flex flex-col items-center justify-center gap-2 shrink-0 border transition ${
                    active
                      ? "bg-[#332420] border-[#e87348] text-white shadow-lg"
                      : "bg-[#17191e] border-[#262b35] text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${active ? "bg-[#e87348] text-white" : "bg-[#20252e]"}`}>
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-bold truncate px-1">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Catalog Section Header */}
          <div className="flex justify-between items-center pt-2">
            <h2 className="text-base font-black text-white">{activeCategory} menu</h2>
            <span className="text-xs font-mono text-slate-500">{PRODUCTS.length} items cataloged • {activeInStore} in store</span>
          </div>

          {/* Main 2-Column Catalog & Live Thermal Stream Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Product Card 1 (Detailed with Custom Controls matching Left Card) */}
            <div className="bg-[#17191e] border border-[#282e38] rounded-3xl p-4 flex flex-col justify-between space-y-4 shadow-md">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl bg-[#222731] flex items-center justify-center text-4xl shrink-0">
                  {selectedProduct.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-white">{selectedProduct.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{selectedProduct.sub}</p>
                  <div className="mt-2 text-base font-black text-white">${selectedProduct.price.toFixed(2)}</div>
                </div>
              </div>

              {/* Action Buttons styled like Sugar/Ice selectors */}
              <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-400">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase mb-1">Queue Sync</span>
                  <div className="flex gap-1">
                    <span className="px-2 py-1 bg-[#20252e] rounded-lg text-slate-300">C1: {counters.c1}</span>
                    <span className="px-2 py-1 bg-[#20252e] rounded-lg text-slate-300">C2: {counters.c2}</span>
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase mb-1">Floor Occupancy</span>
                  <div className="flex gap-1">
                    <span className="px-2 py-1 bg-[#20252e] rounded-lg text-emerald-400">In: {footfall.in}</span>
                    <span className="px-2 py-1 bg-[#20252e] rounded-lg text-rose-400">Out: {footfall.out}</span>
                  </div>
                </div>
              </div>

              {/* Terracotta Action Button */}
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

            {/* Right Card: Real-Time Phone Thermal Video Feed (Replaces Preview Card) */}
            <div className="bg-[#17191e] border border-[#282e38] rounded-3xl p-4 flex flex-col justify-between space-y-3 shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-white">Live Thermal Stream</h3>
                  <p className="text-[10px] font-mono text-emerald-400">HOG Human Tracking • DPDP Compliant</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden relative flex items-center justify-center border border-[#2e3440]">
                {tunnelBlobUrl ? (
                  <img src={tunnelBlobUrl} alt="Phone Thermal Feed" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-[#e87348] border-t-transparent rounded-full animate-spin mx-auto" />
                    <span className="text-[11px] font-mono text-slate-500 block">Connecting to phone camera stream...</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => triggerNtfyAlert("STORE AUDIT", "Real-time thermal sensor audit requested.")}
                className="w-full py-2.5 bg-[#252a34] hover:bg-[#2e3542] text-slate-200 text-xs font-bold rounded-2xl transition border border-[#343b48]"
              >
                View details & sensor log
              </button>
            </div>

          </div>

          {/* Bottom Secondary Product Rows (Matching the lower cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {PRODUCTS.slice(1, 3).map((item) => (
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
                    <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{item.sub}</p>
                    <span className="text-xs font-black text-white mt-0.5 block">${item.price.toFixed(2)}</span>
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
          
          {/* Top Admin Profile Card */}
          <div>
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
                onClick={() => triggerNtfyAlert("MANAGER ALERT", "Notice from Retailer Vision Dashboard.")}
                className="w-8 h-8 rounded-xl bg-[#222731] flex items-center justify-center text-slate-400 hover:text-white"
              >
                🔔
              </button>
            </div>

            {/* Bills Section Title */}
            <div className="flex justify-between items-center my-4">
              <h3 className="text-base font-black text-white">Bills</h3>
              <span className="text-[10px] font-mono text-slate-500">{Object.keys(cart).length} orders</span>
            </div>

            {/* Order Items List */}
            <div className="space-y-3 max-h-[36vh] overflow-y-auto pr-1">
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
                        <div className="font-bold text-white max-w-[120px] truncate">{item.name}</div>
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

                    <span className="font-black text-white font-mono">${(item.price * qty).toFixed(2)}</span>
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
                <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Discount</span>
                <span className="font-mono text-white">${discount.toFixed(2)}</span>
              </div>
              <div className="border-t border-dashed border-[#343b47] pt-2 flex justify-between text-sm font-black text-white">
                <span>Total</span>
                <span className="font-mono text-[#e87348]">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (subtotal === 0) {
                  notify("Bill is empty!");
                  return;
                }
                setCart({});
                notify(`✅ Order Completed! Invoiced: $${total.toFixed(2)}`);
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
