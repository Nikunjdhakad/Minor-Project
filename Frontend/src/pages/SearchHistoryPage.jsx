import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Search, ShoppingBag, ImageIcon, ArrowRight, Calendar, ExternalLink, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import usePageTitle from "@/hooks/usePageTitle";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function SearchHistoryPage() {
  usePageTitle("Search History");
  const { user, setRecommendations, addUpload } = useAppContext();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fetchHistory = async (pageNum = 1) => {
    if (!user?.token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/history?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (pageNum === 1) {
          setHistory(data.history || []);
        } else {
          setHistory((prev) => [...prev, ...(data.history || [])]);
        }
        const pagination = data.pagination;
        setHasMore(pagination ? pagination.page < pagination.pages : false);
      }
    } catch (err) {
      console.error("Failed to fetch search history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, [user?.token]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage);
  };

  // Load search results back into recommendations and navigate
  const viewResults = (entry) => {
    const formatted = (entry.matches || []).map((match, index) => ({
      id: match._id || index,
      name: match.name || "Fashion Item",
      imageUrl: match.imageUrl,
      shopLink: match.shopLink,
      price: match.price,
      matchScore: match.matchScore || (99 - index * 2),
      description: `${match.source || "Store"} • ${match.price || "Visit Site"}`,
      tags: [match.source || "Shop", "Premium"],
    }));

    setRecommendations(formatted);

    // Also set as latest upload so recommendations page shows the source image
    addUpload({
      id: `DF-HIST`,
      date: new Date(entry.createdAt).toISOString().split("T")[0],
      itemsDetected: formatted.length,
      status: "From History",
      imageUrl: entry.imageUrl,
    });

    navigate("/recommendations");
  };

  const deleteEntry = async (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((h) => h._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete history item:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const clearAll = async () => {
    setIsClearing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/history/all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setHistory([]);
        setShowClearConfirm(false);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    } finally {
      setIsClearing(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Empty state
  if (!isLoading && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="h-24 w-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
            <Clock className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">No Search History</h2>
          <p className="text-muted-foreground text-lg">
            Your past visual searches will appear here. Upload an outfit photo to get started.
          </p>
          <Link to="/upload">
            <Button
              size="lg"
              className="rounded-full h-12 px-8 text-base font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              Upload an Outfit
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 md:py-12 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Search History</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Click any search to view those products again.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && !showClearConfirm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              className="rounded-xl gap-2 h-10 px-4 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All
            </Button>
          )}
          <AnimatePresence>
            {showClearConfirm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2 p-2 rounded-xl bg-destructive/5 border border-destructive/20"
              >
                <span className="text-xs font-medium text-destructive px-2">Delete all?</span>
                <Button size="sm" variant="destructive" onClick={clearAll} disabled={isClearing} className="rounded-lg h-8 px-3 text-xs font-semibold">
                  {isClearing ? "Clearing..." : "Yes, Clear"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowClearConfirm(false)} className="rounded-lg h-8 px-3 text-xs font-semibold">
                  Cancel
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Link to="/upload">
            <Button
              variant="outline"
              className="rounded-full shadow-sm hover:scale-105 transition-transform bg-background/50 backdrop-blur-sm"
            >
              <Search className="mr-2 h-4 w-4" /> New Search
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card/40 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex gap-5 items-center">
                  <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-40" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* History Items */}
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {history.map((entry, index) => (
              <motion.div key={entry._id || index} variants={item}>
                <Card
                  className="bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => viewResults(entry)}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row gap-5">
                      {/* Search Image */}
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden shrink-0 border border-border/50 shadow-md">
                        {entry.imageUrl ? (
                          <img
                            src={entry.imageUrl}
                            alt="Search upload"
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-muted/50">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute top-1.5 left-1.5">
                          <Badge
                            variant="secondary"
                            className="bg-background/80 backdrop-blur-md shadow-sm border-0 text-[10px] font-bold px-1.5 py-0.5"
                          >
                            #{history.length - index}
                          </Badge>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(entry.createdAt)}</span>
                        </div>
                        <h3 className="text-base font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors">
                          Visual Search • {entry.matches?.length || 0} products found
                        </h3>

                        {/* Match Thumbnails */}
                        {entry.matches && entry.matches.length > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {entry.matches.slice(0, 6).map((match, i) => (
                                <div
                                  key={i}
                                  className="h-9 w-9 rounded-lg overflow-hidden border-2 border-background shadow-sm hover:scale-110 hover:z-10 transition-transform"
                                >
                                  <img
                                    src={match.imageUrl || match.thumbnail}
                                    alt={match.name || "Match"}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                            </div>
                            {entry.matches.length > 6 && (
                              <span className="text-xs text-muted-foreground font-medium">
                                +{entry.matches.length - 6} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* View & Delete buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-center">
                        <button
                          onClick={(e) => deleteEntry(e, entry._id)}
                          disabled={deletingId === entry._id}
                          className="p-2 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete this entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                          <span className="hidden sm:inline">View Products</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-10">
              <Button
                variant="outline"
                onClick={(e) => { e.stopPropagation(); loadMore(); }}
                className="rounded-full px-8 h-11 shadow-sm hover:scale-105 transition-transform bg-background/50 backdrop-blur-sm"
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
