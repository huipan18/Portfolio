"use client";
import { Righteous } from "next/font/google";
import clsx from "clsx";
import { ArrowUpRight, Download, Github, Linkedin, Mail, Phone } from "lucide-react";
import Link from "next/link";
import useSoundEffect from "@useverse/usesoundeffect";
import { profile } from "@/Constants/profile";

const righteous = Righteous({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-righteous",
});

export default function Finder() {
    const linkHoverSound = useSoundEffect("/audio/link-hover.mp3", { volume: 0.15 });
    const clickSound = useSoundEffect("/audio/mouse-click.mp3", { volume: 0.5 });

    const quickLinks = [
        { label: "GitHub", href: profile.github, icon: Github },
        { label: "LinkedIn", href: profile.linkedin, icon: Linkedin },
        { label: "Resume", href: profile.resumePath, icon: Download },
        { label: "Email", href: `mailto:${profile.email}`, icon: Mail },
        { label: "Call", href: `tel:${profile.phone.replace(/\s+/g, "")}`, icon: Phone },
    ];

    return (
        <div className="p-3 grid gap-5">
            <div className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0px_10px_40px_rgba(0,0,0,0.2)]">
                <div className="h-24 w-24 rounded-full shrink-0 bg-gradient-to-br from-blue-500 via-violet-500 to-fuchsia-500 grid place-items-center text-white text-3xl font-semibold shadow-lg">
                    {profile.shortName}
                </div>
                <div className="grid gap-2">
                    <div>
                        <h3 className={clsx(righteous.className, "text-2xl font-medium")}>{profile.name}</h3>
                        <p className="text-sm opacity-70 mt-1">{profile.title}</p>
                    </div>
                    <p className="text-sm opacity-85 leading-6 max-w-2xl">{profile.summary}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                        {profile.focusAreas.map((item) => (
                            <span key={item} className="rounded-full border border-foreground/15 bg-background/70 px-3 py-1 text-xs opacity-90">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {quickLinks.map(({ label, href, icon: Icon }) => (
                    <Link
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-background flex items-center gap-2 justify-center shadow-[0px_5px_25px_rgba(0,0,0,0.05)] px-5 py-3 text-sm rounded-full w-fit cursor-pointer hover:border-foreground/20 border border-foreground/5 active:scale-95 transition-all duration-300 active:opacity-75"
                        onMouseEnter={() => linkHoverSound.play()}
                        onClick={() => clickSound.play()}
                    >
                        <Icon size={18} />
                        {label}
                        <ArrowUpRight size={14} className="opacity-60" />
                    </Link>
                ))}
            </div>

            <div className="grid gap-3">
                <p className="text-sm uppercase tracking-[0.24em] opacity-60">Core Stack</p>
                <div className="flex flex-wrap gap-2">
                    {profile.skillBadges.map((skill) => (
                        <div
                            key={skill}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition-colors duration-300"
                        >
                            {skill}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
