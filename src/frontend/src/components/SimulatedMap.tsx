export default function SimulatedMap() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden w-full"
      style={{ height: 240, background: "#1A2744" }}
    >
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Roads */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 375 240"
        preserveAspectRatio="none"
      >
        <path
          d="M 20,200 Q 100,140 180,100 T 350,50"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="8"
          fill="none"
        />
        <path
          d="M 20,200 Q 100,140 180,100 T 350,50"
          stroke="#FF6B00"
          strokeWidth="3"
          fill="none"
          strokeDasharray="8 4"
        />
        <path
          d="M 80,0 L 120,240"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="5"
          fill="none"
        />
        <path
          d="M 220,0 L 260,240"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="5"
          fill="none"
        />
      </svg>

      {/* Start pin */}
      <div
        className="absolute w-5 h-5 rounded-full border-2 border-white bg-green-400"
        style={{ left: 12, top: 188 }}
      />

      {/* End pin */}
      <div
        className="absolute flex flex-col items-center"
        style={{ right: 20, top: 36 }}
      >
        <div className="w-5 h-5 rounded-full border-2 border-white bg-red-400" />
      </div>

      {/* Animated rider dot */}
      <div className="rider-dot" />

      {/* Labels */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-orange-400 status-blink" />
        <span className="text-xs text-white/70 font-medium">Live Tracking</span>
      </div>

      {/* Zoom buttons */}
      <div className="absolute right-3 top-3 flex flex-col gap-1">
        <button
          type="button"
          className="w-7 h-7 bg-white/20 text-white rounded text-sm font-bold hover:bg-white/30"
        >
          +
        </button>
        <button
          type="button"
          className="w-7 h-7 bg-white/20 text-white rounded text-sm font-bold hover:bg-white/30"
        >
          −
        </button>
      </div>
    </div>
  );
}
