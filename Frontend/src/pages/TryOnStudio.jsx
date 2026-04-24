import { motion } from "framer-motion";
import { Sparkles, Rotate3D, Shirt, Camera, Layers, Zap, ArrowRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";

const features = [
  {
    icon: Rotate3D,
    title: "3D Body Modeling",
    desc: "Generate a realistic 3D avatar from your photos for an accurate virtual fitting experience.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Shirt,
    title: "Virtual Try-On",
    desc: "See how any clothing item looks on your 3D model before buying — from any angle.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Camera,
    title: "AR Preview",
    desc: "Use augmented reality to visualize outfits in your environment in real time.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Layers,
    title: "Mix & Match",
    desc: "Combine tops, bottoms, and accessories to build complete outfits on your avatar.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

const timeline = [
  { phase: "Phase 1", label: "3D Avatar Generation", status: "in-progress" },
  { phase: "Phase 2", label: "Virtual Garment Fitting", status: "upcoming" },
  { phase: "Phase 3", label: "AR Live Preview", status: "upcoming" },
  { phase: "Phase 4", label: "Social Sharing", status: "upcoming" },
];

export default function TryOnStudio() {
  const [notified, setNotified] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-500/5 to-amber-500/5 blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-semibold"
          >
            <Zap className="h-4 w-4" />
            Under Development
          </motion.div>

          {/* 3D Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="mx-auto"
          >
            <div className="relative h-28 w-28 mx-auto">
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="h-28 w-28 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30 flex items-center justify-center"
              >
                <Rotate3D className="h-14 w-14 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="h-4 w-4 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              3D Try-On{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Studio
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              We're building a revolutionary 3D virtual try-on experience. Upload your photo, get a realistic 3D avatar, and try on any outfit before you buy.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => setNotified(true)}
              disabled={notified}
              className="rounded-xl h-12 px-8 font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform gap-2"
            >
              <Bell className="h-4 w-4" />
              {notified ? "You'll be Notified!" : "Notify Me When Ready"}
            </Button>
            <Link to="/upload">
              <Button variant="outline" size="lg" className="rounded-xl h-12 px-8 font-semibold gap-2 border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all">
                Try Visual Search Instead
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-4 py-16 bg-muted/20 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">What's Coming</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Here's what the 3D Try-On Studio will offer once it's ready.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg hover:border-primary/20 transition-all group"
              >
                <div className={`h-11 w-11 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Development Timeline */}
      <div className="px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Development Roadmap</h2>
            <p className="text-muted-foreground">Track our progress as we build this feature.</p>
          </motion.div>

          <div className="space-y-4">
            {timeline.map((step, i) => (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm"
              >
                {/* Status indicator */}
                <div className="relative shrink-0">
                  {step.status === "in-progress" ? (
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="h-3 w-3 rounded-full bg-amber-500"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted/50 border-2 border-border/50 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                    </div>
                  )}
                  {i < timeline.length - 1 && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border/40" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{step.phase}</span>
                    {step.status === "in-progress" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm mt-0.5">{step.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}