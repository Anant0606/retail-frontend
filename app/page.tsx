"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

// --- SYSTEM & ALERT CONFIGURATION ---
const MANAGER_PHONE = "9472948984";
const NTFY_TOPIC = `retail-vision-${MANAGER_PHONE}`;
const BACKEND_TUNNEL_URL = "https://yummy-signs-relate.loca.lt";

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

const IconUsers = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconAlert = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconBell = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconPackage = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

const IconTrending = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const IconShield = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconBarcode = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5v14" />
    <path d="M8 5v14" />
    <path d="M12 5v14" />
    <path d="M17 5v14" />
    <path d="M21 5v14" />
  </svg>
);

const IconVolume = ({ active }: { active: boolean }) => (
  active ? (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  )
);

const IconCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconSparkles = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </svg>
);

// --- 50 Verified Retail SKUs with Authentic Barcodes & Shelf Slots ---
const INITIAL_50_SKUS = [
  { id: "SKU-3059", barcode: "8905650133059", name: "boAt Wave Smartwatch (Classic Blue)", category: "Electronics", slot: "Shelf A-01", capacity: 20, price: 1499 },
  { id: "SKU-5962", barcode: "8902653015962", name: "Crompton LED Bulb 5W Cool White", category: "Lighting", slot: "Shelf B-02", capacity: 35, price: 1000 },
  { id: "SKU-1473", barcode: "9789354401473", name: "Fingerprint Classics: Autobiography", category: "Books", slot: "Aisle D-01", capacity: 25, price: 149 },
  { id: "SKU-1837", barcode: "8901491101837", name: "Lay's Magic Masala Potato Chips 50g", category: "Snacks", slot: "Shelf C-04", capacity: 60, price: 20 },
  { id: "SKU-1005", barcode: "8901262010051", name: "Amul Taaza Homogenised Milk 1L", category: "Groceries", slot: "Chiller-01", capacity: 40, price: 74 },
  { id: "SKU-1006", barcode: "8901030010062", name: "Tata Salt Vacuum Evaporated 1kg", category: "Groceries", slot: "Aisle A-03", capacity: 50, price: 28 },
  { id: "SKU-1007", barcode: "8906007280073", name: "Fortune Sunlite Refined Oil 1L", category: "Groceries", slot: "Aisle A-04", capacity: 30, price: 145 },
  { id: "SKU-1008", barcode: "8901725181084", name: "Aashirvaad Shudh Chakki Atta 5kg", category: "Groceries", slot: "Aisle A-05", capacity: 25, price: 265 },
  { id: "SKU-1009", barcode: "8901058852095", name: "Nestle Maggi 2-Minute Noodles 420g", category: "Groceries", slot: "Shelf C-01", capacity: 45, price: 96 },
  { id: "SKU-1010", barcode: "8901719101108", name: "Parle-G Gold Biscuits 1kg", category: "Snacks", slot: "Shelf C-02", capacity: 50, price: 120 },
  { id: "SKU-1011", barcode: "8901063010111", name: "Britannia Good Day Butter 200g", category: "Snacks", slot: "Shelf C-03", capacity: 40, price: 45 },
  { id: "SKU-1012", barcode: "7622201431122", name: "Cadbury Dairy Milk Silk 150g", category: "Snacks", slot: "Chiller-02", capacity: 35, price: 175 },
  { id: "SKU-1013", barcode: "8904063210135", name: "Haldiram's Bhujia Sev 400g", category: "Snacks", slot: "Shelf C-05", capacity: 30, price: 130 },
  { id: "SKU-1014", barcode: "8901491501149", name: "Kurkure Masala Munch 85g", category: "Snacks", slot: "Shelf C-06", capacity: 50, price: 20 },
  { id: "SKU-1015", barcode: "5449000000996", name: "Coca-Cola Original 750ml", category: "Beverages", slot: "Chiller-03", capacity: 40, price: 40 },
  { id: "SKU-1016", barcode: "8902080000163", name: "Pepsi Cold Drink Can 300ml", category: "Beverages", slot: "Chiller-04", capacity: 35, price: 35 },
  { id: "SKU-1017", barcode: "9002490100170", name: "Red Bull Energy Drink 250ml", category: "Beverages", slot: "Chiller-05", capacity: 30, price: 125 },
  { id: "SKU-1018", barcode: "8901491100182", name: "Tropicana 100% Orange Juice 1L", category: "Beverages", slot: "Chiller-06", capacity: 25, price: 140 },
  { id: "SKU-1019", barcode: "8901058860199", name: "Nescafe Classic Instant Coffee 50g", category: "Beverages", slot: "Shelf B-04", capacity: 30, price: 190 },
  { id: "SKU-1020", barcode: "8901030383204", name: "Tata Tea Premium 500g", category: "Beverages", slot: "Shelf B-05", capacity: 35, price: 260 },
  { id: "SKU-1021", barcode: "8901314010213", name: "Colgate MaxFresh Toothpaste 150g", category: "Personal Care", slot: "Shelf D-01", capacity: 40, price: 110 },
  { id: "SKU-1022", barcode: "8901396144224", name: "Dettol Original Bath Soap (3+1)", category: "Personal Care", slot: "Shelf D-02", capacity: 30, price: 180 },
  { id: "SKU-1023", barcode: "4902430734233", name: "Head & Shoulders Shampoo 340ml", category: "Personal Care", slot: "Shelf D-03", capacity: 25, price: 299 },
  { id: "SKU-1024", barcode: "4005808801244", name: "Nivea Soft Moisturizing Cream 100ml", category: "Personal Care", slot: "Shelf D-04", capacity: 30, price: 160 },
  { id: "SKU-1025", barcode: "4902430604253", name: "Gillette Mach 3 Razor", category: "Personal Care", slot: "Shelf D-05", capacity: 20, price: 350 },
  { id: "SKU-1026", barcode: "8901030707269", name: "Surf Excel Easy Wash Detergent 1kg", category: "Household", slot: "Aisle E-01", capacity: 35, price: 145 },
  { id: "SKU-1027", barcode: "8901030045279", name: "Vim Dishwash Gel Lemon 500ml", category: "Household", slot: "Aisle E-02", capacity: 40, price: 115 },
  { id: "SKU-1028", barcode: "8901396328280", name: "Harpic Power Plus Toilet Cleaner 1L", category: "Household", slot: "Aisle E-03", capacity: 30, price: 215 },
  { id: "SKU-1029", barcode: "8901396349292", name: "Lizol Surface Cleaner Citrus 1L", category: "Household", slot: "Aisle E-04", capacity: 25, price: 220 },
  { id: "SKU-1030", barcode: "8901207010304", name: "Odonil Room Spray Jasmine 220ml", category: "Household", slot: "Aisle E-05", capacity: 30, price: 155 },
  { id: "SKU-1031", barcode: "8718696578315", name: "Philips 9W LED Eco Bulb", category: "Lighting", slot: "Shelf B-01", capacity: 40, price: 120 },
  { id: "SKU-1032", barcode: "8904239820323", name: "Syska Smart Wi-Fi 7W Bulb", category: "Lighting", slot: "Shelf B-03", capacity: 15, price: 499 },
  { id: "SKU-1033", barcode: "8901030612334", name: "Wipro High-Beam Emergency Light", category: "Lighting", slot: "Shelf B-06", capacity: 15, price: 650 },
  { id: "SKU-1034", barcode: "8901762014349", name: "Havells Extension Cord 4-Way 2m", category: "Electronics", slot: "Shelf A-02", capacity: 20, price: 380 },
  { id: "SKU-1035", barcode: "8904130835358", name: "boAt BassHeads 100 Wired Earphones", category: "Electronics", slot: "Shelf A-03", capacity: 25, price: 399 },
  { id: "SKU-1036", barcode: "8904230810361", name: "Portronics 20W Fast Charger Adapter", category: "Electronics", slot: "Shelf A-04", capacity: 25, price: 499 },
  { id: "SKU-1037", barcode: "0619659102377", name: "SanDisk 64GB Ultra Flash Drive", category: "Electronics", slot: "Shelf A-05", capacity: 30, price: 449 },
  { id: "SKU-1038", barcode: "5000394018389", name: "Duracell Ultra AA Alkaline (Pack 4)", category: "Electronics", slot: "Shelf A-06", capacity: 50, price: 170 },
  { id: "SKU-1039", barcode: "8901725064394", name: "Classmate Notebook Spiral 300 Pgs", category: "Stationery", slot: "Shelf F-01", capacity: 35, price: 130 },
  { id: "SKU-1040", barcode: "8901198000407", name: "Parker Vector Rollerball Pen", category: "Stationery", slot: "Shelf F-02", capacity: 20, price: 290 },
  { id: "SKU-1041", barcode: "8901425026410", name: "Doms Neon Graphite Pencils Pack 10", category: "Stationery", slot: "Shelf F-03", capacity: 40, price: 60 },
  { id: "SKU-1042", barcode: "8901860010425", name: "Fevicol MR Adhesive Squeeze 100g", category: "Stationery", slot: "Shelf F-04", capacity: 45, price: 45 },
  { id: "SKU-1043", barcode: "8901198104433", name: "Cello Maxriter Ball Pen Pack 5", category: "Stationery", slot: "Shelf F-05", capacity: 50, price: 50 },
  { id: "SKU-1044", barcode: "9781847941831", name: "Atomic Habits - James Clear", category: "Books", slot: "Aisle D-02", capacity: 15, price: 499 },
  { id: "SKU-1045", barcode: "9789390166268", name: "The Psychology of Money - M. Housel", category: "Books", slot: "Aisle D-03", capacity: 15, price: 350 },
  { id: "SKU-1046", barcode: "9781786330895", name: "Ikigai: Japanese Secret to Long Life", category: "Books", slot: "Aisle D-04", capacity: 18, price: 399 },
  { id: "SKU-1047", barcode: "9781612680194", name: "Rich Dad Poor Dad - R. Kiyosaki", category: "Books", slot: "Aisle D-05", capacity: 20, price: 299 },
  { id: "SKU-1048", barcode: "4549526611484", name: "Casio FX-991CW Scientific Calculator", category: "Electronics", slot: "Shelf A-07", capacity: 10, price: 1495 },
  { id: "SKU-1049", barcode: "8901030049499", name: "Milton Thermosteel 1000ml Flask", category: "Household", slot: "Aisle E-06", capacity: 15, price: 890 },
  { id: "SKU-1050", barcode: "8906023281507", name: "Pigeon Handy Chopper 3 Blades", category: "Household", slot: "Aisle E-07", capacity: 25, price: 249 },
];

