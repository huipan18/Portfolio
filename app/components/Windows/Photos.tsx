"use client";
import { certifications, education } from "@/Constants/profile";
import { Award, GraduationCap } from "lucide-react";

export default function Photos() {
    return (
        <div className="grid gap-4 p-2">
            <div className="grid md:grid-cols-2 gap-4">
                <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-2xl bg-blue-500/15 grid place-items-center">
                            <GraduationCap size={20} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] opacity-60">Education</p>
                            <h2 className="text-xl font-semibold">Academic Background</h2>
                        </div>
                    </div>
                    <div className="grid gap-3">
                        {education.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-white/10 bg-background/40 p-4">
                                <h3 className="font-semibold">{item.degree}</h3>
                                <p className="text-sm opacity-80 mt-1">{item.school}</p>
                                <p className="text-sm opacity-65 mt-2">{item.period}</p>
                                <p className="text-sm opacity-75 mt-1">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-2xl bg-violet-500/15 grid place-items-center">
                            <Award size={20} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] opacity-60">Credentials</p>
                            <h2 className="text-xl font-semibold">Certifications & Assessments</h2>
                        </div>
                    </div>
                    <div className="grid gap-3">
                        {certifications.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-white/10 bg-background/40 p-4">
                                <h3 className="font-semibold">{item.title}</h3>
                                <p className="text-sm opacity-70 mt-2">{item.date}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
