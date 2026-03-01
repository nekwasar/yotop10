import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
    navLayout: 'both' | 'top';
    setNavLayout: (layout: 'both' | 'top') => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            navLayout: 'both',
            setNavLayout: (layout) => set({ navLayout: layout }),
        }),
        { name: 'yotop10-ui-prefs' }
    )
)
