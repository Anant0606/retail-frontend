{/* Shelf Vision Compliance Interactive Section */}
<div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 text-white">
  <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
    <div className="flex items-center gap-2">
      <h3 className="font-semibold text-base tracking-wide">Shelf Vision Compliance</h3>
      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
    </div>
    <span className="text-xs text-slate-400">2 Monitored Feeds</span>
  </div>

  <div className="space-y-4">
    {storeState.shelf_compliance?.map((item: any) => {
      const isCritical = item.status === "OUT_OF_STOCK";
      const isLow = item.status === "LOW_STOCK";

      return (
        <div key={item.id} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
          <div className="flex justify-between items-center text-sm font-medium mb-1.5">
            <span className="text-slate-300">{item.aisle}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                isCritical
                  ? "bg-rose-950/80 text-rose-400 border border-rose-800"
                  : isLow
                  ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                  : "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
              }`}
            >
              {item.status}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>SKU: {item.sku}</span>
            <span className="font-mono text-slate-200 font-bold">{item.remaining}% remaining</span>
          </div>

          {/* Visual Remaining Level Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isCritical ? "bg-rose-500" : isLow ? "bg-amber-400" : "bg-emerald-400"
              }`}
              style={{ width: `${item.remaining}%` }}
            />
          </div>

          {/* Action Trigger Button on low/out of stock */}
          {(isLow || isCritical) && (
            <button
              onClick={() =>
                socket?.send(
                  JSON.stringify({
                    action: "RESTOCK_SHELF",
                    shelf_id: item.id,
                  })
                )
              }
              className="mt-1 text-[11px] font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/30 border border-amber-500/30 px-2.5 py-1 rounded transition-all"
            >
              ⚡ Restock Shelf
            </button>
          )}
        </div>
      );
    })}
  </div>
</div>
