"use client"
import { useEffect } from 'react';
import { useSettings } from '@/lib/store';
import { useStore } from 'zustand';

export function useCustomTheme() {
    const settings = useStore(useSettings, (state) => state.settings);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const root = document.documentElement;
            
            // Apply custom background color
            if (settings?.customBgColor) {
                root.style.setProperty('--custom-bg-color', settings.customBgColor);
                document.body.style.backgroundColor = settings.customBgColor;
            }
            
            // Apply custom background image
            if (settings?.bgImage) {
                document.body.style.backgroundImage = `url(${settings.bgImage})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundAttachment = 'fixed';
                document.body.style.backgroundRepeat = 'no-repeat';
                
                // Apply opacity overlay
                const opacity = settings?.bgImageOpacity || 0.3;
                root.style.setProperty('--bg-image-opacity', opacity);
                
                // Create overlay if it doesn't exist
                let overlay = document.getElementById('bg-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'bg-overlay';
                    overlay.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: ${settings.customBgColor};
                        opacity: ${1 - opacity};
                        pointer-events: none;
                        z-index: -1;
                    `;
                    document.body.appendChild(overlay);
                } else {
                    overlay.style.backgroundColor = settings.customBgColor;
                    overlay.style.opacity = 1 - opacity;
                }
            } else {
                document.body.style.backgroundImage = 'none';
                const overlay = document.getElementById('bg-overlay');
                if (overlay) {
                    overlay.remove();
                }
            }
            
            // Apply custom accent color
            if (settings?.customAccentColor) {
                root.style.setProperty('--custom-accent-color', settings.customAccentColor);
            }
            
            // Apply smooth scrolling
            if (settings?.smoothScroll) {
                root.style.scrollBehavior = 'smooth';
            } else {
                root.style.scrollBehavior = 'auto';
            }
            
            // Apply compact mode
            if (settings?.compactMode) {
                root.classList.add('compact-mode');
            } else {
                root.classList.remove('compact-mode');
            }
            
            // Apply animations
            if (settings?.animations === false) {
                root.classList.add('no-animations');
            } else {
                root.classList.remove('no-animations');
            }
            
            // Apply hardware acceleration
            if (settings?.hwAccel === false) {
                root.classList.add('no-hw-accel');
            } else {
                root.classList.remove('no-hw-accel');
            }
        }
    }, [settings]);
}
