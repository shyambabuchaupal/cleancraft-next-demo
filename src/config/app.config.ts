/**
 * Application Configuration
 * Centralized configuration for the entire application
 */

export const appConfig = {
  name: 'CleanCraft',
  version: '1.0.0',
  description: 'Enterprise web solutions built with Next.js',

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
  },

  // Feature Flags
  features: {
    authentication: true,
    analytics: true,
    darkMode: true,
  },

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // URLs
  urls: {
    home: '/',
    about: '/about',
    contact: '/contact',
  },
};
