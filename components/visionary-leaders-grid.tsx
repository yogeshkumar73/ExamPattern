'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Profile data interface
interface ProfileData {
  id: number;
  name: string;
  designation: string;
  quote: string;
  country: string;
  badge: string;
  image: string;
  achievement: string;
}

// Mock data for visionary leaders
const PROFILE_DATA: ProfileData[] = [
  {
    id: 1,
    name: 'Dr. Rajesh Kumar',
    designation: 'Tech Innovator & Entrepreneur',
    quote: 'Innovation is the bridge between dreams and reality.',
    country: 'India',
    badge: '⭐ Founder',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    achievement: 'Founded 5 startups, 10,000+ lives impacted',
  },
  {
    id: 2,
    name: 'Priya Singh',
    designation: 'Education Revolutionary',
    quote: 'Education is the most powerful tool for changing the world.',
    country: 'India',
    badge: '👩‍🎓 Educator',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    achievement: 'Taught 50,000+ students, 15 schools',
  },
  {
    id: 3,
    name: 'Amit Patel',
    designation: 'Sustainability Leader',
    quote: 'A sustainable future is a shared responsibility.',
    country: 'India',
    badge: '🌿 Green Pioneer',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    achievement: 'Reduced emissions by 40%, 100 projects',
  },
  {
    id: 4,
    name: 'Neha Gupta',
    designation: 'Social Impact Architect',
    quote: 'Every individual has the power to create meaningful change.',
    country: 'India',
    badge: '❤️ Changemaker',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    achievement: 'Built 20 community centers, 100k beneficiaries',
  },
  {
    id: 5,
    name: 'Vikram Sharma',
    designation: 'Healthcare Visionary',
    quote: 'Health is wealth, and everyone deserves access to quality care.',
    country: 'India',
    badge: '⚕️ Health Hero',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    achievement: '200+ medical camps, 50,000+ lives saved',
  },
  {
    id: 6,
    name: 'Ananya Das',
    designation: 'Women Empowerment Champion',
    quote: 'Empowering women means empowering the nation.',
    country: 'India',
    badge: '👸 Champion',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    achievement: 'Trained 10,000+ women entrepreneurs',
  },
  {
    id: 7,
    name: 'Rohan Verma',
    designation: 'AI & Technology Pioneer',
    quote: 'Technology should serve humanity, not replace it.',
    country: 'India',
    badge: '🤖 Tech Visionary',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    achievement: 'Patents: 25, AI solutions in 50 sectors',
  },
  {
    id: 8,
    name: 'Divya Nair',
    designation: 'Climate Action Leader',
    quote: 'Our climate is our future—act today for tomorrow.',
    country: 'India',
    badge: '🌍 Eco Warrior',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    achievement: 'Planted 1M trees, climate initiatives in 10 states',
  },
];

// Slogans
const SLOGANS = [
  'One Nation, Infinite Possibilities',
  'Innovation Today, Prosperity Tomorrow',
  'Empowering Citizens, Transforming India',
  'Together We Rise, Together We Build',
  'Vision, Values, Victory',
  'Leading India Towards Excellence',
  'Future Ready, Globally Respected',
  'From Dreams to Development',
  'Unity in Purpose, Strength in Progress',
  'Building a Smarter and Stronger India',
];

