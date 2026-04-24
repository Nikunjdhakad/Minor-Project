import { useState } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Reply, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import AuthPromptModal from "@/components/AuthPromptModal";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function RecommendationsPage() {
  const { recommendations, latestUpload, addFavorite, favorites, user } = useAppContext();
  const outfits = recommendations?.length > 0 ? recommendations : [];
  const [savingId, setSavingId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState("continue");

  const requireAuth = (actionLabel) => {
    if (!user) {
      setAuthAction(actionLabel);
      setShowAuthModal(true);
      return true;
    }
    return false;
  };

  const handleFavorite = async (outfit) => {
    if (requireAuth("save to favorites")) return;

    setSavingId(outfit.id);
    await addFavorite({
      imageUrl: outfit.imageUrl,
      name: outfit.name,
      shopLink: outfit.shopLink,
      price: outfit.price,
      matchScore: outfit.matchScore,
      description: outfit.description,
      tags: outfit.tags,
    });
    setSavingId(null);
  };

  const handleShopClick = (e, outfit) => {
    if (requireAuth("shop this look")) {
      e.preventDefault();
    }
  };

  const isFavorited = (outfit) => {
    return favorites.some(
      (fav) => fav.imageUrl === outfit.imageUrl || (outfit.shopLink && fav.shopLink === outfit.shopLink)
    );
  };

  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="h-24 w-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">No Matches Yet</h2>
          <p className="text-muted-foreground text-lg">
            Upload an outfit photo to get AI-powered style recommendations from top fashion retailers.
          </p>
          <Link to="/upload">
            <Button size="lg" className="rounded-full h-12 px-8 text-base font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              Upload an Outfit
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 md:py-12 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
      >
        <div className="flex gap-6 items-center">
          {latestUpload?.imageUrl && (
            <div className="hidden md:block h-24 w-24 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/20 shrink-0">
              <img src={latestUpload.imageUrl} alt="Source upload" className="h-full w-full object-cover" loading="lazy" />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Style Matches</h1>
            <p className="text-muted-foreground text-lg">
              {outfits.length} curated matches based on your upload.
            </p>
          </div>
        </div>
        <Link to="/upload">
          <Button variant="outline" className="rounded-full shadow-sm hover:scale-105 transition-transform bg-background/50 backdrop-blur-sm">
            <Reply className="mr-2 h-4 w-4" /> Try Another Upload
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {outfits.map((outfit) => (
          <motion.div key={outfit.id} variants={item}>
            <Card className="overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 group flex flex-col h-full rounded-3xl">
              <div className="relative overflow-hidden aspect-[3/4]">
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm border-0 font-semibold text-primary px-3 py-1 text-sm">
                    {outfit.matchScore}% Match
                  </Badge>
                </div>
                <img
                  src={outfit.imageUrl}
                  alt={outfit.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent p-6 pt-24 translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex gap-2 flex-wrap mb-2">
                    {outfit.price && <Badge variant="default" className="font-bold shadow-md">{outfit.price}</Badge>}
                    {outfit.tags && outfit.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="bg-background/50 backdrop-blur-sm border-border/50 text-xs text-white">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-bold text-xl leading-tight mb-1 text-white shadow-sm">{outfit.name || "Unnamed match"}</h3>
                </div>
              </div>
              <CardContent className="pt-4 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">{outfit.description}</p>
              </CardContent>
              <CardFooter className="pt-0 pb-6 px-6 gap-2">
                <Button asChild className="flex-1 rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
                  <a
                    href={outfit.shopLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleShopClick(e, outfit)}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" /> Shop Look
                  </a>
                </Button>
                <Button
                  variant={isFavorited(outfit) ? "default" : "secondary"}
                  size="icon"
                  className={`rounded-xl shrink-0 hover:scale-105 transition-transform ${isFavorited(outfit) ? "bg-pink-500 hover:bg-pink-600 text-white" : "bg-secondary/80"}`}
                  onClick={() => handleFavorite(outfit)}
                  disabled={savingId === outfit.id || isFavorited(outfit)}
                >
                  <Heart className={`h-4 w-4 ${isFavorited(outfit) ? "fill-current" : ""}`} />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action={authAction}
      />
    </div>
  );
}