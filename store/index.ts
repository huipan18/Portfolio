import { create } from "zustand";
import { LaunchpadApp } from "@/Constants/constants";

interface AppState {
    theme: "dark" | "light";
    setTheme: (theme: "dark" | "light") => void;
    timeFormat: "12" | "24";
    setTimeFormat: (timeFormat: "12" | "24") => void;
    allowCookies: boolean;
    setAllowCookies: (allowCookies: boolean) => void;
    liquidGlassCursor: boolean;
    setLiquidGlassCursor: (liquidGlassCursor: boolean) => void;
    sentToDesktop: LaunchpadApp[];
    setSentToDesktop: (apps: LaunchpadApp[]) => void;
    addToDesktop: (app: LaunchpadApp) => void;
    removeFromDesktop: (appId: string) => void;
}

const useAppStore = create<AppState>((set) => ({
    theme: "dark",
    setTheme: (theme) => {
        set({ theme });
        
    },
    timeFormat: "24",
    setTimeFormat: (timeFormat) => set({ timeFormat }),
    allowCookies: false,
    setAllowCookies: (allowCookies) => set({ allowCookies }),
    liquidGlassCursor: false,
    setLiquidGlassCursor: (liquidGlassCursor) => set({ liquidGlassCursor }),
    sentToDesktop: [],
    setSentToDesktop: (apps) => {
        set((state) => {
            const prevIds = state.sentToDesktop.map(a => a.id).join('|');
            const nextIds = apps.map(a => a.id).join('|');
            if (prevIds === nextIds) return state; // no-op
            return { sentToDesktop: apps };
        });
    },
    addToDesktop: (app) => set((state) => {
        console.log({ 
            sentToDesktop: [...state.sentToDesktop, { ...app, id: `${app.id}-${Date.now()}` }] 
        })
        return {
            sentToDesktop: [...state.sentToDesktop, { ...app, id: `${app.id}-${Date.now()}` }] 
        }
    }),
    removeFromDesktop: (appId) => set((state) => ({ 
        sentToDesktop: state.sentToDesktop.filter(app => app.id !== appId) 
    })),
}));

export default useAppStore;