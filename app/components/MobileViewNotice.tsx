import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { profile } from "@/Constants/profile";

export default function MobileViewNotice() {
    return (
        <div className="min-[767px]:hidden min-h-[100dvh] flex flex-col">
            <motion.div initial={{ opacity: 0, x: "-100%" }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, type: "spring", stiffness: 100, damping: 10, delay: 0.25 }}>
                <Link href={profile.linkedin} target="_self" rel="noopener noreferrer" className="m-5 h-10 w-10 rounded-full grid place-items-center shadow-[0px_0px_5px] shadow-foreground/25 text-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700">
                    <span className="drop-shadow-md inset-shadow text-sm font-semibold">{profile.shortName}</span>
                </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, type: "spring", stiffness: 100, damping: 10, delay: 0.25 }}>
                <div className="mx-5 mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-violet-500/10 to-transparent p-6 shadow-[0px_5px_25px] shadow-foreground/10">
                    <p className="text-xs uppercase tracking-[0.24em] opacity-60 mb-3">Desktop-first Portfolio</p>
                    <h1 className="text-2xl font-semibold leading-[1.2] mb-2">Open the full OS portfolio on a larger screen</h1>
                    <p className="text-sm text-foreground/70 leading-6">This portfolio is designed as an interactive desktop experience with draggable windows, a dock, and multiple apps.</p>
                </div>
            </motion.div>

            <motion.div className="px-5 mt-6">
                <Link
                    href={profile.resumePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl w-full flex items-center group shadow-[0px_5px_25px] shadow-foreground/10 hover:shadow-foreground/15 transition-all duration-300 active:scale-95 active:opacity-75"
                >
                    <div>
                        <p className="text-white font-medium">Download Resume</p>
                        <p className="text-white/75 text-sm">Keerat Panwar</p>
                    </div>
                    <div className="h-[1px] ml-3 flex-1 bg-white/10 group-hover:bg-white/25 transition-all duration-300"></div>
                    <div className="h-7 w-7 rounded-full grid place-items-center bg-white/10 group-hover:bg-white/25 transition-all duration-300 group-hover:-rotate-12 group-active:scale-95 group-active:rotate-12">
                        <ArrowRight size={20} className="text-white" />
                    </div>
                </Link>
            </motion.div>

            <div className="mt-5 flex-1" />

            <motion.p initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, type: "spring", stiffness: 100, damping: 10, delay: 0.25 }} className="text-sm text-foreground/50 p-5 text-center">
                © {new Date().getFullYear()} {profile.name}. All rights reserved.
            </motion.p>
        </div>
    );
}
