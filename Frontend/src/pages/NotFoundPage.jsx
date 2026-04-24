import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import usePageTitle from "@/hooks/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Page Not Found");
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7 }}
        className="text-center space-y-6 max-w-lg"
      >
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.1 }}
        >
          <h1 className="text-[10rem] md:text-[12rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-foreground/20 to-foreground/5 select-none">
            404
          </h1>
        </motion.div>

        <div className="space-y-3 -mt-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Page Not Found</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link to="/">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" className="rounded-xl h-12 px-8 font-semibold shadow-lg shadow-primary/20 gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </motion.div>
          </Link>
          <Link to="/upload">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" variant="outline" className="rounded-xl h-12 px-8 font-semibold gap-2 border-border/40">
                <Search className="h-4 w-4" />
                Search Fashion
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
