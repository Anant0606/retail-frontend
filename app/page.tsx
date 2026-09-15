"use client";

import React, { useState, useEffect, useMemo } from "react";

const MANAGER_PHONE = "9472948984";
const NTFY_TOPIC = `retail-vision-${MANAGER_PHONE}`;
const BACKEND_TUNNEL_URL = "https://yummy-signs-relate.loca.lt";

export default function RetailVisionUnifiedOS() {
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);
  const [queueModal, setQueueModal] = useState(false);
  const [warehouseAlerts, setWarehouseAlerts] = useState([
    { id: "SKU-3059", name: "boAt Wave Smartwatch", slot: "Shelf A-01", remaining: 4, status: "DISPATCH_PENDING" },
    { id: "SKU-1837", name: "Lay's Magic Masala", slot: "Shelf C-04", remaining: 2, status: "DISPATCH_PENDING" }
  ]);

  // Counter queues
  const [queues, setQueues] = useState({ c1: 5, c2: 4, c3Active: false });

  // Dwell Time Analytics (Time spent by customers in seconds)
  const [dwellAnalytics] = useState([
    { zone: "Aisle A (Wearables & Gadgets)", dwellSec: 142, trafficIntensity: "High" },
    { zone: "Aisle B (Lighting & Hardware)", dwellSec: 48, trafficIntensity: "Moderate" },
    { zone: "Aisle C (Snacks & Quick Pick)", dwellSec: 210, trafficIntensity: "Critical High" },
    { zone: "Aisle D (Books & Stationery)", dwellSec: 85, trafficIntensity: "Normal" },
  ]);

  // Check queue condition for auto popup & notification
  useEffect(() => {
    if (queues.c1 >= 5 || queues.c2 >= 5) {
      setQueueModal(true);
    }
  }, [queues]);

  const sendSilentPhoneNotification = async (title: string, details: string) => {
    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        body: details,
        headers: {
          "Title": title,
          "Priority": "urgent",
          "Tags": "warning,rotating_light",
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const resolveWarehouseRestock = (skuId: string) => {
    setWarehouseAlerts(prev => prev.filter(item => item.id !== skuId));
    sendSilentPhoneNotification("WAREHOUSE RESTOCK RESOLVED", `${skuId} has been successfully restocked on shelf.`);
  };

  const deployCounter3 = () => {
    setQueues(prev => ({
      c1: Math.max(2, prev.c1 - 2),
      c2: Math.max(2, prev.c2 - 2),
      c3Active: true
    }));
    setQueueModal(false);
    sendSilentPhoneNotification("COUNTER 3 DEPLOYED", "Counter 3 opened. Queue bottleneck resolved.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Queue Overload Emergency Modal */}
      {queueModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-600 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-bounce">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-base font-black text-rose-500 uppercase tracking-wide">Queue Threshold Reached (&ge; 5)</h3>
            </div>
            <p className="text-xs text-slate-300">
              Counter 1: <b>{queues.c1} persons</b> | Counter 2: <b>{queues.c2} persons</b>.
              Customer wait time is exceeding operational compliance.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setQueueModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold"
              >
                Dismiss
              </button>
              <button
                onClick={deployCounter3}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg"
              >
                Deploy Counter 3 Immediately
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Retailer Vision Edge OS</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono">
              v2.4 Production
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">RTSP/CCTV Live Ingestion • Dwell Tracking • Godown Dispatch Loop</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsLiveFeedActive(!isLiveFeedActive)}
            className={`text-xs px-3 py-2 rounded-xl font-semibold border transition ${
              isLiveFeedActive 
                ? "bg-emerald-950/60 border-emerald-700 text-emerald-300" 
                : "bg-amber-950/60 border-amber-700 text-amber-300"
            }`}
          >
            {isLiveFeedActive ? "● IP Camera Live (RTSP/MJPEG)" : "○ Preloaded Demo Mode Fallback"}
          </button>
        </div>
      </header>

      {/* Main Grid: Live Camera Stream + Dwell Heatmap Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Camera View with Fallback */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">CCTV Shelf Vision Stream</span>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Ingestion
            </span>
          </div>

          <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-800">
            {isLiveFeedActive ? (
              // Live MJPEG Camera Stream
              <img
                src={`${BACKEND_TUNNEL_URL}/video_feed`}
                alt="Live Camera Feed"
                className="w-full h-full object-cover"
                onError={() => setIsLiveFeedActive(false)} // Auto fallback if offline
              />
            ) : (
              // Offline Preloaded Demo Mode
              <div className="text-center p-6 space-y-2">
                <p className="text-sm font-bold text-amber-400">Preloaded Simulation Active</p>
                <p className="text-xs text-slate-500 max-w-sm">
                  Live IP Camera disconnected. Running simulated shelf compliance, dwell calculations, and counter tracking.
                </p>
                <button
                  onClick={() => setIsLiveFeedActive(true)}
                  className="mt-2 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-semibold"
                >
                  Retry Camera Connection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dwell Time & Customer Moving Pattern */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Customer Dwell Time Analysis</h3>
            <p className="text-[11px] text-slate-500">Duration customer lingered in front of each shelf</p>
          </div>

          <div className="space-y-3">
            {dwellAnalytics.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{item.zone}</span>
                  <span className="text-indigo-400">{item.dwellSec}s</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div 
                    className="bg-indigo-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, (item.dwellSec / 240) * 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Intensity: {item.trafficIntensity}</span>
                  <span>Heat signature active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Godown Dispatch & Warehouse Restock Loop */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Godown Dispatch & Replenishment Pipeline</h3>
            <p className="text-[11px] text-slate-500">Automated warehouse pull request when shelf items fall low</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-950 border border-amber-800 text-amber-300 rounded-lg">
            {warehouseAlerts.length} Action Items
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {warehouseAlerts.map(alert => (
            <div key={alert.id} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">{alert.name}</h4>
                <p className="text-[11px] text-slate-400">{alert.slot} • Remaining: {alert.remaining} units</p>
                <span className="text-[10px] text-amber-400 font-mono">Status: {alert.status}</span>
              </div>
              <button
                onClick={() => resolveWarehouseRestock(alert.id)}
                className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
              >
                Mark Restocked & Resolved
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
