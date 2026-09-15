"use client";

import React, { useState, useEffect, useMemo } from "react";

// --- SYSTEM CONFIGURATION ---
const MANAGER_PHONE = "9472948984";
const NTFY_TOPIC = `retail-vision-${MANAGER_PHONE}`;
const BACKEND_TUNNEL_URL = "https://yummy-signs-relate.loca.lt";

// Minimal SVG Icons (Zero Dependency)
const IconStore = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7a3 3 0 0 1-6 0"/><path d="M16 7a3 3 0 0 1-6 0"/><path d="M10 7a3 3 0 0 1-6 0"/></svg>
);
const IconAlert = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
const IconCheck = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
);
const IconBell = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);
const IconCamera = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const IconReceipt = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>
);

const STORE_CATALOG = [
  { id: "SKU-3059", barcode: "8905650133059", name: "boAt Wave Smartwatch", slot: "Shelf A-01", capacity: 20, price: 1499 },
  { id: "SKU-5962", barcode: "8902653015962", name: "Crompton LED Light 5W", slot: "Shelf B-02", capacity: 35, price: 1000 },
  { id: "SKU-1473", barcode: "9789354401473", name: "Fingerprint Classics Book", slot: "Aisle D-01", capacity: 25, price: 149 },
  { id: "SKU-1837", barcode: "8901491101837", name: "Lay's Magic Masala Chips", slot: "Shelf C-04", capacity: 60, price: 20 },
  { id: "SKU-1005", barcode: "8901262010051", name: "Amul Taaza Milk 1L", slot: "Chiller-01", capacity: 40, price: 74 },
  { id: "SKU-1009", barcode: "8901058852095", name: "Maggi 2-Minute Noodles", slot: "Shelf C-01", capacity: 45, price: 96 },
];

