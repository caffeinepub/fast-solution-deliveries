import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Review } from "../types";

interface Props {
  open: boolean;
  orderId: string;
  reviewerRole: "customer" | "rider";
  reviewerName: string;
  targetName: string;
  deliveryType: string;
  onSubmit: (review: Review) => void;
  onSkip: () => void;
}

export default function ReviewModal({
  open,
  orderId,
  reviewerRole,
  reviewerName,
  targetName,
  deliveryType,
  onSubmit,
  onSkip,
}: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating === 0) return;
    const review: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      orderId,
      reviewerRole,
      reviewerName,
      targetName,
      rating,
      comment,
      date: new Date().toISOString(),
      deliveryType,
    };
    onSubmit(review);
  };

  const label =
    reviewerRole === "customer" ? "Rate your Rider" : "Rate your Customer";
  const activeRating = hovered || rating;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onSkip}
          />
          {/* Bottom sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-5 pt-4 pb-10 max-w-md mx-auto shadow-2xl"
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-5" />

            {/* Header */}
            <div className="text-center mb-5">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                }}
              >
                {reviewerRole === "customer" ? "🏍️" : "📦"}
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                {label}
              </p>
              <h2 className="text-xl font-bold text-foreground">
                {targetName}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Order #{orderId}
              </p>
            </div>

            {/* Stars */}
            <div
              className="flex justify-center gap-3 mb-5"
              data-ocid="review.rating.input"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileTap={{ scale: 1.3 }}
                  whileHover={{ scale: 1.15 }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-4xl transition-all duration-150 focus:outline-none"
                  style={{
                    color: star <= activeRating ? "#FF6B00" : "#e5e7eb",
                    filter:
                      star <= activeRating
                        ? "drop-shadow(0 0 4px #FF9500)"
                        : "none",
                  }}
                >
                  ★
                </motion.button>
              ))}
            </div>

            {/* Rating label */}
            <div className="text-center mb-4 h-5">
              {activeRating > 0 && (
                <motion.p
                  key={activeRating}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-semibold"
                  style={{ color: "#FF6B00" }}
                >
                  {
                    ["Terrible", "Bad", "Okay", "Good", "Excellent!"][
                      activeRating - 1
                    ]
                  }
                </motion.p>
              )}
            </div>

            {/* Comment */}
            <textarea
              data-ocid="review.comment.textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent mb-4"
              style={{ "--tw-ring-color": "#FF6B00" } as React.CSSProperties}
            />

            {/* Submit */}
            <button
              type="button"
              data-ocid="review.submit_button"
              disabled={rating === 0}
              onClick={handleSubmit}
              className="w-full text-white font-bold py-4 rounded-2xl text-base transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(90deg, #FF6B00, #FF9500)" }}
            >
              Submit Review
            </button>

            <button
              type="button"
              data-ocid="review.skip_button"
              onClick={onSkip}
              className="w-full mt-3 text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
