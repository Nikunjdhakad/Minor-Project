import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AuthPromptModal({ isOpen, onClose, action = "continue" }) {
  const location = useLocation();
  const redirectParam = encodeURIComponent(location.pathname + location.search);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md pointer-events-auto rounded-[2rem] border border-border/40 bg-card/80 backdrop-blur-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient accent top bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors z-10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="px-8 pt-10 pb-8 text-center space-y-6">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                  className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-primary/20"
                >
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </motion.div>

                {/* Content */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Sign in to {action}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                    Create a free account or sign in to unlock shopping, favorites, and personalized recommendations.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 pt-2">
                  <Link to={`/login?redirect=${redirectParam}`} onClick={onClose}>
                    <Button className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform gap-2">
                      <LogIn className="h-5 w-5" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to={`/signup?redirect=${redirectParam}`} onClick={onClose}>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl text-base font-semibold border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/30 transition-all gap-2"
                    >
                      <UserPlus className="h-5 w-5" />
                      Create Account
                    </Button>
                  </Link>
                </div>

                {/* Trust badge */}
                <p className="text-xs text-muted-foreground/60 pt-2">
                  🔒 Your data is encrypted and secure.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
