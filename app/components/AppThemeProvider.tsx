"use client";

import useAppStore from "@/store";
import { Toaster } from "react-hot-toast";
import clsx from "clsx";
import { useLocalStorage } from "@/store/useLocalStorage";
import { useEffect, useRef } from "react";
import MobileViewNotice from "./MobileViewNotice";
import { useWindowSize } from "react-use";
import { motion } from "framer-motion";
import LiquidGlassCursor from "./Windows/components/LiquidGlassCursor";

export default function AppThemeProvider({ children, className }: { children: React.ReactNode, className?: string }) {
    const { theme, allowCookies, timeFormat, liquidGlassCursor, sentToDesktop, setTheme, setAllowCookies, setTimeFormat, setLiquidGlassCursor, setSentToDesktop } = useAppStore();
    const [storedAppSettings, setStoredAppSettings] = useLocalStorage("app-settings", {
        theme: "dark",
        timeFormat: "24",
        allowCookies: false,
        liquidGlassCursor: false,
        isDefault: false
    });
    const [storedSentToDesktop, setStoredSentToDesktop] = useLocalStorage("sentToDesktopItems", {
        items: [] as any[],
        isDefault: true
    });

    const { width } = useWindowSize();


    useEffect(() => {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

        if (storedAppSettings.allowCookies) {
            setTheme(storedAppSettings.theme as "dark" | "light");
            setAllowCookies(storedAppSettings.allowCookies);
            setTimeFormat(storedAppSettings.timeFormat as "24" | "12");
            setLiquidGlassCursor(storedAppSettings.liquidGlassCursor);
            return;
        }
        setTheme(systemTheme);
    }, [storedAppSettings]);

    // Hydrate sentToDesktop from localStorage only once to avoid save/load loops
    const hasHydratedSentRef = useRef(false);
    useEffect(() => {
        if (hasHydratedSentRef.current) return;
        if (storedSentToDesktop.items !== undefined) {
            setSentToDesktop(storedSentToDesktop.items);
            hasHydratedSentRef.current = true;
        }
    }, [storedSentToDesktop]);

    useEffect(() => {
        if (!allowCookies) return;
        setStoredAppSettings({ theme, allowCookies, timeFormat, liquidGlassCursor, isDefault: false });
    }, [theme, allowCookies, timeFormat, liquidGlassCursor]);

    useEffect(() => {
        if (!allowCookies) {
            console.log('⚠️ Cookies disabled - sentToDesktop changes will not be persisted:', sentToDesktop);
            return;
        }
        console.log('💾 Saving sentToDesktop to localStorage:', sentToDesktop);
        setStoredSentToDesktop(prev => ({ ...prev, items: sentToDesktop }));
    }, [sentToDesktop, allowCookies]);

    return (
        <body className={clsx(theme === "dark" ? "app-dark" : "app-light", className)}>
            {liquidGlassCursor && <LiquidGlassCursor />}
            <Toaster position="top-right" reverseOrder={false} toastOptions={{
                style: {
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#fff',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                }
            }} />
            <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.05, delay: 0.05 }}
            className="">{width > 767 ? children : <MobileViewNotice />}</motion.div>
        </body>
    )
}
