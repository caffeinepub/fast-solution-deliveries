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
          "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 60%, #1a1a1a 100%)",
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "backOut" }}
        className="flex flex-col items-center gap-4"
      >
        <img
          src="/assets/uploads/1774125054011-1.png"
          alt="Fast Solution Deliveries Logo"
          className="w-56 h-56 object-contain drop-shadow-2xl"
        />
        <motion.div
          className="mt-4 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: "#c0392b" }}
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
