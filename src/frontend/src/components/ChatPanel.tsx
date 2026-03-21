import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "self" | "other";
  time: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  otherName: string;
  userRole: "customer" | "rider";
}

const nowTime = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

const CUSTOMER_SEED: Message[] = [
  {
    id: "1",
    text: "Hello! I have picked up your parcel and I'm on the way.",
    sender: "other",
    time: "14:32",
  },
  {
    id: "2",
    text: "Great, please be careful with the fragile items.",
    sender: "self",
    time: "14:33",
  },
  {
    id: "3",
    text: "Sure, no worries! Will be there in 10 minutes.",
    sender: "other",
    time: "14:34",
  },
];

const RIDER_SEED: Message[] = [
  {
    id: "1",
    text: "Hi, I'm ready for pickup. Please keep the parcel ready.",
    sender: "self",
    time: "14:32",
  },
  {
    id: "2",
    text: "Yes, it's ready. I'm at the gate.",
    sender: "other",
    time: "14:33",
  },
  { id: "3", text: "Coming in 2 minutes!", sender: "self", time: "14:34" },
];

const REPLIES = [
  "Got it, thanks!",
  "OK, I'll be there soon.",
  "Understood!",
  "Sure, no problem.",
];

export default function ChatPanel({
  open,
  onClose,
  otherName,
  userRole,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(
    userRole === "customer" ? CUSTOMER_SEED : RIDER_SEED,
  );
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: bottomRef is a stable ref
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "self",
      time: nowTime(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
        sender: "other",
        time: nowTime(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="bg-background rounded-t-3xl flex flex-col"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                }}
              >
                {otherName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{otherName}</p>
                <p className="text-xs text-green-600 font-medium">● Online</p>
              </div>
              <button
                type="button"
                data-ocid="chat.close_button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <ScrollArea
              className="flex-1 px-4 py-3 overflow-y-auto"
              style={{ maxHeight: "55vh" }}
            >
              <div className="flex flex-col gap-2 pb-2">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === "self" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] px-4 py-2 rounded-2xl text-sm ${
                        msg.sender === "self"
                          ? "text-white rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                      style={
                        msg.sender === "self"
                          ? {
                              background:
                                "linear-gradient(135deg, #FF6B00, #FF9500)",
                            }
                          : {}
                      }
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${msg.sender === "self" ? "text-white/70" : "text-muted-foreground"}`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
              <input
                data-ocid="chat.input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 ring-orange-300 transition-all"
              />
              <button
                type="button"
                data-ocid="chat.submit_button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
