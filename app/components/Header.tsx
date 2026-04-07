"use client";

import useAppStore from "@/store";
import clsx from "clsx";
import { LucideMail, WifiOff, Wifi, WifiLow } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useSoundEffect from "@useverse/usesoundeffect";
import { useOnlineStatus } from "@/util/Hooks/useOnlineStatus";
import { profile } from "@/Constants/profile";

export default function Header() {
    const linkHoverSound = useSoundEffect("/audio/link-hover.mp3", { volume: 0.15 });
    const clickSound = useSoundEffect("/audio/mouse-click.mp3", { volume: 0.5 });

    const { timeFormat } = useAppStore();
    const { connectionStatus, isChecking, refresh } = useOnlineStatus();

    const [time, setTime] = useState(() => {
        return timeFormat === "12"
            ? new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(
                timeFormat === "12"
                    ? new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                    : new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
            );
        }, 1000);
        return () => clearInterval(timer);
    }, [timeFormat]);

    return (
        <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={clsx("fixed top-0 left-0 z-[999] w-[100dvw]", "bg-background/50 border-b border-foreground/30")}
        >
            <div className="relative py-2 px-10">
                <div className="absolute top-0 left-0 w-full h-full -z-10 with-lg backdrop-blur-[4px]"></div>
                <div className="w-full flex items-center justify-between">
                    <Link
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open LinkedIn"
                        className="flex items-center gap-2 group"
                        onMouseEnter={() => linkHoverSound.play()}
                        onClick={() => clickSound.play()}
                    >
                        <div className="h-7 w-7 rounded-full grid place-items-center shadow-[0px_0px_5px] shadow-foreground/25 text-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700">
                            <span className="drop-shadow-md inset-shadow text-sm font-semibold">{profile.shortName}</span>
                        </div>
                        <p
                            className={clsx(
                                "text-base font-medium relative",
                                "after:absolute after:-bottom-0.5 after:h-[1.5px] after:w-3 after:bg-foreground after:left-0",
                                "group-hover:after:w-full after:transition-all after:duration-300 group-hover:after:opacity-50"
                            )}
                        >
                            {profile.name}
                        </p>
                    </Link>
                    <div className="flex items-center gap-5">
                        <Link
                            href={`mailto:${profile.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm group relative"
                            onMouseEnter={() => linkHoverSound.play()}
                            onClick={() => clickSound.play()}
                        >
                            <p
                                className={clsx(
                                    "flex items-center gap-1",
                                    "after:absolute after:-bottom-0.5 after:h-[1.5px] after:w-[0.925rem] after:bg-foreground after:left-0",
                                    "group-hover:after:w-full after:transition-all after:duration-300 group-hover:after:opacity-50"
                                )}
                            >
                                <LucideMail size={15} className="text-foreground opacity-100 group-hover:opacity-80" />
                                <span className="opacity-80 group-hover:opacity-100 font-medium">{profile.email}</span>
                            </p>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div
                                className={clsx("flex items-center gap-1 cursor-pointer group", isChecking ? "animate-pulse" : "animate-none")}
                                onClick={() => {
                                    refresh();
                                    clickSound.play();
                                }}
                                title={`Connection: ${connectionStatus}${isChecking ? " (checking...)" : ""} - Click to refresh`}
                            >
                                {connectionStatus === "online" ? (
                                    <Wifi size={14} className="text-foreground/70 group-hover:text-foreground" />
                                ) : connectionStatus === "slow" ? (
                                    <WifiLow size={14} className="text-foreground/70 group-hover:text-foreground" />
                                ) : (
                                    <WifiOff size={14} className="text-foreground/70 group-hover:text-foreground" />
                                )}
                            </div>
                            <div className="w-[1px] h-4 bg-foreground/30"></div>
                            <p className="font-medium text-sm">{new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long" })}</p>
                            <div className="w-[1px] h-4 bg-foreground/30"></div>
                            <p className="font-medium text-sm">{time}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