// Individual Profile Card Component
const ProfileCard: React.FC<{ profile: ProfileData }> = ({ profile }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      className="h-full"
    >
      <div className="relative overflow-hidden rounded-2xl h-full backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group">
        {/* Glowing gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-transparent to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Profile Image Section */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-b from-orange-400/20 to-green-400/20">
          <motion.img
            src={profile.image}
            alt={profile.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Achievement Badge */}
          <motion.div
            className="absolute top-3 right-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {profile.badge}
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="p-4 relative z-10 flex flex-col">
          {/* Name */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
            {profile.name}
          </h3>

          {/* Designation */}
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-3 line-clamp-2">
            {profile.designation}
          </p>

          {/* Quote */}
          <div className="mb-3 h-12 overflow-hidden flex-grow">
            <p className="text-xs text-gray-600 dark:text-gray-300 italic border-l-2 border-orange-400 pl-2 leading-snug">
              "{profile.quote}"
            </p>
          </div>

          {/* Achievement */}
          <motion.div
            className="mb-3 p-2 rounded-lg bg-gradient-to-r from-orange-50/50 to-green-50/50 dark:from-orange-900/20 dark:to-green-900/20 border border-orange-200/30 dark:border-green-200/30"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              ✨ {profile.achievement}
            </p>
          </motion.div>

          {/* Country/Flag */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200/20 dark:border-gray-700/20">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              🇮🇳 {profile.country}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              View
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Grid Slider Component
const GridSlider: React.FC<{
  profiles: ProfileData[];
  columnsPerPage: number;
  rowsPerPage: number;
  autoPlaySpeed: number;
  pauseAnimation: boolean;
}> = ({ profiles, columnsPerPage, rowsPerPage, autoPlaySpeed, pauseAnimation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = columnsPerPage * rowsPerPage;
  const totalPages = Math.ceil(profiles.length / itemsPerPage);

  useEffect(() => {
    if (pauseAnimation) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, autoPlaySpeed * 1000);

    return () => clearInterval(interval);
  }, [pauseAnimation, autoPlaySpeed, totalPages]);

  const currentProfiles = profiles.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Pad with first profiles if not enough
  while (currentProfiles.length < itemsPerPage) {
    currentProfiles.push(profiles[currentProfiles.length % profiles.length]);
  }

  return (
    <div className="relative w-full">
      {/* Grid Container */}
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="w-full"
      >
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
            '@media (min-width: 640px)': {
              gridTemplateColumns: `repeat(${Math.min(columnsPerPage, 2)}, 1fr)`,
            },
            '@media (min-width: 1024px)': {
              gridTemplateColumns: `repeat(${columnsPerPage}, 1fr)`,
            },
          }}
        >
          {currentProfiles.map((profile, idx) => (
            <motion.div
              key={`${profile.id}-${currentPage}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <ProfileCard profile={profile} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => setCurrentPage(idx)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`h-3 rounded-full transition-all ${
              idx === currentPage
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 w-8'
                : 'bg-gray-300 dark:bg-gray-700 w-3 hover:bg-orange-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Main Component
export default function VisionaryLeadersGrid() {
  const [selectedSpeed, setSelectedSpeed] = useState(8);
  const [pauseAnimation, setPauseAnimation] = useState(false);
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const [gridLayout, setGridLayout] = useState<'2x2' | '3x2' | '4x2'>('3x2');
  const sloganIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const layoutConfig = {
    '2x2': { columns: 2, rows: 2 },
    '3x2': { columns: 3, rows: 2 },
    '4x2': { columns: 4, rows: 2 },
  };

  // Rotate slogans
  useEffect(() => {
    sloganIntervalRef.current = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
    }, 4000);
    return () => {
      if (sloganIntervalRef.current) clearInterval(sloganIntervalRef.current);
    };
  }, []);

  const config = layoutConfig[gridLayout];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/20 dark:bg-orange-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100/20 dark:bg-green-900/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <motion.section
        className="relative py-16 px-4 sm:px-6 lg:px-8 text-center z-10"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: false }}
      >
        {/* Main Heading */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Building the Vision of a Greater India
        </motion.h1>

        {/* Animated Slogan */}
        <motion.div
          className="mb-6 h-12 flex items-center justify-center"
          key={currentSlogan}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white max-w-2xl">
            {SLOGANS[currentSlogan]}
          </p>
        </motion.div>

        {/* Hero Vision Statement */}
        <motion.p
          className="max-w-3xl mx-auto text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-8 italic"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          "India's future is shaped by innovation, leadership, education, sustainability, and
          collective responsibility. Every visionary leader contributes to a stronger, smarter,
          and more inclusive nation. Together, we are creating a legacy of progress that inspires
          generations."
        </motion.p>

        {/* Controls */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* Speed Control */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Speed:</span>
            {[4, 6, 8, 10].map((speed) => (
              <motion.button
                key={speed}
                onClick={() => setSelectedSpeed(speed)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1 rounded-full font-bold text-sm transition-all ${
                  selectedSpeed === speed
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
                }`}
              >
                {speed}s
              </motion.button>
            ))}
          </div>

          {/* Grid Layout Control */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Layout:</span>
            {(['2x2', '3x2', '4x2'] as const).map((layout) => (
              <motion.button
                key={layout}
                onClick={() => setGridLayout(layout)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1 rounded-full font-bold text-sm transition-all ${
                  gridLayout === layout
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
                }`}
              >
                {layout}
              </motion.button>
            ))}
          </div>

          {/* Pause Button */}
          <motion.button
            onClick={() => setPauseAnimation(!pauseAnimation)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-1 rounded-full font-bold text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            {pauseAnimation ? '▶' : '⏸'}
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Grid Profiles Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false }}
          onMouseEnter={() => setPauseAnimation(true)}
          onMouseLeave={() => setPauseAnimation(false)}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Discover Our Visionary Leaders
          </h2>

          <GridSlider
            profiles={PROFILE_DATA}
            columnsPerPage={config.columns}
            rowsPerPage={config.rows}
            autoPlaySpeed={selectedSpeed}
            pauseAnimation={pauseAnimation}
          />
        </motion.div>
      </section>

      {/* Call to Action Section */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8 text-center z-10"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: false }}
      >
        <div className="max-w-2xl mx-auto backdrop-blur-md bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-green-500/10 border border-orange-200/30 dark:border-orange-600/30 rounded-2xl p-8 sm:p-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Join the Movement
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Become a visionary leader and contribute to building a greater India. Your ideas,
            innovations, and actions can create lasting change.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full font-bold text-white text-lg bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 shadow-xl transition-all"
          >
            Learn More About Our Mission
          </motion.button>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="relative py-12 px-4 text-center border-t border-gray-200 dark:border-gray-800 z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: false }}
      >
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Celebrating India's Visionary Leaders | Building a Stronger, Smarter, More Inclusive
          Nation
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-xs mt-4">
          © 2026 Visionary Leaders Initiative. All rights reserved.
        </p>
      </motion.footer>
    </div>
  );
}
