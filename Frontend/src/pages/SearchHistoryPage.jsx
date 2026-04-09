import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Search, ShoppingBag, ImageIcon, ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/config";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function SearchHistoryPage() {
  const { user } = useAppContext();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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
            Browse your past visual searches and rediscover matches.
          </p>
        </div>
        <Link to="/upload">
          <Button
            variant="outline"
            className="rounded-full shadow-sm hover:scale-105 transition-transform bg-background/50 backdrop-blur-sm"
          >
            <Search className="mr-2 h-4 w-4" /> New Search
          </Button>
        </Link>
      </motion.div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card/40 backdrop-blur-sm border-border/50 rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-6 items-start">
                  <Skeleton className="h-28 w-28 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-48" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16 rounded-full" />
                      <Skeleton className="h-8 w-16 rounded-full" />
                      <Skeleton className="h-8 w-16 rounded-full" />
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
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {history.map((entry, index) => (
              <motion.div key={entry._id || index} variants={item}>
                <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-2xl hover:border-primary/20 transition-all duration-300 rounded-3xl overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Search Image */}
                      <div className="relative h-28 w-28 rounded-2xl overflow-hidden shrink-0 border border-border/50 shadow-lg">
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
                        <div className="absolute top-2 left-2">
                          <Badge
                            variant="secondary"
                            className="bg-background/80 backdrop-blur-md shadow-sm border-0 text-xs font-semibold"
                          >
                            #{history.length - index}
                          </Badge>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(entry.createdAt)}</span>
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight mb-3">
                          Visual Search • {entry.matches?.length || 0} matches found
                        </h3>

                        {/* Match Thumbnails */}
                        {entry.matches && entry.matches.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex -space-x-3">
                              {entry.matches.slice(0, 5).map((match, i) => (
                                <div
                                  key={i}
                                  className="h-10 w-10 rounded-xl overflow-hidden border-2 border-background shadow-sm"
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
                            {entry.matches.length > 5 && (
                              <span className="text-xs text-muted-foreground font-medium ml-1">
                                +{entry.matches.length - 5} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {entry.matches &&
                            entry.matches
                              .slice(0, 3)
                              .map((match, i) =>
                                match.price ? (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="bg-background/50 backdrop-blur-sm border-border/50 text-xs"
                                  >
                                    {match.price}
                                  </Badge>
                                ) : null
                              )}
                          {entry.matches && entry.matches.length > 0 && (
                            <a
                              href={entry.matches[0]?.shopLink || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                            >
                              <ShoppingBag className="h-3 w-3" /> Shop top match
                              <ArrowRight className="h-3 w-3" />
                            </a>
                          )}
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
                onClick={loadMore}
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
