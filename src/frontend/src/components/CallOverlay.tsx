import { Mic, MicOff, PhoneOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  calleeName: string;
}

type CallState = "calling" | "connected" | "ended";

export default function CallOverlay({ open, onClose, calleeName }: Props) {
  const [callState, setCallState] = useState<CallState>("calling");
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setCallState("calling");
      setSeconds(0);
      setMuted(false);
      connectRef.current = setTimeout(() => {
        setCallState("connected");
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      }, 2000);
    }
    return () => {
      if (connectRef.current) clearTimeout(connectRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open]);

  const handleEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (connectRef.current) clearTimeout(connectRef.current);
    setCallState("ended");
    setTimeout(() => {
      onClose();
      setCallState("calling");
      setSeconds(0);
    }, 1200);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const statusLabel =
    callState === "calling"
      ? "Calling..."
      : callState === "connected"
        ? formatTime(seconds)
        : "Call Ended";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-ocid="call.modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
          style={{
            background:
              "linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
          }}
        >
          <div className="relative mb-8">
            {callState === "calling" && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(255,107,0,0.3)", margin: "-20px" }}
                />
                <motion.div
                  animate={{ scale: [1, 1.6, 1], opacity: [0.25, 0, 0.25] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: 0.4,
                  }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "rgba(255,107,0,0.15)",
                    margin: "-40px",
                  }}
                />
              </>
            )}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-4xl relative z-10"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
              }}
            >
              {calleeName.charAt(0)}
            </div>
          </div>

          <h2 className="text-white text-2xl font-bold mb-2">{calleeName}</h2>
          <p
            className={`text-base font-medium mb-16 ${
              callState === "connected"
                ? "text-green-400"
                : callState === "ended"
                  ? "text-red-400"
                  : "text-white/60"
            }`}
          >
            {callState === "calling" && (
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
              >
                {statusLabel}
              </motion.span>
            )}
            {callState !== "calling" && statusLabel}
          </p>

          <div className="flex items-center gap-8">
            <button
              type="button"
              data-ocid="call.toggle"
              onClick={() => setMuted((m) => !m)}
              disabled={callState !== "connected"}
              className="flex flex-col items-center gap-2 disabled:opacity-40"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: muted
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.12)",
                }}
              >
                {muted ? (
                  <MicOff size={24} className="text-white" />
                ) : (
                  <Mic size={24} className="text-white" />
                )}
              </div>
              <span className="text-white/70 text-xs">
                {muted ? "Unmute" : "Mute"}
              </span>
            </button>

            <button
              type="button"
              data-ocid="call.delete_button"
              onClick={handleEnd}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "#EF4444" }}
              >
                <PhoneOff size={28} className="text-white" />
              </motion.div>
              <span className="text-white/70 text-xs">End Call</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
