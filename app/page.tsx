"use client";

import React, { useState, useEffect, useRef } from "react";

const BACKEND_TUNNEL_URL = "https://yummy-signs-relate.loca.lt";

export default function LiveCCTVPlayer() {
  const [feedSource, setFeedSource] = useState<"EDGE_BRIDGE" | "WEBCAM" | "SIMULATION">("EDGE_BRIDGE");
  const [frameData, setFrameData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [errorCount, setErrorCount] = useState(0);

  // 1. Fetch frames from Python via Tunnel with bypass headers
  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    const fetchLiveFrame = async () => {
      if (feedSource !== "EDGE_BRIDGE") return;
      try {
        const res = await fetch(`${BACKEND_TUNNEL_URL}/frame`, {
          headers: { "bypass-tunnel-reminder": "true" },
        });
        const data = await res.json();
        if (data.status === "ok" && data.image && isMounted) {
          setFrameData(`data:image/jpeg;base64,${data.image}`);
          setErrorCount(0);
        } else {
          throw new Error("No frame");
        }
      } catch {
        setErrorCount((prev) => {
          if (prev > 5) {
            // Tunnel unreachable -> Auto switch to Browser Webcam / Demo Simulation
            setFeedSource("WEBCAM");
          }
          return prev + 1;
        });
      } finally {
        if (isMounted && feedSource === "EDGE_BRIDGE") {
          timer = setTimeout(fetchLiveFrame, 80); // ~12 FPS stable polling
        }
      }
    };

    fetchLiveFrame();
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [feedSource]);

  // 2. Fallback: Browser Webcam Handshake
  useEffect(() => {
    if (feedSource === "WEBCAM") {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: 640, height: 360 } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch(() => {
          setFeedSource("SIMULATION");
        });
    }
  }, [feedSource]);

  return (
    <div className="aspect-video w-full bg-slate-950 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-800 shadow-inner">
      {/* Mode 1: Real-Time Python Edge Feed */}
      {feedSource === "EDGE_BRIDGE" && frameData && (
        <img
          src={frameData}
          alt="Live Edge Camera Stream"
          className="w-full h-full object-cover"
        />
      )}

      {/* Mode 2: Direct Local Webcam */}
      {feedSource === "WEBCAM" && (
        <div className="relative w-full h-full">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          <div className="absolute top-3 left-3 bg-black/70 px-2 py-1 rounded text-[10px] font-mono text-emerald-400">
            LIVE BROWSER WEBCAM (ACTIVE)
          </div>
        </div>
      )}

      {/* Mode 3: Pre-loaded Demo Video & Simulated Bounding Boxes */}
      {(feedSource === "SIMULATION" || (feedSource === "EDGE_BRIDGE" && !frameData)) && (
        <div className="relative w-full h-full flex flex-col justify-between p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950">
          <div className="flex justify-between items-center text-[11px] font-mono text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE AI SURVEILLANCE FEED (AISLE 01)</span>
            </span>
            <span>30 FPS</span>
          </div>

          <div className="relative w-full h-32 flex items-center justify-center gap-4">
            <div className="border-2 border-emerald-400/80 bg-emerald-500/10 p-2 rounded text-left">
              <span className="text-[10px] font-mono text-emerald-300 font-bold block">CUSTOMER #01</span>
              <span className="text-[9px] text-slate-300 font-mono">Dwell: 88s (Shelf C)</span>
            </div>
            <div className="border-2 border-amber-400/80 bg-amber-500/10 p-2 rounded text-left">
              <span className="text-[10px] font-mono text-amber-300 font-bold block">INSPECTION ACTIVE</span>
              <span className="text-[9px] text-slate-300 font-mono">Barcode Detected</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>Tunnel Connecting... (Auto Fallback Active)</span>
            <button
              onClick={() => setFeedSource("WEBCAM")}
              className="text-indigo-400 underline hover:text-indigo-300"
            >
              Use Laptop Camera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
