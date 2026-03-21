import { motion } from "motion/react";
import { useState } from "react";
import BottomNav from "../components/BottomNav";
import ReviewCard from "../components/ReviewCard";
import type { AppUser, Review, Screen } from "../types";

const FILTER_TABS = [
  { label: "All", key: "all" },
  { label: "⭐ 5", key: "5" },
  { label: "⭐ 4", key: "4" },
  { label: "⭐ 3", key: "3" },
  { label: "⭐ 1-2", key: "low" },
];

interface Props {
  reviews: Review[];
  user: AppUser;
  onNav: (s: Screen) => void;
}

export default function ReviewsScreen({ reviews, user, onNav }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = reviews.filter((r) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "low") return r.rating <= 2;
    return r.rating === Number(activeFilter);
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold">Reviews</h1>
          <p className="text-xs text-muted-foreground">
            What people are saying
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Summary card */}
        {reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 text-white"
            style={{ background: "linear-gradient(90deg, #FF6B00, #FF9500)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">{avgRating}</p>
                <div className="flex gap-0.5 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className="text-base"
                      style={{
                        color:
                          s <= Math.round(Number(avgRating))
                            ? "#fff"
                            : "rgba(255,255,255,0.35)",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs opacity-80">
                  Based on {reviews.length} review
                  {reviews.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-6xl opacity-30">⭐</div>
            </div>
          </motion.div>
        )}

        {/* Filter tabs */}
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          data-ocid="reviews.filter.tab"
        >
          {FILTER_TABS.map((tab) => {
            const active = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all"
                style={
                  active
                    ? {
                        background: "linear-gradient(90deg, #FF6B00, #FF9500)",
                        color: "#fff",
                        borderColor: "transparent",
                      }
                    : {}
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Review list */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="reviews.empty_state"
          >
            <span className="text-5xl">⭐</span>
            <p className="text-lg font-semibold text-foreground">
              No reviews yet
            </p>
            <p className="text-sm text-muted-foreground text-center">
              {reviews.length === 0
                ? "Complete a delivery to leave your first review!"
                : "No reviews match this filter."}
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((r, i) => (
              <div key={r.id} data-ocid={`reviews.item.${i + 1}`}>
                <ReviewCard review={r} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav userRole={user.role} activeScreen="reviews" onNav={onNav} />
    </div>
  );
}
