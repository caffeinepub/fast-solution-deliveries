import { motion } from "motion/react";
import { useEffect } from "react";

interface Props {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #FF6B00 0%, #FF9500 60%, #FFB347 100%)",
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "backOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div
          className="w-28 h-28 rounded-3xl bg-white flex items-center justify-center shadow-2xl"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
        >
          <span style={{ fontSize: 56 }}>🚀</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Fast Solution
          </h1>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Deliveries
          </h1>
          <p className="mt-3 text-white/80 text-sm font-medium tracking-widest uppercase">
            Swift. Reliable. Everywhere.
          </p>
        </div>
        <motion.div
          className="mt-8 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                delay: i * 0.2,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
