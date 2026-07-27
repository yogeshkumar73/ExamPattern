// Example: app/leaders/page.tsx
// How to use the Visionary Leaders component in your Next.js app

import VisionaryLeaders from '@/components/visionary-leaders';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visionary Leaders of India | Building the Vision of a Greater India',
  description:
    "Discover India's visionary leaders who are innovating, leading, and transforming the nation. Explore profiles of changemakers in technology, education, sustainability, and social impact.",
  keywords: [
    'visionary leaders',
    'india',
    'innovation',
    'education',
    'sustainability',
    'leadership',
    'entrepreneurs',
  ],
  openGraph: {
    title: 'Visionary Leaders of India',
    description: "India's future shaped by visionary leaders and innovators",
    type: 'website',
  },
};

export default function LeadersPage() {
  return (
    <main className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Optional: Add header/navigation here */}
      {/* <Header /> */}

      {/* Main Visionary Leaders Component */}
      <VisionaryLeaders />

      {/* Optional: Add footer here */}
      {/* <Footer /> */}
    </main>
  );
}

/*
=============================================================================
ALTERNATIVE: Add to existing homepage
=============================================================================

// app/page.tsx
import VisionaryLeaders from '@/components/visionary-leaders';
import Hero from '@/components/hero';
import Features from '@/components/features';
import CTA from '@/components/cta';

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <VisionaryLeaders />
      <CTA />
    </main>
  );
}

=============================================================================
ALTERNATIVE: As a modal/overlay component
=============================================================================

'use client';

import { useState } from 'react';
import VisionaryLeaders from '@/components/visionary-leaders';

export function LeadersModal() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-full font-bold"
      >
        View Visionary Leaders
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full h-full max-h-screen overflow-y-auto">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-[60] px-4 py-2 bg-white dark:bg-gray-800 rounded-full font-bold"
        >
          ✕ Close
        </button>
        <VisionaryLeaders />
      </div>
    </div>
  );
}

=============================================================================
ALTERNATIVE: As part of landing page with sections
=============================================================================

'use client';

import VisionaryLeaders from '@/components/visionary-leaders';

export default function LandingPage() {
  return (
    <main className="w-full">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            India Leaders
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 font-semibold">
              About
            </button>
            <button className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 font-semibold">
              Leaders
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-full font-bold">
              Join Us
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <VisionaryLeaders />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 to-green-600 text-white py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Make an Impact?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join India's community of visionary leaders shaping the future.
        </p>
        <button className="px-8 py-4 bg-white text-orange-600 font-bold rounded-full hover:bg-gray-100 transition-all">
          Get Started Today
        </button>
      </section>
    </main>
  );
}

=============================================================================
ENVIRONMENT VARIABLES (optional)
=============================================================================

// .env.local
NEXT_PUBLIC_LEADERS_ANIMATION_SPEED=10
NEXT_PUBLIC_ENABLE_DARK_MODE=true

// Then in component:
const defaultSpeed = parseInt(process.env.NEXT_PUBLIC_LEADERS_ANIMATION_SPEED || '10');

=============================================================================
TAILWIND CONFIG CHECK
=============================================================================

// tailwind.config.ts - Ensure these settings are present

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Color theme matches Visionary Leaders
      colors: {
        india: {
          saffron: '#FF9933',
          white: '#FFFFFF',
          green: '#138808',
          navy: '#000080',
        },
      },
    },
  },
  darkMode: 'class', // Enable dark mode support
  plugins: [],
};

=============================================================================
NEXT.JS CONFIG CHECK
=============================================================================

// next.config.mjs - Ensure React strict mode is enabled

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Add other image domains as needed
    ],
  },
};

export default nextConfig;

=============================================================================
FRAMER MOTION SETUP
=============================================================================

// Ensure framer-motion is installed
// npm install framer-motion
// pnpm add framer-motion
// yarn add framer-motion

// In component - already imported:
// import { motion } from 'framer-motion';

// No additional config needed - works out of the box!

=============================================================================
QUICK START COMMAND
=============================================================================

# 1. Install dependencies
pnpm add framer-motion

# 2. Copy component to project
# cp visionary-leaders.tsx components/

# 3. Start dev server
pnpm dev

# 4. Navigate to your page
# http://localhost:3000/leaders

*/
