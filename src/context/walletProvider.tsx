'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import '@rainbow-me/rainbowkit/styles.css';
import {
    RainbowKitProvider,
    lightTheme,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { config } from '@/utils/wagmiConfig';

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();
    const [primaryColor, setPrimaryColor] = useState<string>('');

    useEffect(() => {
        // Get CSS variable value from :root
        const rootStyles = getComputedStyle(document.documentElement);
        const primary = rootStyles.getPropertyValue('--primary').trim();

        // If your CSS variable is in HSL format without the hsl() wrapper, add it here:
        // For example: "222.2 47.4% 11.2%" => `hsl(222.2, 47.4%, 11.2%)`
        if (primary) {
            setPrimaryColor(`hsl(${primary})`);
        }
    }, []);

    const theme = resolvedTheme === 'dark'
        ? darkTheme({
            accentColor: 'white',
            accentColorForeground: 'black',
            borderRadius: 'medium',
            overlayBlur: 'small',
        })
        : lightTheme({
            accentColor: primaryColor || 'black', // fallback if not loaded yet
            accentColorForeground: 'white',
            borderRadius: 'medium',
            overlayBlur: 'small',
        });

    // Optional: render null or loader if primaryColor not loaded yet
    if (!primaryColor && resolvedTheme !== 'dark') {
        return null;
    }

    return (
        <WagmiProvider config={config}>
            <RainbowKitProvider theme={theme}>
                {children}
            </RainbowKitProvider>
        </WagmiProvider>
    );
}
