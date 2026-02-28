import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
    navLayout: 'both' | 'top' | 'side';
    setNavLayout: (layout: 'both' | 'top' | 'side') => void;
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