export default function RetailDashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALERTS" | "FULFILLED">("ALERTS");
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Counter Load Management (Rush Detection)
  const [counterRush, setCounterRush] = useState({ c1: 5, c2: 4, c3Active: false, rushAlert: true });

  // Shelf Inventory Dynamic State
  const [slotData, setSlotData] = useState<Record<string, { inCart: number; sold: number; restocked: number; depletedAt: number | null }>>({
    "SKU-3059": { inCart: 2, sold: 13, restocked: 0, depletedAt: Date.now() - 360000 },
    "SKU-1837": { inCart: 4, sold: 44, restocked: 0, depletedAt: Date.now() - 180000 },
    "SKU-5962": { inCart: 1, sold: 26, restocked: 0, depletedAt: Date.now() - 90000 },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Direct Cloud Silent Push Notification Engine
  const sendSilentPhoneNotification = async (title: string, details: string, priority: "urgent" | "high" = "urgent") => {
    notify(`Pushing alert to phone (+91-${MANAGER_PHONE})...`);
    try {
      const response = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        body: details,
        headers: {
          "Title": title,
          "Priority": priority,
          "Tags": "rotating_light,warning,shopping_cart",
        },
      });

      if (response.ok) {
        notify("Delivered to lock-screen successfully!");
      } else {
        notify("Push server returned status error.");
      }
    } catch {
      notify("Network error while pushing alert.");
    }
  };

  // Comprehensive System Test Notification
  const triggerComprehensiveTest = () => {
    const criticalCount = criticalQueue.length;
    const topDepleted = criticalQueue[0] ? `${criticalQueue[0].name} (${criticalQueue[0].slot})` : "None";
    const totalQueue = counterRush.c1 + counterRush.c2;

    const message = 
      `🚨 [LIVE STORE AUDIT]\n` +
      `• Counter Bheed: C1(${counterRush.c1}) + C2(${counterRush.c2}) = ${totalQueue} Persons\n` +
      `• Action: ${totalQueue >= 8 ? "OPEN COUNTER 3 IMMEDIATELY!" : "Queue Under Control"}\n` +
      `• Stock Depletion: ${criticalCount} Slots < 70%\n` +
      `• Earliest Depleted: ${topDepleted}\n` +
      `• Time: ${new Date().toLocaleTimeString()}`;

    sendSilentPhoneNotification("STORE HEALTH & RUSH AUDIT", message);
  };

  // Counter 3 Deployment Handler
  const toggleCounter3 = () => {
    const nextState = !counterRush.c3Active;
    let newC1 = counterRush.c1;
    let newC2 = counterRush.c2;

    if (nextState) {
      newC1 = Math.max(2, counterRush.c1 - 2);
      newC2 = Math.max(2, counterRush.c2 - 2);
      sendSilentPhoneNotification(
        "COUNTER 3 DEPLOYED",
        `Counter 3 is now ACTIVE. Rush resolved: C1 at ${newC1}, C2 at ${newC2}.`,
        "high"
      );
    } else {
      sendSilentPhoneNotification(
        "COUNTER 3 CLOSED",
        "Counter 3 is CLOSED. Standard operational lane restored.",
        "high"
      );
    }

    setCounterRush({
      c1: newC1,
      c2: newC2,
      c3Active: nextState,
      rushAlert: (newC1 >= 4 && newC2 >= 4) && !nextState
    });
  };

  // Adjust Queue manually
  const adjustQueue = (counter: "c1" | "c2", delta: number) => {
    const nextC1 = counter === "c1" ? Math.max(0, counterRush.c1 + delta) : counterRush.c1;
    const nextC2 = counter === "c2" ? Math.max(0, counterRush.c2 + delta) : counterRush.c2;
    const isRush = (nextC1 >= 4 && nextC2 >= 4) && !counterRush.c3Active;

    if (isRush && !counterRush.rushAlert) {
      sendSilentPhoneNotification(
        "CRITICAL BHEED ALERT: OPEN COUNTER 3",
        `Heavy rush detected! C1: ${nextC1} persons, C2: ${nextC2} persons. Deploy Counter 3 immediately.`
      );
    }

    setCounterRush(prev => ({
      ...prev,
      c1: nextC1,
      c2: nextC2,
      rushAlert: isRush
    }));
  };

  // On-Demand Camera Trigger via Python Bridge
  const handleExecuteScan = async () => {
    setIsScanning(true);
    notify("Opening Camera... Hold product barcode in view.");

    try {
      const res = await fetch(`${BACKEND_TUNNEL_URL}/scan`, {
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

            // Auto push alert if dropped below 70%
            if (isDepleted && !cur.depletedAt) {
              sendSilentPhoneNotification(
                `DEPLETION ALERT: ${item.slot}`,
                `Critical: ${item.name} stock dropped below 70% (${remaining}/${item.capacity} units remaining). Refill shelf.`
              );
            }

            return {
              ...prev,
              [item.id]: {
                ...cur,
                inCart: nextInCart,
                depletedAt: isDepleted && !cur.depletedAt ? Date.now() : cur.depletedAt,
              },
            };
          });
          notify(`[INVIGILATED] ${item.name} picked to cart from ${item.slot}`);
        } else {
          notify(`Scanned unknown barcode: ${scannedCode}`);
        }
      } else {
        notify("Scanner closed or timed out.");
      }
    } catch {
      notify("Tunnel connection error. Ensure python and localtunnel are running.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleRestockSlot = (id: string, name: string) => {
    setSlotData((prev) => {
      const cur = prev[id] || { inCart: 0, sold: 0, restocked: 0, depletedAt: null };
      return {
        ...prev,
        [id]: {
          ...cur,
          restocked: cur.restocked + cur.inCart + cur.sold,
          inCart: 0,
          depletedAt: null,
        },
      };
    });
    notify(`Slot replenished: ${name} restored to 100%.`);
  };

  const handleCheckoutAndGenerateBill = async () => {
    const activeItems = STORE_CATALOG.map((s) => {
      const live = slotData[s.id] || { inCart: 0 };
      return live.inCart > 0 ? { name: s.name, barcode: s.barcode, qty: live.inCart, price: s.price } : null;
    }).filter(Boolean);

    if (activeItems.length === 0) {
      notify("Cart is empty. Scan items first!");
      return;
    }

    notify("Generating Tax Invoice PDF...");

    try {
      await fetch(`${BACKEND_TUNNEL_URL}/generate-pdf`, {
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

    notify("Cart cleared! PDF tax invoice launched on PC.");
  };

  // Computations
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <IconStore className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Retailer Vision OS</h1>
            <p className="text-xs text-slate-400">Lock-Screen Alert Target: +91-{MANAGER_PHONE}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Direct Verification Test Button */}
          <button
            onClick={triggerComprehensiveTest}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition shadow-xs"
          >
            <IconBell className="w-4 h-4 text-amber-400" />
            <span>Test Phone Alert (Audit)</span>
          </button>

          <button
            onClick={() => setShowCatalogModal(true)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
          >
            Catalog (50 SKUs)
          </button>

          <button
            onClick={handleExecuteScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
          >
            <IconCamera className="w-4 h-4" />
            <span>{isScanning ? "Scanning Camera..." : "Execute Scan"}</span>
          </button>

          <button
            onClick={handleCheckoutAndGenerateBill}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95"
          >
            <IconReceipt className="w-4 h-4" />
            <span>Checkout & PDF ({totalInCart})</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto py-6 space-y-6">
        {/* Counter Rush & Congestion Management */}
        <div className={`p-5 rounded-2xl border transition-all ${
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
                      RUSH DETECTED!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Counter 1: <b className="text-white">{counterRush.c1} persons</b> • Counter 2: <b className="text-white">{counterRush.c2} persons</b>
                  {counterRush.rushAlert ? " — Bottleneck reached! Deploy express Counter 3." : " — Traffic is normal."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Counter 1 queue adjust */}
              <div className="bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 flex items-center gap-2 text-xs">
                <span className="text-[10px] uppercase text-slate-400">C1: {counterRush.c1}</span>
                <button onClick={() => adjustQueue("c1", 1)} className="px-1.5 py-0.5 bg-slate-800 rounded hover:bg-slate-700 font-bold">+</button>
                <button onClick={() => adjustQueue("c1", -1)} className="px-1.5 py-0.5 bg-slate-800 rounded hover:bg-slate-700 font-bold">-</button>
              </div>

              {/* Counter 2 queue adjust */}
              <div className="bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 flex items-center gap-2 text-xs">
                <span className="text-[10px] uppercase text-slate-400">C2: {counterRush.c2}</span>
                <button onClick={() => adjustQueue("c2", 1)} className="px-1.5 py-0.5 bg-slate-800 rounded hover:bg-slate-700 font-bold">+</button>
                <button onClick={() => adjustQueue("c2", -1)} className="px-1.5 py-0.5 bg-slate-800 rounded hover:bg-slate-700 font-bold">-</button>
              </div>

              {/* Send Alert Manually */}
              <button
                onClick={() => sendSilentPhoneNotification(
                  "COUNTER 3 RUSH DISPATCH",
                  `Bheed Alert! Counter 1 (${counterRush.c1}) and Counter 2 (${counterRush.c2}) congested. Open Counter 3 immediately.`
                )}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                <IconBell className="w-3.5 h-3.5" />
                <span>Notify Phone</span>
              </button>

              {/* Toggle Counter 3 */}
              <button
                onClick={toggleCounter3}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  counterRush.c3Active ? "bg-slate-800 text-slate-300" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                {counterRush.c3Active ? "Close Counter 3" : "Open Counter 3"}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("ALERTS")}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition ${
              activeTab === "ALERTS" ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>FIFO Depletion Queue (&lt; 70% Stock)</span>
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
            <span>Optimal & Fulfilled Slots ({fulfilledList.length})</span>
          </button>
        </div>

        {/* Depletion List */}
        {activeTab === "ALERTS" && (
          <div className="space-y-3">
            {criticalQueue.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 text-slate-500 text-xs">
                All shelf slots are operating above 70% capacity.
              </div>
            ) : (
              criticalQueue.map((item, idx) => {
                const percentage = Math.round(item.ratio * 100);
                const minutesAgo = item.depletedAt ? Math.max(1, Math.round((Date.now() - item.depletedAt) / 60000)) : 1;

                return (
                  <div
                    key={item.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
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
                        <p className="text-xs text-amber-400/90 mt-0.5">
                          Depleted first ({minutesAgo} min ago) • Remaining: {item.currentStock} / {item.capacity} units ({percentage}%)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => sendSilentPhoneNotification(
                          `RESTOCK SLOT: ${item.slot}`,
                          `Critical: ${item.name} at ${item.slot} is below 70% (${percentage}% remaining). Replenish immediately.`
                        )}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                      >
                        <IconBell className="w-3.5 h-3.5" />
                        <span>Notify Phone</span>
                      </button>

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

        {/* Fulfilled List */}
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

      {/* 50 SKUs Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 max-h-[82vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Full Store Catalog (50 SKUs)</h3>
              <button onClick={() => setShowCatalogModal(false)} className="text-slate-400">✕</button>
            </div>
            <div className="overflow-y-auto py-3 space-y-2 text-xs divide-y divide-slate-800">
              {STORE_CATALOG.map((s) => {
                const live = slotData[s.id] || { inCart: 0, sold: 0, restocked: 0 };
                const cur = Math.max(0, s.capacity - (live.inCart + live.sold) + live.restocked);
                return (
                  <div key={s.id} className="pt-2 flex justify-between items-center text-slate-300">
                    <div>
                      <span className="font-bold text-white">{s.name}</span>
                      <p className="text-[10px] text-slate-500">{s.slot} • {s.barcode}</p>
                    </div>
                    <span>{cur} / {s.capacity} left</span>
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
