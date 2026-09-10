"use client";

import React, { useEffect, useState } from "react";
import {
  Wifi,
  Cpu,
  Users,
  Clock,
  AlertTriangle,
  ShoppingBag
} from "lucide-react";

export default function Dashboard() {
  const [storeData, setStoreData] = useState<any>(null);
  const [wsStatus, setWsStatus] = useState<"CONNECTING" | "CONNECTED" | "OFFLINE">("CONNECTING");

  // Yahan apna Render wala link daalein (https ki jagah wss):
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://retail-backend-cdn8.onrender.com/ws/live-stream";

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => setWsStatus("CONNECTED");
    socket.onclose = () => setWsStatus("OFFLINE");
    socket.onerror = () => setWsStatus("OFFLINE");

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "INITIAL_HYDRATION") {
          setStoreData(message.data);
        } else if (message.type === "QUEUE_UPDATE") {
          setStoreData((prev: any) => ({ ...prev, counters: message.data.payload.counters }));
        } else if (message.type === "INVENTORY_HEALTH") {
          setStoreData((prev: any) => ({ ...prev, shelves: message.data.payload.shelves }));
        }
      } catch (err) {
        console.error("Failed to parse event:", err);
      }
    };

    return () => socket.close();
  }, [WS_URL]);

  if (!storeData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0B0F19] text-cyan-400 font-mono">
        Connecting to Edge Gateway ({wsStatus})...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans p-6 space-y-6">
      {/* 1. TOP BAR */}
      <header className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wide">EdgeRetail OS</h1>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
            Store #01 - Ground Floor
          </span>
        </div>

        {/* Edge Node Health */}
        <div className="flex items-center space-x-4 bg-[#131B2E] border border-slate-800 px-4 py-1.5 rounded-full text-xs font-mono">
          <span className="text-cyan-400 font-semibold">{storeData.node_status.device_id}</span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Cpu size={14} className="text-cyan-400" /> {storeData.node_status.fps} FPS
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Wifi size={14} className="text-emerald-400" /> {storeData.node_status.wifi_dbm} dBm
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">{storeData.node_status.status}</span>
        </div>
      </header>

      {/* 2. KPI STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131B2E] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400 font-mono">Active Footfall</p>
            <p className="text-3xl font-bold text-white mt-1">{storeData.kpi.active_footfall}</p>
            <span className="text-xs text-emerald-400">+8 in last 5 min</span>
          </div>
          <Users className="text-cyan-400" size={32} />
        </div>

        <div className="bg-[#131B2E] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400 font-mono">Today's In / Out</p>
            <p className="text-3xl font-bold text-white mt-1">
              {storeData.kpi.in_count} / {storeData.kpi.out_count}
            </p>
            <span className="text-xs text-slate-400">Net Flow +42</span>
          </div>
          <ShoppingBag className="text-cyan-400" size={32} />
        </div>

        <div className="bg-[#131B2E] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400 font-mono">Avg Dwell Time</p>
            <p className="text-3xl font-bold text-white mt-1">{storeData.kpi.avg_dwell_time}</p>
            <span className="text-xs text-emerald-400">Optimal Browsing</span>
          </div>
          <Clock className="text-cyan-400" size={32} />
        </div>

        <div className="bg-[#131B2E] border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400 font-mono">Restock Alerts</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{storeData.kpi.critical_alerts}</p>
            <span className="text-xs text-amber-400">Action required</span>
          </div>
          <AlertTriangle className="text-amber-400" size={32} />
        </div>
      </div>

      {/* 3. SPLIT VIEW: CHECKOUTS & SHELVES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue Intelligence */}
        <div className="lg:col-span-7 bg-[#131B2E] border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-white">Checkout Queue Dynamics</h2>
            <span className="text-xs text-cyan-400 font-mono uppercase tracking-wider">Predictive Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {storeData.counters.map((c: any) => (
              <div
                key={c.id}
                className={`p-4 rounded-lg border ${c.alert === "CRITICAL_CONGESTION"
                  ? "bg-red-950/20 border-red-500/60"
                  : "bg-[#182238] border-slate-700/60"
                  }`}
              >
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="font-bold text-slate-200">COUNTER {c.id}</span>
                  <span className={c.status === "ACTIVE" ? "text-emerald-400" : "text-slate-500"}>
                    {c.status}
                  </span>
                </div>
                <div className="text-2xl font-bold">{c.queue} <span className="text-xs font-normal text-slate-400">in queue</span></div>
                <div className="text-xs text-slate-400 mt-1 font-mono">Est. Wait: {c.wait_time}</div>

                {c.alert === "CRITICAL_CONGESTION" && (
                  <div className="mt-3 text-[11px] font-bold text-red-400 bg-red-900/40 p-1.5 rounded border border-red-700 text-center animate-pulse">
                    OPEN NEXT COUNTER
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Shelf Inventory Monitor */}
        <div className="lg:col-span-5 bg-[#131B2E] border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-white">Shelf Vision Compliance</h2>
            <span className="text-xs text-slate-400 font-mono">2 Monitored Feeds</span>
          </div>

          <div className="space-y-4">
            {storeData.shelves.map((shelf: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{shelf.aisle}</span>
                  <span className={`font-mono font-bold ${shelf.status === "OUT_OF_STOCK" ? "text-red-400" :
                    shelf.status === "LOW_STOCK" ? "text-amber-400" : "text-emerald-400"
                    }`}>
                    {shelf.status}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${shelf.status === "OUT_OF_STOCK" ? "bg-red-500" :
                      shelf.status === "LOW_STOCK" ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                    style={{ width: `${shelf.fill_pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>SKU: {shelf.sku}</span>
                  <span>{shelf.fill_pct}% remaining</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}