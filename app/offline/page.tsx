"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";

export default function OfflinePage() {
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = async () => {
        setIsRetrying(true);
        
        // Wait a moment to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to reload the page
        if (navigator.onLine) {
            window.location.reload();
        } else {
            setIsRetrying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full text-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto mb-6 w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
                >
                    <WifiOff size={40} className="text-red-500" />
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
                >
                    Connection Lost
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                >
                    The Macintosh OS PWA couldn't load properly. This might be due to a network issue or the app being offline.
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                >
                    <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className={clsx(
                            "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200",
                            "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
                        )}
                    >
                        <RefreshCw 
                            size={18} 
                            className={clsx(
                                isRetrying && "animate-spin"
                            )} 
                        />
                        {isRetrying ? "Retrying..." : "Try Again"}
                    </button>

                    <Link
                        href="/"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                    >
                        <Home size={18} />
                        Go to Homepage
                    </Link>
                </motion.div>

                {/* Additional Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Tip:</strong> Check your internet connection or try refreshing the page. Some features may still work offline.
                    </p>
                </motion.div>

                {/* Status Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
                >
                    <div className={clsx(
                        "w-2 h-2 rounded-full",
                        navigator.onLine ? "bg-green-500" : "bg-red-500"
                    )}></div>
                    {navigator.onLine ? "Connection restored" : "Currently offline"}
                </motion.div>
            </motion.div>
        </div>
    );
}
