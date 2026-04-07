"use client";
import Image from "next/image";
import clsx from "clsx";
import { Righteous } from "next/font/google";
import { useState, useMemo, useEffect } from "react";
import { quotesByChar } from "@/Constants/constants";
import useAppStore from "@/store";
import { motion } from "framer-motion";
import useSoundEffect from "@useverse/usesoundeffect";

const righteous = Righteous({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-righteous",
});

interface BgProps { }

export default function Bg({ }: BgProps) {
    const { theme } = useAppStore()
    const name = "Keerat Panwar";
    const nameArray = useMemo(() => name.split(""), [name]);

    const startupSound = useSoundEffect("/audio/chime.mp3", {
        volume: 0.15,
    });

    useEffect(() => {
        setTimeout(() => {
            startupSound.play();
        }, 2000);
    }, []);

    return (
        <div className="fixed inset-0">
            <Image
                src="/images/macos-monterey.jpg"
                alt="bg"
                fill
                onContextMenu={(e) => {
                    e.preventDefault();  
                }}
                onContextMenuCapture={(e) => {
                    e.preventDefault();
                }}
                placeholder="blur"
                blurDataURL="/images/macos-monterey.jpg"
                draggable={false}
                priority
                className={clsx(
                    theme ==="dark" && "brightness-75 -contrast-50",
                )}
            />
            <div className="absolute h-full w-full grid place-items-center">
                <div className="text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15, type: "spring", stiffness: 100, damping: 10 }}
                        className={clsx(
                            righteous.className,
                            "text-5xl text-white font-normal drop-shadow-[0_0_2px_rgba(0,0,0,0.5)] flex justify-center flex-wrap"
                        )}>
                        {nameArray.map((char, index) => (
                            <CharacterSpan key={index} character={char} delay={index * 50} />
                        ))}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25, type: "spring", stiffness: 100, damping: 10 }}
                        className="text-xl text-white font-normal drop-shadow-[0_0_2px_rgba(0,0,0,0.5)] mt-4">
                        <span>&quot;</span>
                        Building intelligent systems with AI, code, and curiosity.
                        <span>&quot;</span>
                    </motion.p>
                </div>
            </div>
        </div>
    );
}

interface CharacterSpanProps {
    character: string;
    delay: number;
}

function CharacterSpan({ character, delay }: CharacterSpanProps) {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    if (character === " ") {
        return <span className="w-4"></span>;
    }

    return (
        <span
            className={clsx(
                "relative cursor-pointer transition-all duration-300"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                transitionDelay: `${delay}ms`,
            }}
        >
            {character}
            {isHovered && (
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-sm px-2 py-1 rounded whitespace-nowrap z-10">
                    {getRandomQuoteStartingWith(character)}
                </span>
            )}
        </span>
    );
}

function getRandomQuoteStartingWith(character: string): string {
    const char = character;

    if (quotesByChar[char]) {
        const charQuotes = quotesByChar[char];
        return charQuotes[Math.floor(Math.random() * charQuotes.length)];
    }

    return "Phenomenal!";
}