"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const MANAGER_PHONE = "9472948984";
const NTFY_TOPIC = `retail-vision-${MANAGER_PHONE}`;
const BACKEND_TUNNEL_URL = "https://puny-lands-flow.loca.lt";

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

const CATEGORY_COLORS: Record<string, string> = {
  Snacks: "#f59e0b",
  Gadgets: "#6366f1",
  Dairy: "#38bdf8",
  Essentials: "#10b981",
  Lighting: "#fbbf24",
  Books: "#ec4899",
  Groceries: "#14b8a6",
  Electronics: "#8b5cf6",
  Beverages: "#f97316"
};

export default function ARISMasterOS() {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<"home" | "stock" | "dwell" | "billing">("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [dwellStreamBlob, setDwellStreamBlob] = useState<string | null>(null);
  const [streamConnected, setStreamConnected] = useState(false);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanMode, setScanMode] = useState<"REFILL" | "CHECKOUT">("CHECKOUT");
  const [isScanning, setIsScanning] = useState(false);

  // Dynamic Logical Footfall State
  const [footfall, setFootfall] = useState({ in: 94, out: 62 });
  const [lastEvent, setLastEvent] = useState<"IN" | "OUT" | null>(null);
  const activeInStore = Math.max(0, footfall.in - footfall.out);

  // Dynamic Live Counters State
  const [counters, setCounters] = useState({ c1: 3, c2: 4, c3Active: false });
  const lastAlertTimestamp = useRef<number>(0);
  const isQueueCritical = counters.c1 > 5 || counters.c2 > 5;

  const [skus, setSkus] = useState<SKUItem[]>(MASTER_SKUS);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Category-wise Continuous Live Sales
  const [categorySales, setCategorySales] = useState<Record<string, number>>({
    Snacks: 420,
    Gadgets: 1499,
    Dairy: 370,
    Essentials: 690,
    Lighting: 1000,
    Books: 447
  });

  const [insights, setInsights] = useState({
    person_detected: false,
    dwell_seconds: 0.0,
    zone: "Scanning Aisle...",
    active_sku: "None",
    intent_state: "Browsing",
    psychology_insight: "Live camera analyzing aisle movement...",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // 1. Natural In/Out Footfall Fluctuations + Synced Checkout Telemetry
  useEffect(() => {
    const footfallTimer = setInterval(() => {
      setFootfall(prev => {
        const rand = Math.random();
        if (rand > 0.40) {
          const nextIn = prev.in + 1;
          setLastEvent("IN");
          return { ...prev, in: nextIn };
        } else if (rand < 0.35 && (prev.in - prev.out) > 5) {
          const nextOut = prev.out + 1;
          setLastEvent("OUT");

          const categories = ["Snacks", "Dairy", "Essentials", "Beverages", "Books"];
          const pickedCat = categories[Math.floor(Math.random() * categories.length)];
          const addedVal = Math.floor(Math.random() * 80) + 20;

          setCategorySales(cs => ({
            ...cs,
            [pickedCat]: (cs[pickedCat] || 0) + addedVal
          }));

          return { ...prev, out: nextOut };
        }
        return prev;
      });
      setTimeout(() => setLastEvent(null), 1100);
    }, 2800);

    return () => clearInterval(footfallTimer);
  }, []);

  // 2. CONTINUOUS INDEPENDENT LIVE PIE CHART TELEMETRY ENGINE
  useEffect(() => {
    const pieStreamTimer = setInterval(() => {
      const pool = [
        { cat: "Snacks", val: 20 },
        { cat: "Dairy", val: 74 },
        { cat: "Essentials", val: 115 },
        { cat: "Groceries", val: 35 },
        { cat: "Snacks", val: 96 }
      ];
      const pick = pool[Math.floor(Math.random() * pool.length)];

      setCategorySales(prev => ({
        ...prev,
        [pick.cat]: (prev[pick.cat] || 0) + pick.val
      }));
    }, 4200);

    return () => clearInterval(pieStreamTimer);
  }, []);

  // 3. Dynamic Live Queue Balancing (>5 Alert Engine)
  useEffect(() => {
    const queueTimer = setInterval(() => {
      setCounters(prev => {
        const deltaC1 = Math.random() > 0.45 ? 1 : -1;
        const deltaC2 = Math.random() > 0.50 ? 1 : -1;
        const serviceRate = prev.c3Active ? 2 : 1;

        let nextC1 = Math.max(1, prev.c1 + (deltaC1 > 0 ? 1 : -serviceRate));
        let nextC2 = Math.max(1, prev.c2 + (deltaC2 > 0 ? 1 : -serviceRate));

        if (Math.random() > 0.70 && !prev.c3Active) {
          if (Math.random() > 0.5) nextC1 = Math.min(8, nextC1 + 2);
          else nextC2 = Math.min(8, nextC2 + 2);
        }

        const criticalNow = nextC1 > 5 || nextC2 > 5;
        const now = Date.now();

        if (criticalNow && !prev.c3Active && now - lastAlertTimestamp.current > 25000) {
          lastAlertTimestamp.current = now;
          playTone(300, "sawtooth", 0.4);
          setTimeout(() => playTone(220, "sawtooth", 0.45), 200);

          const alertMsg = `Counter queue exceeded safe limit of 5 persons! [C1: ${nextC1} in line, C2: ${nextC2} in line]. Deploy Counter 3 immediately!`;
          triggerNtfyAlert("AUTOMATED QUEUE CONGESTION ALERT (>5)", alertMsg);
        }

        return { ...prev, c1: nextC1, c2: nextC2 };
      });
    }, 3200);

    return () => clearInterval(queueTimer);
  }, []);

  // Poll Insights from Python Backend
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

  // Fetch Thermal Image Stream
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

    if (activeView === "dwell") {
      fetchStreamFrame();
    }

    return () => {
      active = false;
    };
  }, [activeView]);

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

  const startScannerModal = async (mode: "REFILL" | "CHECKOUT") => {
    setScanMode(mode);
    setScannerOpen(true);
    setIsScanning(true);
    playTone(600, "sine", 0.1);
    notify(`📷 [${mode} MODE] Phone DroidCam scanning... Aim barcode at phone.`);

    try {
      const res = await fetch(`${BACKEND_TUNNEL_URL}/scan-barcode`, {
        method: "POST",
        headers: { "bypass-tunnel-reminder": "true" }
      });
      const data = await res.json();

      if (data.status === "success" && data.barcode) {
        handleDetectedBarcode(data.barcode, mode);
      } else {
        playTone(220, "square", 0.25);
        notify("❌ Barcode not found. Hold item closer to phone camera.");
      }
    } catch {
      notify("❌ Backend offline. Ensure Python scan_bridge is active.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDetectedBarcode = (code: string, explicitMode?: "REFILL" | "CHECKOUT") => {
    const activeMode = explicitMode || scanMode;
    playTone(900, "sine", 0.2);
    const item = skus.find(s => s.barcode === code || s.id === code);

    if (item) {
      if (activeMode === "REFILL") {
        playTone(980, "sine", 0.25);
        setSkus(prev => prev.map(s => s.id === item.id ? { ...s, stock: s.capacity } : s));
        triggerNtfyAlert("SHELF LOT REFILLED", `Refill verified for ${item.name} (${item.slot}). Stock restored to ${item.capacity} units.`);
        notify(`✅ [REFILLED]: ${item.name} restored to full capacity!`);
      } else {
        playTone(850, "sine", 0.15);
        setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
        setSkus(prev => prev.map(s => s.id === item.id ? { ...s, stock: Math.max(0, s.stock - 1) } : s));

        setCategorySales(prev => ({
          ...prev,
          [item.category]: (prev[item.category] || 0) + item.price
        }));

        const remaining = item.stock - 1;
        notify(`✅ [SOLD]: Added ${item.name} to bill. Left: ${remaining}`);

        if (remaining / item.capacity < 0.7) {
          setTimeout(() => {
            triggerNtfyAlert("LOW STOCK AUTO-TRIGGER", `${item.name} dropped to ${remaining} units (<70%).`);
          }, 600);
        }
      }
      setTimeout(() => setScannerOpen(false), 800);
    } else {
      playTone(250, "square", 0.2);
      notify(`⚠️ Barcode: ${code} (Unregistered SKU)`);
    }
  };

  const addToCart = (id: string) => {
    playTone(750, "sine", 0.08);
    const item = skus.find(s => s.id === id);
    if (item) {
      setCategorySales(prev => ({
        ...prev,
        [item.category]: (prev[item.category] || 0) + item.price
      }));
    }
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

  // Direct File Download + Native Print
  const saveInvoiceAsPDF = () => {
    const totalAmount = Object.entries(cart).reduce((acc, [id, qty]) => {
      const item = skus.find(s => s.id === id);
      return acc + (item ? item.price * qty : 0);
    }, 0);

    if (totalAmount === 0) {
      notify("Cart is empty! Scan or add items first.");
      return;
    }

    playTone(950, "sine", 0.2);
    const invoiceId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const itemsRows = Object.entries(cart).map(([skuId, qty]) => {
      const item = skus.find(s => s.id === skuId);
      if (!item) return "";
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
            <strong style="font-size: 14px; color: #0f172a;">${item.name}</strong><br>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">SKU: ${item.id} | Slot: ${item.slot}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${qty}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${item.price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 900; color: #1e3a8a;">₹${(item.price * qty).toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const fullInvoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${invoiceId} - Official Retail Tax Invoice</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; color: #0f172a; max-width: 800px; margin: auto; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 18px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 26px; font-weight: 900; color: #1e3a8a; }
    .subhead { font-size: 11px; color: #64748b; margin-top: 4px; }
    .inv-details { text-align: right; }
    .inv-id { font-size: 18px; font-weight: 800; color: #2563eb; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background-color: #f8fafc; color: #475569; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
    .summary-card { margin-top: 30px; display: flex; justify-content: flex-end; }
    .summary-box { width: 280px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #475569; }
    .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: #1e3a8a; border-top: 2px solid #cbd5e1; padding-top: 10px; margin-top: 10px; }
    .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 18px; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; background: #dbeafe; color: #1e40af; font-size: 10px; font-weight: bold; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">ARIS RETAIL INTELLIGENCE</div>
      <div class="subhead">Automated Retail Invigilation System • Point of Sale</div>
      <span class="badge">PAID INVOICE</span>
    </div>
    <div class="inv-details">
      <div class="inv-id">${invoiceId}</div>
      <div class="subhead">Date: ${invoiceDate}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product Description</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <div class="summary-card">
    <div class="summary-box">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>₹${totalAmount.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Store Promo / Discount</span>
        <span style="color: #16a34a; font-weight: bold;">-₹0.00</span>
      </div>
      <div class="total-row">
        <span>Grand Total</span>
        <span>₹${totalAmount.toFixed(2)}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    Verified by ARIS POS Engine • Thank you for shopping with us!
  </div>
</body>
</html>`;

    try {
      const blob = new Blob([fullInvoiceHtml], { type: "text/html" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${invoiceId}-tax-invoice.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch {}

    const hiddenIframe = document.createElement("iframe");
    hiddenIframe.style.position = "fixed";
    hiddenIframe.style.bottom = "0";
    hiddenIframe.style.right = "0";
    hiddenIframe.style.width = "0";
    hiddenIframe.style.height = "0";
    hiddenIframe.style.border = "0";
    document.body.appendChild(hiddenIframe);

    const doc = hiddenIframe.contentWindow?.document || hiddenIframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(fullInvoiceHtml);
      doc.close();
      setTimeout(() => {
        hiddenIframe.contentWindow?.focus();
        hiddenIframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(hiddenIframe);
          setCart({});
          notify("✅ Invoice saved to disk & printed!");
        }, 1000);
      }, 300);
    }
  };

  const savePsychologicalReportAsPDF = () => {
    playTone(880, "sine", 0.15);
    const reportDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const reportHtml = `<!DOCTYPE html>
<html>
<head>
  <title>ARIS - Customer Psychological Dwell Audit</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #111; max-width: 800px; margin: auto; }
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
</html>`;

    try {
      const blob = new Blob([reportHtml], { type: "text/html" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `ARIS-Psychological-Audit.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch {}

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

  // --- MATHEMATICAL PIE CHART SLICE GENERATOR (DYNAMIC VECTOR SVG) ---
  const totalSalesRevenue = Object.values(categorySales).reduce((a, b) => a + b, 0);

  const renderPieSlices = () => {
    let cumulativeAngle = 0;
    const slices = Object.entries(categorySales).map(([cat, val]) => {
      const percentage = val / Math.max(1, totalSalesRevenue);
      const angle = percentage * 360;

      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle = endAngle;

      const x1 = 100 + 75 * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = 100 + 75 * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = 100 + 75 * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = 100 + 75 * Math.sin((Math.PI * (endAngle - 90)) / 180);

      const largeArc = angle > 180 ? 1 : 0;
      const pathData = `M 100 100 L ${x1} ${y1} A 75 75 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return {
        category: cat,
        value: val,
        percentage: Math.round(percentage * 100),
        color: CATEGORY_COLORS[cat] || "#6366f1",
        pathData
      };
    });

    return slices;
  };

  const pieSlices = renderPieSlices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090d16] via-[#0f172a] to-[#04060b] text-slate-100 font-sans p-3 lg:p-6 space-y-5 selection:bg-indigo-600">
      
      {toast && (
        <div className="fixed top-5 right-5 z-[999] bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl animate-bounce border border-indigo-400">
          {toast}
        </div>
      )}

      {/* 1. DIRECT BODY PORTAL HAMBURGER DRAWER */}
      {mounted && menuOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex">
          <div 
            onClick={() => setMenuOpen(false)} 
            className="fixed inset-0 bg-black/95 cursor-pointer backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.95)" }}
          />

          <div 
            style={{ backgroundColor: "#111827", opacity: 1, zIndex: 100000 }}
            className="relative top-16 left-4 w-80 h-auto border border-indigo-500/30 rounded-2xl p-5 shadow-[0_25px_60px_rgba(0,0,0,1)] space-y-3"
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
              <span className="text-xs font-mono uppercase text-indigo-400 font-black tracking-wider">ARIS Modules</span>
              <button 
                onClick={() => setMenuOpen(false)} 
                className="text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <button 
                onClick={() => { playTone(600, "sine", 0.05); setActiveView("home"); setMenuOpen(false); }} 
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-3 border ${activeView === "home" ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-900/50" : "text-slate-200 bg-[#1f2937] border-slate-700 hover:border-slate-600"}`}
              >
                <span className="text-base">🏠</span>
                <div>
                  <span className="block text-sm">Main Home Dashboard</span>
                  <span className="text-[10px] opacity-75 font-normal">Footfall, Counters & FIFO Alerts</span>
                </div>
              </button>

              <button 
                onClick={() => { playTone(600, "sine", 0.05); setActiveView("stock"); setMenuOpen(false); }} 
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-3 border ${activeView === "stock" ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-900/50" : "text-slate-200 bg-[#1f2937] border-slate-700 hover:border-slate-600"}`}
              >
                <span className="text-base">📦</span>
                <div>
                  <span className="block text-sm">1) Stock Shelf Data (50+ SKUs)</span>
                  <span className="text-[10px] opacity-75 font-normal">Live Catalog & &lt;70% Capacity Alerts</span>
                </div>
              </button>

              <button 
                onClick={() => { playTone(600, "sine", 0.05); setActiveView("dwell"); setMenuOpen(false); }} 
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-3 border ${activeView === "dwell" ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-900/50" : "text-slate-200 bg-[#1f2937] border-slate-700 hover:border-slate-600"}`}
              >
                <span className="text-base">🧠</span>
                <div>
                  <span className="block text-sm">2) Dwell Time & Psychology</span>
                  <span className="text-[10px] opacity-75 font-normal">Live Thermal Stream + PDF Export</span>
                </div>
              </button>

              <button 
                onClick={() => { playTone(600, "sine", 0.05); setActiveView("billing"); setMenuOpen(false); }} 
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-3 border ${activeView === "billing" ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-900/50" : "text-slate-200 bg-[#1f2937] border-slate-700 hover:border-slate-600"}`}
              >
                <span className="text-base">💳</span>
                <div>
                  <span className="block text-sm">3) Counter Boy Billing & Barcode</span>
                  <span className="text-[10px] opacity-75 font-normal">Refill / Checkout & Bill Invoice PDF</span>
                </div>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2. DIRECT BODY PORTAL BARCODE SCANNER */}
      {mounted && scannerOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            onClick={() => setScannerOpen(false)} 
            className="fixed inset-0 bg-black/95 cursor-pointer backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.95)" }}
          />

          <div 
            style={{ backgroundColor: "#111827", opacity: 1, zIndex: 100000 }}
            className="relative w-[94vw] max-w-lg border border-indigo-500/30 rounded-3xl p-6 shadow-[0_30px_90px_rgba(0,0,0,1)] space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${scanMode === "REFILL" ? "bg-amber-500" : "bg-emerald-500"} animate-ping`} />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  {scanMode === "REFILL" ? "Mode 1: Shelf Lot Restock Scanner" : "Mode 2: Product Sold Checkout Scanner"}
                </h3>
              </div>
              <button 
                onClick={() => setScannerOpen(false)} 
                className="text-slate-300 hover:text-white px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="w-full min-h-[260px] h-[260px] bg-black rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center flex-shrink-0 shadow-inner">
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                <div className="w-56 h-32 border-2 border-dashed border-emerald-400 rounded-2xl relative shadow-[0_0_20px_rgba(52,211,153,0.6)]">
                  <div className="w-full h-0.5 bg-rose-500 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_12px_rgba(244,63,94,1)]" />
                </div>
                <span className="text-[11px] font-mono text-emerald-300 mt-3 bg-black/90 px-3 py-1 rounded-full border border-emerald-500/50 shadow-md">
                  Align product barcode inside red laser
                </span>
              </div>

              <div className="flex flex-col items-center justify-center space-y-2 text-center p-4">
                <div className="w-9 h-9 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono text-slate-200 font-bold">
                  {isScanning ? "Waiting for Barcode on Phone DroidCam..." : "Phone Scanner Active"}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Target Link: 100.98.203.70:4747
                </span>
              </div>
            </div>

            <div className="bg-[#1f2937] p-3 rounded-2xl border border-slate-700 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold text-center">
                Quick Test SKU Triggers (Click to simulate instant scan):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleDetectedBarcode("8901491101837")}
                  className="p-2.5 rounded-xl bg-slate-800 border border-slate-600 hover:border-amber-500 text-slate-200 font-bold text-[11px] truncate active:scale-95 transition"
                >
                  🍪 Lays Chips (Shelf C-04)
                </button>
                <button
                  onClick={() => handleDetectedBarcode("8905650133059")}
                  className="p-2.5 rounded-xl bg-slate-800 border border-slate-600 hover:border-indigo-500 text-slate-200 font-bold text-[11px] truncate active:scale-95 transition"
                >
                  ⌚ boAt Watch (Shelf A-01)
                </button>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400">
              {scanMode === "REFILL" 
                ? "Lot will refill to full 100% capacity and push alert to Manager's phone."
                : "Product will deduct 1 unit from shelf inventory and add directly to bill."}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ================= TOP HEADER NAV ================= */}
      <nav className="bg-[#111827]/90 backdrop-blur-md border border-slate-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { playTone(500, "sine", 0.05); setMenuOpen(!menuOpen); }}
            className="w-10 h-10 rounded-xl bg-[#1f2937] border border-slate-700 hover:border-indigo-500 flex flex-col items-center justify-center gap-1 transition shadow-inner active:scale-95"
            title="Open Menu"
          >
            <span className="w-5 h-0.5 bg-indigo-400 rounded-full" />
            <span className="w-5 h-0.5 bg-indigo-400 rounded-full" />
            <span className="w-5 h-0.5 bg-indigo-400 rounded-full" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black text-xs shadow-md">
              A
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black tracking-wider text-white flex items-center gap-1.5">
                <span>ARIS</span>
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(AUTOMATED RETAIL INTELLIGENCE SYSTEM)</span>
              </h1>
              <p className="text-[9px] text-indigo-400/80 font-mono font-bold tracking-wider uppercase">
                DYNAMIC VISION INTELLIGENCE • AUTONOMOUS FOOTFALL & STOCK SYNCHRONIZATION
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= VIEW: MAIN HOMEPAGE DASHBOARD ================= */}
      {activeView === "home" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* LIVE FOOTFALL CARDS */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-2.5">
              <div className={`bg-[#111827]/90 backdrop-blur border ${lastEvent === "IN" ? "border-emerald-400 scale-[1.02] shadow-[0_0_15px_rgba(52,211,153,0.3)]" : "border-slate-800"} p-3.5 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-xl`}>
                <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-slate-400 font-mono">
                  <span>📹</span>
                  <span>CAM IN</span>
                </div>
                <div className="py-1">
                  <span className="text-2xl lg:text-3xl font-black text-white">{footfall.in}</span>
                  <span className="text-[9px] text-emerald-400 font-mono block font-bold mt-0.5">+5% vs. previous hr</span>
                </div>
                <span className="text-[8px] text-slate-500 font-mono block uppercase">Optical In-Gate Entry</span>
              </div>

              <div className={`bg-[#111827]/90 backdrop-blur border ${lastEvent === "OUT" ? "border-rose-400 scale-[1.02] shadow-[0_0_15px_rgba(244,63,94,0.3)]" : "border-slate-800"} p-3.5 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-xl`}>
                <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-slate-400 font-mono">
                  <span>🚪</span>
                  <span>EXIT OUT</span>
                </div>
                <div className="py-1">
                  <span className="text-2xl lg:text-3xl font-black text-white">{footfall.out}</span>
                  <span className="text-[9px] text-slate-400 font-mono block font-bold mt-0.5">±0% vs. previous hr</span>
                </div>
                <span className="text-[8px] text-slate-500 font-mono block uppercase">Checkout Gate Exit</span>
              </div>

              <div className="bg-[#111827]/90 backdrop-blur border border-indigo-500/30 p-3.5 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-xl">
                <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-indigo-400 font-mono">
                  <span>👤</span>
                  <span>ACTIVE</span>
                </div>
                <div className="py-1">
                  <span className="text-2xl lg:text-3xl font-black text-indigo-400">{activeInStore}</span>
                  <span className="text-[9px] text-indigo-300/80 font-mono block font-bold mt-0.5">In-Floor Zone</span>
                </div>
                <span className="text-[8px] text-indigo-400/60 font-mono block uppercase">Live Occupancy</span>
              </div>
            </div>

            {/* LIVE QUEUE COUNTERS CARD */}
            <div className="lg:col-span-7 bg-[#111827]/90 backdrop-blur border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Queue Monitoring & Live Alerts
                </h3>
                <span className="text-[10px] bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 px-2.5 py-0.5 rounded-lg font-bold font-mono">
                  Alerts & Manager Notification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-7 space-y-2.5">
                  <div className="bg-[#0b101d] p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 font-bold uppercase">Counter 1</span>
                      <span className="text-white font-mono font-bold">{counters.c1}/10 people</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${counters.c1 > 5 ? "bg-rose-500 animate-pulse" : "bg-amber-500"}`} 
                        style={{ width: `${Math.min(100, counters.c1 * 10)}%` }} 
                      />
                    </div>
                  </div>

                  <div className="bg-[#0b101d] p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 font-bold uppercase">Counter 2</span>
                      <span className="text-white font-mono font-bold">{counters.c2}/10 people</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${counters.c2 > 5 ? "bg-rose-500 animate-pulse" : "bg-indigo-500"}`} 
                        style={{ width: `${Math.min(100, counters.c2 * 10)}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-5 bg-[#0b101d] border border-slate-800 p-3 rounded-2xl flex flex-col justify-between space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-500 text-base animate-bounce">🚨</span>
                    <div>
                      <span className="text-[11px] font-bold text-white block uppercase tracking-wide">Counter Alert</span>
                      <span className="text-[9px] text-slate-400 font-mono">Auto-limit: &gt;5 in line</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        playTone(counters.c3Active ? 300 : 700, "sine", 0.1);
                        setCounters(prev => ({ ...prev, c3Active: !prev.c3Active }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition shadow whitespace-nowrap ${
                        counters.c3Active ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                      }`}
                    >
                      {counters.c3Active ? "Close C3" : "Open Counter 3"}
                    </button>

                    <button
                      onClick={() => triggerNtfyAlert(
                        "MANUAL COUNTER RUSH DISPATCH",
                        `Manual Override: Counter 1 (${counters.c1}) & Counter 2 (${counters.c2}) congested. Open Counter 3 immediately!`
                      )}
                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-xl shadow transition active:scale-95 truncate"
                      title="Notify Manager & Sound Alert"
                    >
                      🔔 Notify Manager
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* FIFO LOW STOCK ALERTS CARD */}
            <div className="lg:col-span-5 bg-[#111827]/90 backdrop-blur border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    FIFO Low Stock Alerts
                  </h3>
                  <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-lg font-bold">
                    {lowStockItems.length} SKUs Critical
                  </span>
                </div>

                <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
                  {lowStockItems.slice(0, 4).map((item, idx) => {
                    const ratio = Math.round((item.stock / item.capacity) * 100);
                    return (
                      <div key={item.id} className="p-2.5 bg-[#0b101d] border border-slate-800 rounded-xl flex items-center justify-between text-xs hover:border-slate-700 transition">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-slate-500 font-mono text-[10px]">({idx + 1})</span>
                          <span className="font-bold text-white truncate">{item.name}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">{item.slot}</span>
                          <span className="text-[10px] font-mono font-bold text-rose-400">{item.stock}/{item.capacity} ({ratio}%)</span>
                          
                          <button
                            onClick={() => {
                              triggerNtfyAlert(`LOW STOCK: ${item.slot}`, `${item.name} is down to ${item.stock} units (${ratio}%). Dispatch restock lot.`);
                            }}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] shadow transition active:scale-95"
                          >
                            🔔
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400">FIFO Restock Priority Active</span>
                <button
                  onClick={() => triggerNtfyAlert("FIFO BATCH RESTOCK DISPATCH", `Critical refill required for ${lowStockItems.length} items below 70% capacity.`)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 active:scale-95"
                >
                  <span>🚀</span>
                  <span>Push Bulk FIFO Alerts to Manager</span>
                </button>
              </div>
            </div>

            {/* LIVE SALES PIE CHART CARD */}
            <div className="lg:col-span-7 bg-[#111827]/90 backdrop-blur border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Live Daily Sales & Telemetry Breakdown
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Real-time category telemetry synced with optical checkout register</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-white">₹{totalSalesRevenue.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-6 flex justify-center items-center relative">
                  <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all duration-700">
                    {pieSlices.map((slice, idx) => (
                      <path
                        key={idx}
                        d={slice.pathData}
                        fill={slice.color}
                        stroke="#111827"
                        strokeWidth="3"
                        className="transition-all duration-700 hover:opacity-85 cursor-pointer"
                      >
                        <title>{`${slice.category}: ₹${slice.value} (${slice.percentage}%)`}</title>
                      </path>
                    ))}
                    <circle cx="100" cy="100" r="44" fill="#111827" stroke="#1f2937" strokeWidth="2" />
                    <text x="100" y="92" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="monospace">TOTAL REV</text>
                    <text x="100" y="108" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="monospace">₹{totalSalesRevenue}</text>
                    <text x="100" y="122" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">(Live)</text>
                  </svg>
                </div>

                <div className="sm:col-span-6 space-y-2 max-h-52 overflow-y-auto pr-1">
                  {pieSlices.map((item, index) => (
                    <div key={index} className="p-2 bg-[#0b101d] border border-slate-800 rounded-xl flex items-center justify-between text-xs hover:border-slate-700 transition">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-200 font-bold">{item.category} <span className="text-[10px] text-slate-400 font-mono">({item.percentage}%)</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, item.percentage * 2)}%`, backgroundColor: item.color }} />
                        </div>
                        <span className="font-mono text-white font-bold">₹{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= OPTION 1: STOCK SHELF DATA ================= */}
      {activeView === "stock" && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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
                className="bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs rounded-xl text-white w-full sm:w-48"
              />
              <button 
                onClick={() => { playTone(400, "sine", 0.05); setActiveView("home"); }} 
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl whitespace-nowrap"
              >
                ← Back to Home
              </button>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto max-h-[65vh]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b101d] text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="p-3.5">SKU ID & Description</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Shelf Slot</th>
                    <th className="p-3.5">Stock Left / Capacity</th>
                    <th className="p-3.5">Condition State</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {skus.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase())).map(item => {
                    const ratio = item.stock / item.capacity;
                    const isLow = ratio < 0.7;

                    return (
                      <tr key={item.id} className="hover:bg-[#1f2937] transition">
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
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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
            <div className="lg:col-span-7 bg-[#111827] border border-slate-800 p-4 rounded-2xl space-y-3">
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
              <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Customer Psychological Estimates</h3>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-indigo-950 text-indigo-300 font-bold border border-indigo-800">
                    {insights.dwell_seconds}s Dwell
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-[#0b101d] border border-slate-800 rounded-xl flex justify-between">
                    <span className="text-slate-400">Peak Stop Zone:</span>
                    <span className="font-bold text-white">{insights.zone}</span>
                  </div>
                  <div className="p-3 bg-[#0b101d] border border-slate-800 rounded-xl flex justify-between">
                    <span className="text-slate-400">Attracted By Offer / SKU:</span>
                    <span className="font-mono font-bold text-amber-400">{insights.active_sku}</span>
                  </div>
                  <div className="p-3 bg-[#0b101d] border border-slate-800 rounded-xl flex justify-between">
                    <span className="text-slate-400">Estimated Intent State:</span>
                    <span className="font-bold text-emerald-400">{insights.intent_state}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-gradient-to-r from-indigo-950/60 to-[#0b101d] border border-indigo-900/60 rounded-xl">
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
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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

          <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Manual SKU or Barcode input..."
                className="bg-[#0b101d] border border-slate-700 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-white w-full sm:w-60"
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
            <div className="lg:col-span-8 bg-[#111827] border border-slate-800 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">50+ SKUs Quick Select Catalog</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {skus.slice(0, 16).map(item => (
                  <div key={item.id} className="p-3 bg-[#0b101d] border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs">
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

            <div className="lg:col-span-4 bg-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
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

    </div>
  );
}
