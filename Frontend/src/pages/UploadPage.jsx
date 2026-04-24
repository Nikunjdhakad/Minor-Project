import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle2, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { API_BASE_URL } from "@/config";
import usePageTitle from "@/hooks/usePageTitle";

export default function UploadPage() {
  usePageTitle("Visual Search");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  const navigate = useNavigate();
  const { addUpload, setRecommendations, user } = useAppContext();

  const startAnalysis = async (file, url) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const headers = {};
      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/search/visual`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze image");
      }

      setIsAnalyzed(true);

      setRecommendations(data.matches);

      addUpload({
        id: `DF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        date: new Date().toISOString().split("T")[0],
        itemsDetected: data.itemsDetected || 1,
        status: "Analyzed",
        imageUrl: url,
        matches: data.matches,
      });

      setTimeout(() => {
        navigate("/recommendations");
      }, 1500);
    } catch (err) {
      console.error("Upload Error:", err);
      setError(err.message);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const processFile = useCallback((file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    startAnalysis(file, url);
  }, []);

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = () => {
    if (!isUploading && !isAnalyzed) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="container mx-auto p-4 py-12 md:py-20 max-w-3xl flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-8 text-center"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Visual Search</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload a photo of any outfit or clothing item, and our AI will find matching products from top fashion retailers.
          </p>
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-sm font-medium text-center">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drop zone */}
        <div
          className="relative group cursor-pointer"
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Gradient glow */}
          <motion.div
            animate={{
              opacity: isDragging ? 0.7 : isUploading ? 0.5 : 0.2,
              scale: isDragging ? 1.02 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur group-hover:opacity-40 transition-all"
          />

          {/* Main drop area */}
          <motion.div
            animate={{
              borderColor: isDragging
                ? "hsl(245, 58%, 51%)"
                : "hsl(var(--border) / 0.6)",
              scale: isDragging ? 1.01 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`relative border-2 border-dashed rounded-[2rem] p-12 md:p-20 text-center bg-card/60 backdrop-blur-xl flex flex-col items-center justify-center min-h-[380px] shadow-2xl overflow-hidden transition-colors ${
              isDragging ? "bg-primary/5" : "hover:bg-card/80"
            }`}
          >
            {/* Preview background */}
            {previewUrl && (
              <div className="absolute inset-0 z-0 opacity-15">
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover blur-md" />
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* ── IDLE state ── */}
              {!isUploading && !isAnalyzed && !isDragging && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center space-y-5 relative z-10"
                >
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                    <UploadCloud className="h-9 w-9 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Drop image here or click to browse</h3>
                    <p className="text-sm text-muted-foreground">JPEG, PNG, WebP · Max 10MB</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground/50 pt-2">
                    <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Outfit photos</span>
                    <span>•</span>
                    <span>Clothing items</span>
                    <span>•</span>
                    <span>Fashion inspiration</span>
                  </div>
                </motion.div>
              )}

              {/* ── DRAG OVER state ── */}
              {!isUploading && !isAnalyzed && isDragging && (
                <motion.div
                  key="dragging"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-center space-y-5 relative z-10"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                    className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center border-2 border-primary/30"
                  >
                    <UploadCloud className="h-9 w-9 text-primary" />
                  </motion.div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-primary">Drop to search!</h3>
                    <p className="text-sm text-muted-foreground">Release to start AI analysis</p>
                  </div>
                </motion.div>
              )}

              {/* ── UPLOADING state ── */}
              {isUploading && (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center space-y-5 relative z-10"
                >
                  <div className="relative h-20 w-20 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse">
                      Analyzing your style...
                    </h3>
                    <p className="text-sm text-muted-foreground">Matching with products from top retailers</p>
                  </div>
                  <div className="w-full max-w-xs h-1.5 bg-secondary rounded-full overflow-hidden mt-4">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.8, ease: "easeInOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    />
                  </div>
                </motion.div>
              )}

              {/* ── DONE state ── */}
              {isAnalyzed && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center space-y-5 relative z-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </motion.div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-emerald-500">Analysis Complete!</h3>
                    <p className="text-sm text-muted-foreground">Redirecting to your matches...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}