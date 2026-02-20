'use client';

import React from 'react';
import { Button } from '../Button';

export const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="text-center text-white max-w-2xl mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Welcome to CleanCraft
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Enterprise-grade web solutions built with modern technologies
        </p>
        <Button variant="primary" className="mr-4">
          Get Started
        </Button>
        <Button variant="secondary">Learn More</Button>
      </div>
    </section>
  );
};