export default function RetailStudioDashboard() {
  const [mounted, setMounted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Barcode & On-Demand Camera States
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanMode, setScanMode] = useState<"PICK" | "RETURN">("PICK");
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Counter Load Management State
  const [counterState, setCounterState] = useState({
    c1Queue: 5,
    c2Queue: 4,
    c3Active: false,
    rushAlert: true,
  });

  // Store Footfall
  const [footfall, setFootfall] = useState({ in: 54, out: 32 });

  // 50 SKU Dynamic State (inCart: Invigilated | sold: POS Cleared | restocked: Slot Return | depletedAt: FIFO Track)
  const [productStates, setProductStates] = useState<Record<string, { inCart: number; sold: number; restocked: number; depletedAt: number | null }>>({
    "SKU-3059": { inCart: 3, sold: 12, restocked: 0, depletedAt: Date.now() - 360000 },
    "SKU-5962": { inCart: 2, sold: 24, restocked: 0, depletedAt: Date.now() - 180000 },
    "SKU-1473": { inCart: 1, sold: 10, restocked: 0, depletedAt: null },
    "SKU-1837": { inCart: 5, sold: 45, restocked: 0, depletedAt: Date.now() - 90000 },
    "SKU-1005": { inCart: 2, sold: 26, restocked: 0, depletedAt: null },
  });

  const [recentEvents, setRecentEvents] = useState([
    { id: 1, text: `Manager lock-screen dispatch active (+91-${MANAGER_PHONE})`, time: "Just now", type: "system" },
    { id: 2, text: "Counter 1 & 2 rush alert active (9 in queue)", time: "1m ago", type: "alert" },
    { id: 3, text: "boAt Wave picked (Barcode: 8905650133059)", time: "2m ago", type: "pick" },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Web Audio Synthesizer
  const triggerAudio = (type: "pick" | "return" | "alert" | "rush" | "checkout") => {
    if (typeof window === "undefined" || !audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "pick") {
        osc.frequency.setValueAtTime(820, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "return") {
        osc.frequency.setValueAtTime(460, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === "rush" || type === "alert") {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      } else if (type === "checkout") {
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.setValueAtTime(780, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio fallback
    }
  };

  // --- Silent Lock-Screen Push Alert via ntfy ---
  const sendSilentPhoneNotification = async (title: string, details: string, priority: "urgent" | "high" = "urgent") => {
    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        body: details,
        headers: {
          "Title": title,
          "Priority": priority,
          "Tags": "rotating_light,warning,shopping_cart",
        },
      });
      setRecentEvents(prev => [
        { id: Date.now(), text: `Silent Phone Notification Pushed: "${title}"`, time: "Just now", type: "system" },
        ...prev.slice(0, 3)
      ]);
    } catch {
      console.warn("Direct push failed to dispatch.");
    }
  };

  // Comprehensive Live Store Audit Test Trigger
  const triggerComprehensiveTest = () => {
    triggerAudio("rush");
    const totalQueue = counterState.c1Queue + counterState.c2Queue;
    const depletedItems = catalogWithCalculations.filter(c => c.ratio < 0.7);
    const topDepleted = depletedItems[0] ? `${depletedItems[0].name} (${depletedItems[0].slot})` : "None";

    const auditMessage = 
      `🚨 [RETAILER VISION STORE AUDIT]\n` +
      `• Counter Bheed: C1(${counterState.c1Queue}) + C2(${counterState.c2Queue}) = ${totalQueue} Persons\n` +
      `• Rush Status: ${totalQueue >= 8 ? "OPEN COUNTER 3 IMMEDIATELY!" : "Queue Normal"}\n` +
      `• Stock Depletion: ${depletedItems.length} SKUs below 70%\n` +
      `• Priority #1 Depleted: ${topDepleted}\n` +
      `• Time: ${new Date().toLocaleTimeString()}`;

    sendSilentPhoneNotification("STORE HEALTH & RUSH AUDIT", auditMessage);
  };

  const evaluateCounterRush = (c1: number, c2: number, c3Active: boolean) => {
    const isRush = (c1 >= 4 && c2 >= 4) && !c3Active;
    if (isRush && !counterState.rushAlert) {
      triggerAudio("rush");
      sendSilentPhoneNotification(
        "BHEED ALERT: OPEN COUNTER 3",
        `Heavy congestion detected! C1: ${c1} customers, C2: ${c2} customers. Deploy Counter 3 immediately.`
      );
    }
    return isRush;
  };

  const toggleCounter3 = () => {
    const nextState = !counterState.c3Active;
    let newC1 = counterState.c1Queue;
    let newC2 = counterState.c2Queue;

    if (nextState) {
      newC1 = Math.max(2, counterState.c1Queue - 2);
      newC2 = Math.max(2, counterState.c2Queue - 2);
      triggerAudio("checkout");
      sendSilentPhoneNotification("COUNTER 3 DEPLOYED", `Counter 3 is ACTIVE. Load redistributed: C1 (${newC1}), C2 (${newC2}).`, "high");
      setRecentEvents(prev => [
        { id: Date.now(), text: "Counter 3 DEPLOYED: Queue redistributed smoothly", time: "Just now", type: "checkout" },
        ...prev.slice(0, 3)
      ]);
    } else {
      sendSilentPhoneNotification("COUNTER 3 CLOSED", "Counter 3 closed. Normal queue traffic restored.", "high");
      setRecentEvents(prev => [
        { id: Date.now(), text: "Counter 3 deactivated (Normal flow)", time: "Just now", type: "alert" },
        ...prev.slice(0, 3)
      ]);
    }

    setCounterState({
      c1Queue: newC1,
      c2Queue: newC2,
      c3Active: nextState,
      rushAlert: evaluateCounterRush(newC1, newC2, nextState)
    });
  };

  const adjustQueue = (counter: "c1" | "c2", delta: number) => {
    const nextC1 = counter === "c1" ? Math.max(0, counterState.c1Queue + delta) : counterState.c1Queue;
    const nextC2 = counter === "c2" ? Math.max(0, counterState.c2Queue + delta) : counterState.c2Queue;
    const rush = evaluateCounterRush(nextC1, nextC2, counterState.c3Active);

    setCounterState(prev => ({
      ...prev,
      c1Queue: nextC1,
      c2Queue: nextC2,
      rushAlert: rush
    }));
  };

  // --- Dynamic Pick & Return Slot Engine ---
  const handleProductAction = (id: string, name: string, barcode: string, action: "PICK" | "RETURN") => {
    const skuMeta = INITIAL_50_SKUS.find(s => s.id === id);
    const capacity = skuMeta?.capacity || 20;

    setProductStates(prev => {
      const current = prev[id] || { inCart: 0, sold: 0, restocked: 0, depletedAt: null };
      const currentStock = Math.max(0, capacity - (current.inCart + current.sold) + current.restocked);

      if (action === "PICK") {
        if (currentStock <= 0) {
          triggerAudio("alert");
          return prev;
        }
        triggerAudio("pick");
        const nextInCart = current.inCart + 1;
        const remaining = capacity - (nextInCart + current.sold) + current.restocked;
        const isDepleted = remaining / capacity < 0.7;

        // Auto trigger silent push alert when a product drops below 70%
        if (isDepleted && !current.depletedAt) {
          sendSilentPhoneNotification(
            `DEPLETION ALERT: ${skuMeta?.slot || id}`,
            `Critical: ${name} stock fell below 70% (${remaining}/${capacity} units left). Replenish shelf.`
          );
        }

        return {
          ...prev,
          [id]: {
            ...current,
            inCart: nextInCart,
            depletedAt: isDepleted && !current.depletedAt ? Date.now() : current.depletedAt
          }
        };
      } else {
        triggerAudio("return");
        if (current.inCart > 0) {
          return {
            ...prev,
            [id]: { ...current, inCart: current.inCart - 1 }
          };
        } else {
          return {
            ...prev,
            [id]: { ...current, restocked: current.restocked + 1, depletedAt: null }
          };
        }
      }
    });

    const eventDesc = action === "PICK" 
      ? `[PICK] ${name} -> In Cart (Not Sold) | Barcode: ${barcode}`
      : `[RETURN] ${name} -> Returned to Shelf Slot | Barcode: ${barcode}`;

    setRecentEvents(prev => [
      { id: Date.now(), text: eventDesc, time: "Just now", type: action === "PICK" ? "pick" : "return" },
      ...prev.slice(0, 3)
    ]);
  };

  // --- Execute Scan Button Handler (Direct Camera Launcher via Tunnel) ---
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = barcodeInput.trim();

    if (raw) {
      const matched = INITIAL_50_SKUS.find(
        s => s.barcode === raw || s.id.toLowerCase() === raw.toLowerCase() || s.barcode.endsWith(raw)
      );

      if (matched) {
        handleProductAction(matched.id, matched.name, matched.barcode, scanMode);
        setBarcodeInput("");
      } else {
        triggerAudio("alert");
        setRecentEvents(prev => [
          { id: Date.now(), text: `Barcode Not Found: ${raw}`, time: "Just now", type: "alert" },
          ...prev.slice(0, 3)
        ]);
      }
      return;
    }

    setIsScanningCamera(true);
    setRecentEvents(prev => [
      { id: Date.now(), text: "Opening Edge Camera Scanner... Please show barcode", time: "Just now", type: "system" },
      ...prev.slice(0, 3)
    ]);

    try {
      const res = await fetch(`${BACKEND_TUNNEL_URL}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true"
        }
      });
      const data = await res.json();

      if (data.status === "success" && data.barcode) {
        const scannedCode = data.barcode.trim();
        const matched = INITIAL_50_SKUS.find(
          s => s.barcode === scannedCode || s.barcode.endsWith(scannedCode) || scannedCode.endsWith(s.barcode)
        );

        if (matched) {
          handleProductAction(matched.id, matched.name, matched.barcode, scanMode);
        } else {
          setRecentEvents(prev => [
            { id: Date.now(), text: `Custom Item Scanned: ${scannedCode}`, time: "Just now", type: "alert" },
            ...prev.slice(0, 3)
          ]);
        }
      } else {
        setRecentEvents(prev => [
          { id: Date.now(), text: "Scan cancelled or timed out.", time: "Just now", type: "alert" },
          ...prev.slice(0, 3)
        ]);
      }
    } catch {
      triggerAudio("alert");
      setRecentEvents(prev => [
        { id: Date.now(), text: "Tunnel Bridge offline. Check 'python scan_bridge.py' & localtunnel.", time: "Just now", type: "alert" },
        ...prev.slice(0, 3)
      ]);
    } finally {
      setIsScanningCamera(false);
    }
  };

  // POS Checkout Clearance & PDF Generation
  const handleCheckoutAll = async () => {
    let convertedUnits = 0;
    let convertedValue = 0;
    const activeBillItems: any[] = [];

    INITIAL_50_SKUS.forEach(sku => {
      const live = productStates[sku.id];
      if (live && live.inCart > 0) {
        convertedUnits += live.inCart;
        convertedValue += live.inCart * sku.price;
        activeBillItems.push({
          name: sku.name,
          barcode: sku.barcode,
          qty: live.inCart,
          price: sku.price
        });
      }
    });

    if (convertedUnits === 0) return;

    // Trigger local PDF build if tunnel bridge is active
    try {
      await fetch(`${BACKEND_TUNNEL_URL}/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true"
        },
        body: JSON.stringify({ items: activeBillItems })
      });
    } catch {
      // Local fallback
    }

    setProductStates(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        const item = updated[id];
        if (item.inCart > 0) {
          updated[id] = {
            ...item,
            sold: item.sold + item.inCart,
            inCart: 0
          };
        }
      });
      return updated;
    });

    triggerAudio("checkout");
    setFootfall(prev => ({ ...prev, out: prev.out + Math.ceil(convertedUnits / 2) }));
    setRecentEvents(prev => [
      { id: Date.now(), text: `POS Cleared ${convertedUnits} items (Rs.${convertedValue.toLocaleString("en-IN")}) | Tax Invoice PDF Built`, time: "Just now", type: "checkout" },
      ...prev.slice(0, 3)
    ]);
  };

  // Dynamic Computations across all 50 SKUs
  const catalogWithCalculations = useMemo(() => {
    return INITIAL_50_SKUS.map(sku => {
      const live = productStates[sku.id] || { inCart: 0, sold: 0, restocked: 0, depletedAt: null };
      const currentStock = Math.max(0, sku.capacity - (live.inCart + live.sold) + live.restocked);
      const emptySlots = Math.max(0, sku.capacity - currentStock);
      const clearanceRate = Math.min(100, Math.round(((live.inCart + live.sold) / sku.capacity) * 100));
      const ratio = currentStock / sku.capacity;

      return {
        ...sku,
        inCart: live.inCart,
        sold: live.sold,
        restocked: live.restocked,
        currentStock,
        emptySlots,
        clearanceRate,
        ratio,
        depletedAt: live.depletedAt
      };
    });
  }, [productStates]);

  const totalCapacity = catalogWithCalculations.reduce((acc, c) => acc + c.capacity, 0);
  const totalRemainingOnShelf = catalogWithCalculations.reduce((acc, c) => acc + c.currentStock, 0);
  const totalInCartInvigilated = catalogWithCalculations.reduce((acc, c) => acc + c.inCart, 0);
  const totalSoldCleared = catalogWithCalculations.reduce((acc, c) => acc + c.sold, 0);
  const grossRevenue = catalogWithCalculations.reduce((acc, c) => acc + (c.sold * c.price), 0);
  const totalClearedUnits = totalInCartInvigilated + totalSoldCleared;
  const overallClearancePct = Math.round((totalClearedUnits / totalCapacity) * 100);
  const activeInStore = Math.max(0, footfall.in - footfall.out);

  // Critical FIFO Depletion Queue (<70% Capacity)
  const criticalDepletedQueue = useMemo(() => {
    return catalogWithCalculations
      .filter(item => item.ratio < 0.7)
      .sort((a, b) => (a.depletedAt || 0) - (b.depletedAt || 0)); // Oldest depleted on top
  }, [catalogWithCalculations]);

  const filteredCatalog = catalogWithCalculations.filter(sku => {
    const matchesSearch = 
      sku.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sku.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === "All" || sku.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Groceries", "Snacks", "Beverages", "Personal Care", "Household", "Lighting", "Electronics", "Stationery", "Books"];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-sm text-slate-400">
        Loading Retailer Vision Engine...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 font-sans relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <IconStore className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Retailer Vision OS</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Edge & Push Synced
                </span>
              </div>
              <p className="text-xs text-slate-500">Autonomous Shelf Compliance, Counter Rush & Lock-Screen Push Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Verification Test Button */}
            <button
              onClick={triggerComprehensiveTest}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition shadow-2xs"
            >
              <IconBell className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Test Phone Alert (Audit)</span>
            </button>

            {/* Team AIRS Signature Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/80">
              <IconSparkles className="w-4 h-4 text-indigo-600" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Designed By</p>
                <p className="text-xs font-extrabold text-indigo-900 tracking-wide">TEAM AIRS</p>
              </div>
            </div>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                audioEnabled ? "bg-white text-slate-700 border-slate-200" : "bg-rose-50 text-rose-600 border-rose-200"
              }`}
            >
              <IconVolume active={audioEnabled} />
              <span className="hidden md:inline">{audioEnabled ? "Alerts On" : "Muted"}</span>
            </button>

            <button
              onClick={handleCheckoutAll}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm active:scale-95"
            >
              <IconCheck className="w-4 h-4 text-emerald-400" />
              <span>Checkout Invigilated ({totalInCartInvigilated})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Counter Rush & Queue Bottleneck Intelligence */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 ${
          counterState.rushAlert 
            ? "bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/50 shadow-md" 
            : "bg-white/90 border-slate-200/80 shadow-xs"
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                counterState.rushAlert ? "bg-rose-600 text-white animate-bounce" : "bg-indigo-50 text-indigo-600"
              }`}>
                <IconAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Checkout Counter Intelligence</h2>
                  {counterState.rushAlert && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-600 text-white animate-pulse">
                      ALERT: RUSH DETECTED!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {counterState.rushAlert 
                    ? "Counters 1 & 2 are bottlenecked (Queue ≥ 4). Deploy Counter 3 to relieve customer congestion!"
                    : "Footfall queues are within operational capacity. Normal checkout flow active."}
                </p>
              </div>
            </div>

            {/* Counter Queue Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs flex items-center gap-3 shadow-2xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Counter 1</span>
                  <span className="font-extrabold text-slate-800 text-sm">{counterState.c1Queue} in Queue</span>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => adjustQueue("c1", 1)} className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-[10px]">+</button>
                  <button onClick={() => adjustQueue("c1", -1)} className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-[10px]">-</button>
                </div>
              </div>

              <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs flex items-center gap-3 shadow-2xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Counter 2</span>
                  <span className="font-extrabold text-slate-800 text-sm">{counterState.c2Queue} in Queue</span>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => adjustQueue("c2", 1)} className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-[10px]">+</button>
                  <button onClick={() => adjustQueue("c2", -1)} className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-[10px]">-</button>
                </div>
              </div>

              {/* Push Alert to Phone Button */}
              <button
                onClick={() => sendSilentPhoneNotification(
                  "COUNTER 3 RUSH DISPATCH",
                  `Bheed Alert! Counter 1 (${counterState.c1Queue}) & Counter 2 (${counterState.c2Queue}) congested. Open Counter 3 immediately.`
                )}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                <IconBell className="w-3.5 h-3.5 text-amber-400" />
                <span>Notify Phone</span>
              </button>

              <div className={`px-4 py-2 rounded-xl border text-xs flex items-center gap-3 transition ${
                counterState.c3Active ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-slate-100 border-slate-200 text-slate-500"
              }`}>
                <div>
                  <span className="font-bold block text-[10px] uppercase">Counter 3 (Express)</span>
                  <span className="font-extrabold text-xs">{counterState.c3Active ? "ACTIVE & RUNNING" : "STANDBY (CLOSED)"}</span>
                </div>
                <button
                  onClick={toggleCounter3}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition active:scale-95 ${
                    counterState.c3Active 
                      ? "bg-rose-600 hover:bg-rose-700 text-white" 
                      : "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                  }`}
                >
                  {counterState.c3Active ? "Close Counter 3" : "Open Counter 3"}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Real-Time On-Demand Barcode Scanner Control Bar */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-xs">
          <form onSubmit={handleBarcodeSubmit} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <IconBarcode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Direct Edge Vision Scanner Interface</h3>
                <p className="text-[11px] text-slate-400">Tap 'Execute Scan' to launch live camera window, or type barcode directly</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Scan Mode Toggle */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setScanMode("PICK")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    scanMode === "PICK" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Scan to Pick (+1)
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode("RETURN")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    scanMode === "RETURN" ? "bg-white text-amber-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Scan to Return (-1)
                </button>
              </div>

              {/* Barcode Quick Input */}
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan / Type Barcode (or Leave Empty for Camera)..."
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64 font-mono"
              />

              {/* Execute Scan Button (Triggers Python Window on Empty Input) */}
              <button
                type="submit"
                disabled={isScanningCamera}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-2xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {isScanningCamera ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Camera Active...</span>
                  </>
                ) : (
                  <span>Execute Scan</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 4 Macro KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Store Footfall</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <IconUsers className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{activeInStore} <span className="text-xs font-normal text-slate-500">in aisles</span></div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs font-semibold">
              <span className="text-emerald-600 font-medium">Camera In: {footfall.in}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-medium">Exit Out: {footfall.out}</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Invigilated Items</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${totalInCartInvigilated > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
                <IconAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600">{totalInCartInvigilated} <span className="text-xs font-normal text-slate-500">units in cart</span></div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
              <IconShield className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Camera active: In Cart, Not Sold</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Clearance</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <IconPackage className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{overallClearancePct}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${overallClearancePct}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-medium">{totalRemainingOnShelf} of {totalCapacity} units remain on shelf</div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cleared Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <IconTrending className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">₹{grossRevenue.toLocaleString("en-IN")}</div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="text-emerald-600 font-bold">{totalSoldCleared} items</span> verified & cleared at POS
            </div>
          </div>
        </div>

        {/* Priority FIFO Depletion Banner (<70% Capacity) */}
        {criticalDepletedQueue.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    FIFO Depletion Alert Queue ({criticalDepletedQueue.length} SKUs &lt; 70%)
                  </h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Earliest depleted: <b className="text-amber-950">{criticalDepletedQueue[0].name}</b> ({criticalDepletedQueue[0].slot}) — {criticalDepletedQueue[0].currentStock}/{criticalDepletedQueue[0].capacity} remaining
                  </p>
                </div>
              </div>
              <button
                onClick={() => sendSilentPhoneNotification(
                  `URGENT RESTOCK: ${criticalDepletedQueue[0].slot}`,
                  `${criticalDepletedQueue[0].name} depleted first (<70%). Refill shelf slot immediately.`
                )}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition shadow-2xs self-start sm:self-auto"
              >
                Push Depletion Alert to Phone
              </button>
            </div>
          </div>
        )}

        {/* 50 SKUs Dynamic Shelf Inventory & Live Vision Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main 50 SKUs Table with Dual Action Controls (2 Cols) */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Barcode-Driven Dynamic Shelf Slots</h2>
                <p className="text-xs text-slate-500">All 50 SKUs linked with live camera scanner and real-time slot clearance</p>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name, SKU or Barcode..."
                className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-64"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 text-xs scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedCategory === cat 
                      ? "bg-slate-900 text-white" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto pr-1">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white z-10 shadow-2xs">
                  <tr className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-200">
                    <th className="pb-3 pt-1">Product Description</th>
                    <th className="pb-3 pt-1">Shelf Stock</th>
                    <th className="pb-3 pt-1">Vacant Slots</th>
                    <th className="pb-3 pt-1">In Cart</th>
                    <th className="pb-3 pt-1 text-right">Pick / Return Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCatalog.map((item) => {
                    const isLow = item.ratio < 0.7;
                    const isOut = item.currentStock === 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-slate-800 text-xs sm:text-sm">{item.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-500 font-medium">{item.id}</span>
                            <span>•</span>
                            <span className="text-indigo-600 font-semibold">{item.category}</span>
                            <span>•</span>
                            <span className="text-slate-700 font-bold">₹{item.price}</span>
                            <span>•</span>
                            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {item.barcode}
                            </span>
                          </div>
                        </td>

                        <td className="py-3">
                          <span className={`font-bold text-xs ${isOut ? "text-rose-600" : isLow ? "text-amber-600 font-extrabold" : "text-slate-700"}`}>
                            {item.currentStock}
                          </span>
                          <span className="text-xs text-slate-400 font-normal"> / {item.capacity}</span>
                          {isLow && !isOut && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                              &lt; 70%
                            </span>
                          )}
                        </td>

                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            {item.emptySlots} vacant
                          </span>
                        </td>

                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                            item.inCart > 0 ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse" : "text-slate-400"
                          }`}>
                            {item.inCart} in cart
                          </span>
                        </td>

                        {/* Unrestricted Dual Pick & Return Buttons */}
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleProductAction(item.id, item.name, item.barcode, "RETURN")}
                              title="Return product to shelf / Restock slot"
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition active:scale-95 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 shadow-2xs"
                            >
                              - Return
                            </button>

                            <button
                              disabled={isOut}
                              onClick={() => handleProductAction(item.id, item.name, item.barcode, "PICK")}
                              title="Pick from Shelf (Add to Cart)"
                              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition active:scale-95 ${
                                isOut 
                                  ? "bg-slate-100 text-slate-300 cursor-not-allowed" 
                                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 shadow-2xs"
                              }`}
                            >
                              + Pick
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {filteredCatalog.length} of 50 SKUs</span>
              <span>All shelf slot transitions barcode-verified</span>
            </div>
          </div>

          {/* Right Rail: Counter Load, Live Feed & Architecture Card (1 Col) */}
          <div className="space-y-6">

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Counter Load Distribution</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">Counter 1 (Main POS)</span>
                  <span className="font-extrabold text-slate-900">{counterState.c1Queue} Customers</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">Counter 2 (Fast Lane)</span>
                  <span className="font-extrabold text-slate-900">{counterState.c2Queue} Customers</span>
                </div>
                <div className={`flex justify-between items-center p-2.5 rounded-xl border ${
                  counterState.c3Active ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-100 text-slate-400"
                }`}>
                  <span className="font-semibold">Counter 3 (Rush Buffer)</span>
                  <span className="font-extrabold">{counterState.c3Active ? "Operating" : "Closed"}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Vision Feed</h3>
                <span className="text-[11px] text-slate-400">Streamed</span>
              </div>
              <div className="space-y-3">
                {recentEvents.map((ev) => (
                  <div key={ev.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">{ev.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ev.time}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                      ev.type === "alert" ? "bg-rose-500" : ev.type === "return" ? "bg-amber-500" : ev.type === "pick" ? "bg-indigo-500" : "bg-emerald-500"
                    }`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase mb-2">
                <IconShield className="w-4 h-4 text-indigo-300" />
                <span>Multi-Criteria Stock Engine</span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1">On-Demand Camera & Push Alert</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stock clearance camera scans, FIFO depletion alerts (&lt; 70%), aur counter rush load ke direct synchronization se lock-screen notifications trigger hoti hain.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
