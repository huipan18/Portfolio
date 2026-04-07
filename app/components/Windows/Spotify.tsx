"use client";
import { experience } from "@/Constants/profile";

export default function Spotify() {
    return (
        <div className="grid gap-4 p-2">
            <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-transparent p-5">
                <p className="text-xs uppercase tracking-[0.24em] opacity-60 mb-2">Career Highlights</p>
                <h2 className="text-2xl font-semibold">Experience Timeline</h2>
                <p className="text-sm opacity-75 mt-2 max-w-2xl">
                    Internship and research experience across frontend engineering, UI/UX design, and computational research.
                </p>
            </div>

            <div className="grid gap-3">
                {experience.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0px_10px_30px_rgba(0,0,0,0.15)]">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                            <div>
                                <h3 className="text-lg font-semibold">{item.role}</h3>
                                <p className="opacity-80">{item.company}</p>
                            </div>
                            <div className="text-sm opacity-70">{item.period}</div>
                        </div>
                        <p className="text-sm opacity-65 mb-3">{item.stack}</p>
                        <div className="grid gap-2">
                            {item.points.map((point) => (
                                <p key={point} className="text-sm leading-6 opacity-85">• {point}</p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
