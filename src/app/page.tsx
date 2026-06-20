"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { 
  Cpu, LayoutTemplate, SlidersHorizontal, Lock, 
  Download, Moon, Smartphone, Keyboard, 
  Code, Zap, ArrowRight 
} from "lucide-react";

const features = [
  {
    title: "Multi-Model Support",
    description: "Seamlessly switch between GPT-4, Claude 3, and Mistral in a single interface.",
    icon: <Cpu className="w-16 h-16 mb-4 text-foreground" />,
    hueA: 340, hueB: 10
  },
  {
    title: "Prompt Templates",
    description: "Save time with powerful, customizable prompt templates ready at a click.",
    icon: <LayoutTemplate className="w-16 h-16 mb-4 text-foreground" />,
    hueA: 20, hueB: 40
  },
  {
    title: "Real-time Parameters",
    description: "Tweak Temperature and Max Tokens on the fly to perfectly control the AI's output.",
    icon: <SlidersHorizontal className="w-16 h-16 mb-4 text-foreground" />,
    hueA: 60, hueB: 90
  },
  {
    title: "Local & Secure",
    description: "No data leaves your browser. All session states are kept locally and privately.",
    icon: <Lock className="w-16 h-16 mb-4 text-foreground" />,
    hueA: 80, hueB: 120
  },
  {
    title: "One-Click Export",
    description: "Download your entire chat history instantly as a beautifully formatted JSON file.",
    icon: <Download className="w-16 h-16 mb-4 text-foreground" />,
    hueA: 100, hueB: 140
  },
  {
    title: "Immersive Themes",
    description: "Toggle between crisp light mode and deep, gorgeous dark mode effortlessly.",
    icon: <Moon className="w-16 h-16 mb-4 text-foreground" />,
    hueA: 205, hueB: 245
  },
  {
    title: "Fully Responsive",
    description: "A flawless experience whether you're on a massive desktop monitor or a mobile device.",
    icon: <Smartphone className="w-16 h-16 mb-4 text-foreground" />,
    hueA: 260, hueB: 290
  },
  {
    title: "Keyboard Accessible",
    description: "Navigate entirely by keyboard. Built with rigorous ARIA accessibility standards.",
    icon: <Keyboard className="w-16 h-16 mb-4 text-foreground" />,
    hueA: 290, hueB: 320
  },
  {
    title: "Syntax Highlighting",
    description: "Beautifully formatted code blocks with syntax highlighting built right in.",
    icon: <Code className="w-16 h-16 mb-4 text-foreground" />,
    hueA: 320, hueB: 350
  },
  {
    title: "Lightning Fast",
    description: "Powered by Next.js and Edge networking for instantaneous performance.",
    icon: <Zap className="w-16 h-16 mb-4 text-foreground" />,
    hueA: 10, hueB: 50
  }
];

const hue = (h: number) => `hsl(${h}, 100%, 50%)`;

const cardVariants: Variants = {
  offscreen: {
    y: 300,
  },
  onscreen: {
    y: 50,
    rotate: -10,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

function FeatureCard({ feature, i }: { feature: typeof features[0], i: number }) {
  const background = `linear-gradient(306deg, ${hue(feature.hueA)}, ${hue(feature.hueB)})`;

  return (
    <motion.div
      className={`card-container-${i} relative flex items-center justify-center overflow-hidden w-full max-w-[500px] mx-auto`}
      style={{ paddingTop: 20, marginBottom: -120 }}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ amount: 0.8 }}
    >
      {/* Background Splash */}
      <div 
        className="absolute inset-0" 
        style={{ 
          background,
          clipPath: `path("M 0 303.5 C 0 292.454 8.995 285.101 20 283.5 L 460 219.5 C 470.085 218.033 480 228.454 480 239.5 L 500 430 C 500 441.046 491.046 450 480 450 L 20 450 C 8.954 450 0 441.046 0 430 Z")`
        }} 
      />
      
      {/* Animated Card */}
      <motion.div 
        variants={cardVariants} 
        className="flex flex-col items-center justify-center text-center px-6 py-10 bg-background border border-border rounded-[20px] shadow-2xl z-10"
        style={{ 
          width: 300, 
          height: 430, 
          transformOrigin: "10% 60%",
          boxShadow: "0 0 1px hsl(0deg 0% 0% / 0.075), 0 0 2px hsl(0deg 0% 0% / 0.075), 0 0 4px hsl(0deg 0% 0% / 0.075), 0 0 8px hsl(0deg 0% 0% / 0.075), 0 0 16px hsl(0deg 0% 0% / 0.075)"
        }}
      >
        {feature.icon}
        <h3 className="text-2xl font-bold mb-4 text-foreground">{feature.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {feature.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground min-h-screen">
      
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF3E00]/10 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#FF9700]/10 rounded-full blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.5, 1], x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 max-w-4xl mx-auto space-y-8"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium border border-border"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#FF3E00] animate-pulse"></span>
            Next-Gen AI Interface Prototype
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            The Ultimate <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3E00] to-[#FF9700]">
              AI Experience.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A meticulously crafted frontend prototype showcasing the core essentials of top-tier AI platforms. Beautiful, responsive, and incredibly fast.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            <p className="text-sm text-muted-foreground animate-bounce mt-12">
              Scroll to explore features
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Spring Animation Features Section */}
      <section className="py-2 px-4 w-full relative z-10 bg-background">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-muted-foreground">
            Powerful Features
          </h2>
          <p className="text-muted-foreground mt-4 text-xl">Scroll down to see them pop into action.</p>
        </div>

        <div 
          style={{ 
            margin: "100px auto", 
            maxWidth: 500, 
            paddingBottom: 100, 
            width: "100%" 
          }}
        >
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} i={i} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 text-center relative z-10 bg-background mt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl w-full mx-auto space-y-6 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-secondary border border-border shadow-xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to Dive In?</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Experience the full AI interface prototype right now.
          </p>
          
          <div className="pt-6">
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-primary-foreground bg-primary rounded-full overflow-hidden shadow-lg hover:shadow-primary/30 transition-all"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#FF3E00] to-[#FF9700] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative z-10">Let&apos;s Start</span>
                <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground text-sm border-t border-border bg-background">
        <p>Built with Next.js, Tailwind CSS, and Framer Motion.</p>
      </footer>
    </div>
  );
}
