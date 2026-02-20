'use client';

import React from 'react';

interface Testimonial {
  name: string;
  company: string;
  message: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'John Doe',
    company: 'Tech Corp',
    message: 'CleanCraft helped us modernize our infrastructure efficiently.',
    avatar: '👨‍💼',
  },
  {
    name: 'Jane Smith',
    company: 'Innovation Inc',
    message: 'The performance improvements were immediate and significant.',
    avatar: '👩‍💼',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-3">{testimonial.avatar}</span>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.message}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
