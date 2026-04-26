import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  X, ExternalLink, ShoppingBag, TrendingDown, TrendingUp,
  Star, ArrowRight, BarChart3, Store, Tag, Loader2, AlertCircle, Truck,
} from "lucide-react";
import { API_BASE_URL } from "@/config";
import { useAppContext } from "@/context/AppContext";

export default function PriceComparePanel({ product, onClose }) {
  const { user } = useAppContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!product?.name) return;

    const fetchPrices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = { "Content-Type": "application/json" };
        if (user?.token) headers.Authorization = `Bearer ${user.token}`;

        const res = await fetch(`${API_BASE_URL}/api/search/compare`, {
          method: "POST",
          headers,
          body: JSON.stringify({ productName: product.name }),
        });

        if (!res.ok) throw new Error("Failed to fetch prices");
        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, [product?.name]);

  if (!product) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed top-0 right-0 h-full w-full sm:w-[440px] lg:w-[500px] bg-background/95 backdrop-blur-2xl border-l border-border/40 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="shrink-0 border-b border-border/40">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Price Comparison</h2>
              <p className="text-[11px] text-muted-foreground">
                {isLoading ? "Searching stores..." : `${data?.totalResults || 0} stores found`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-lg">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Product */}
        <div className="px-5 pb-4 flex gap-3">
          <div className="h-20 w-16 rounded-xl overflow-hidden border border-border/40 shrink-0 bg-muted/20">
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-1">{product.name || "Product"}</h3>
            <div className="flex items-center gap-1.5 mb-1">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span className="text-[11px] font-semibold">{product.matchScore}% match</span>
            </div>
            {product.price && (
              <p className="text-xs text-muted-foreground">Original: <span className="font-bold text-foreground">{product.price}</span></p>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
          <div className="relative">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-sm">Searching across stores...</p>
            <p className="text-xs text-muted-foreground mt-1">Comparing prices on Amazon, Flipkart, Myntra & more</p>
          </div>
          <div className="w-full max-w-xs space-y-2 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5">
          <AlertCircle className="h-10 w-10 text-destructive/50" />
          <p className="text-sm font-medium text-center">{error}</p>
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">Close</Button>
        </div>
      )}

      {/* Results */}
      {data && !isLoading && !error && (
        <>
          {/* Price Summary */}
          {data.summary.cheapestNum && data.summary.highestNum && data.listings.filter(l => l.price).length >= 2 && (
            <div className="px-5 py-3 border-b border-border/30 bg-card/30 shrink-0">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-2.5">
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Lowest</p>
                  <p className="text-sm font-bold text-emerald-500">{data.summary.cheapest}</p>
                </div>
                <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-2.5">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-500 mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Average</p>
                  <p className="text-sm font-bold text-blue-500">{data.summary.average}</p>
                </div>
                <div className="rounded-xl bg-rose-500/5 border border-rose-500/10 p-2.5">
                  <TrendingUp className="h-3.5 w-3.5 text-rose-500 mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Highest</p>
                  <p className="text-sm font-bold text-rose-500">{data.summary.highest}</p>
                </div>
              </div>
            </div>
          )}

          {/* Store Listings */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {data.listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <Store className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No store listings found for this product</p>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Prices across {data.listings.filter(l => l.price).length} store{data.listings.filter(l => l.price).length !== 1 ? "s" : ""}
                </p>

                <div className="space-y-2.5">
                  {data.listings.filter(l => l.price).map((item, idx) => {
                    const isCheapest = item.price === data.summary.cheapestNum && data.listings.filter(l => l.price).length >= 2;
                    const savings = data.summary.highestNum && item.price ? data.summary.highestNum - item.price : 0;

                    return (
                      <motion.a
                        key={item.id}
                        href={item.shopLink || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`block rounded-2xl border overflow-hidden transition-all hover:shadow-md group ${
                          isCheapest
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-border/40 bg-card/30 hover:border-primary/20"
                        }`}
                      >
                        {isCheapest && savings > 0 && (
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold text-center py-1 tracking-wider uppercase flex items-center justify-center gap-1.5">
                            <Tag className="h-3 w-3" /> Best Price · Save ₹{Math.round(savings).toLocaleString("en-IN")}
                          </div>
                        )}

                        <div className="flex items-center gap-3 p-3.5">
                          <div className="h-14 w-12 rounded-lg overflow-hidden border border-border/40 shrink-0 bg-muted/20">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ShoppingBag className="h-5 w-5 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Store className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-bold truncate">{item.store}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{item.name}</p>

                            <div className="flex items-center gap-3 mt-1.5">
                              {item.rating && (
                                <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-500">
                                  <Star className="h-2.5 w-2.5 fill-amber-500" /> {item.rating}
                                </span>
                              )}
                              {item.delivery && (
                                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                  <Truck className="h-2.5 w-2.5" /> {item.delivery}
                                </span>
                              )}
                            </div>

                            {data.summary.highestNum > 0 && (
                              <div className="mt-2 h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(item.price / data.summary.highestNum) * 100}%` }}
                                  transition={{ duration: 0.6, delay: 0.2 + idx * 0.05 }}
                                  className={`h-full rounded-full ${
                                    isCheapest ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-primary/40"
                                  }`}
                                />
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <p className={`text-lg font-bold tracking-tight ${isCheapest ? "text-emerald-500" : ""}`}>
                              {item.priceStr}
                            </p>
                            <span className="text-[10px] text-primary font-semibold flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              Visit <ExternalLink className="h-2.5 w-2.5" />
                            </span>
                          </div>
                        </div>
                      </motion.a>
                    );
                  })}

                  {/* No-price listings */}
                  {data.listings.filter(l => !l.price).length > 0 && (
                    <>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-5 mb-2">
                        Price not listed
                      </p>
                      {data.listings.filter(l => !l.price).map((item) => (
                        <a
                          key={item.id}
                          href={item.shopLink || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-card/20 hover:border-primary/20 transition-all group"
                        >
                          <div className="h-10 w-10 rounded-lg overflow-hidden border border-border/40 shrink-0 bg-muted/20">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center"><ShoppingBag className="h-4 w-4 text-muted-foreground/30" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{item.store}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{item.name}</p>
                          </div>
                          <span className="text-xs text-primary font-semibold flex items-center gap-1 opacity-60 group-hover:opacity-100">
                            Visit <ExternalLink className="h-3 w-3" />
                          </span>
                        </a>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border/40 shrink-0">
            {data.listings.filter(l => l.price).length >= 2 && data.summary.cheapestNum && (
              <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <TrendingDown className="h-4 w-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{data.listings[0]?.store}</span>{" "}
                  has the best price
                  {data.summary.highestNum && data.summary.cheapestNum !== data.summary.highestNum && (
                    <> — save up to <span className="font-bold text-emerald-500">
                      ₹{Math.round(data.summary.highestNum - data.summary.cheapestNum).toLocaleString("en-IN")}
                    </span></>
                  )}
                </p>
              </div>
            )}
            <a
              href={data.listings[0]?.shopLink || product.shopLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full rounded-xl h-11 font-semibold gap-2 shadow-lg shadow-primary/20">
                <ShoppingBag className="h-4 w-4" /> Shop Best Deal
                <ArrowRight className="h-3.5 w-3.5 ml-auto" />
              </Button>
            </a>
          </div>
        </>
      )}
    </motion.div>
  );
}
