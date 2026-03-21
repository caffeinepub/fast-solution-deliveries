import { motion } from "motion/react";
import type { Review } from "../types";

interface Props {
  review: Review;
  index?: number;
}

const RATING_LABELS = ["Terrible", "Bad", "Okay", "Good", "Excellent"];

export default function ReviewCard({ review, index = 0 }: Props) {
  const date = new Date(review.date);
  const dateStr = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-2xl p-4 shadow-sm"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF9500)" }}
          >
            {review.reviewerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {review.reviewerName}
            </p>
            <p className="text-xs text-muted-foreground">{dateStr}</p>
          </div>
        </div>
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{
            background:
              review.reviewerRole === "customer" ? "#FFF3E8" : "#E8F4FF",
            color: review.reviewerRole === "customer" ? "#FF6B00" : "#2563EB",
          }}
        >
          {review.reviewerRole === "customer" ? "👤 Customer" : "🏍️ Rider"}
        </span>
      </div>

      {/* Target */}
      <p className="text-xs text-muted-foreground mb-2">
        Review for:{" "}
        <span className="font-medium text-foreground">{review.targetName}</span>
      </p>

      {/* Stars + label */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className="text-lg"
              style={{ color: s <= review.rating ? "#FF6B00" : "#e5e7eb" }}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-xs font-semibold" style={{ color: "#FF6B00" }}>
          {RATING_LABELS[review.rating - 1]}
        </span>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-foreground leading-relaxed bg-muted/40 rounded-xl px-3 py-2 mb-3">
          "{review.comment}"
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Order #{review.orderId}
        </span>
        <span className="text-xs text-muted-foreground capitalize">
          {review.deliveryType}
        </span>
      </div>
    </motion.div>
  );
}
