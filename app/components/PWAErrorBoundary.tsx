"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PWAErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PWA Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          {/* Background blur overlay */}
          <div className="absolute inset-0 backdrop-blur-xl bg-white/30 dark:bg-black/20" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 0.5,
              type: "spring" as const, 
              stiffness: 300, 
              damping: 25,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="relative max-w-sm w-full"
          >
            {/* Main error card with glassmorphism */}
            <div className="relative backdrop-blur-2xl bg-white/70 dark:bg-slate-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/30 overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              
              {/* Content */}
              <div className="relative px-8 py-8">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 20 }}
                  className="flex items-center justify-center mb-6"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-b from-red-400 to-red-500 dark:from-red-500 dark:to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                    <AlertTriangle size={28} className="text-white" strokeWidth={2} />
                  </div>
                </motion.div>

                {/* Title and message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-center mb-6"
                >
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 leading-tight">
                    Something went wrong
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    The app encountered an unexpected error and needs to restart.
                  </p>
                </motion.div>

                {/* Development error details */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="mb-6"
                  >
                    <div className="backdrop-blur-xl bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Bug size={14} className="text-slate-500 dark:text-slate-400" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          Debug Info
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all leading-relaxed">
                        {this.state.error.message}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="space-y-3"
                >
                  {/* Primary action */}
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <RefreshCw size={16} />
                    Restart App
                  </button>

                  {/* Secondary action */}
                  <Link href="/" className="block">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-200/50 dark:hover:bg-slate-600/50 active:bg-slate-300/50 dark:active:bg-slate-500/50 rounded-2xl transition-all duration-200 backdrop-blur-xl border border-slate-200/50 dark:border-slate-600/50 transform hover:scale-[1.02] active:scale-[0.98]">
                      <Home size={16} />
                      Go Home
                    </button>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Floating elements for depth */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-sm"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-md"
            />
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}