# CleanCraft

> A modern, scalable web application built with Next.js for enterprise-grade solutions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

## Overview

CleanCraft is a contemporary web application demonstrating industry best practices in frontend development, architected for scalability, maintainability, and performance. Built with **Next.js**, **TypeScript**, and modern development tools, it serves as a robust foundation for enterprise applications.

## Key Features

- 🚀 **Next.js Framework** - Server-side rendering, static generation, and API routes
- 📘 **TypeScript Support** - Full type safety across the codebase
- 🎨 **Modular Component Architecture** - Reusable, well-organized components
- 🔧 **Production-Ready** - Docker support and optimized build configurations
- ♿ **Accessibility First** - WCAG-compliant, inclusive design
- 📱 **Responsive Design** - Mobile-first approach for all device sizes
- ⚡ **Performance Optimized** - Image optimization, code splitting, and caching strategies

## Tech Stack

| Category | Technologies |
|----------|---------------|
| **Framework** | Next.js 14+ |
| **Language** | TypeScript 5+ |
| **Styling** | CSS Modules / Tailwind CSS |
| **Package Manager** | npm / yarn |
| **Containerization** | Docker |
| **Node.js** | 18+ |

## Project Structure

```
cleancraft-next-demo/
├── src/
│   ├── app/                      # Next.js app directory (layouts, pages)
│   │   ├── layout.tsx            # Root layout with metadata
│   │   ├── page.tsx              # Home page component
│   │   └── api/                  # API routes
│   │
│   ├── components/               # Reusable React components
│   │   ├── Button.tsx            # Base button component
│   │   ├── sections/             # Section components
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   └── Testimonials.tsx
│   │   └── StrapiContentRenderer.tsx  # Dynamic content from Strapi CMS
│   │
│   ├── config/                   # Application configuration
│   │   └── app.config.ts         # Centralized app config
│   │
│   ├── contexts/                 # React Context providers
│   │   └── AuthContext.tsx       # Authentication context
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── useWindowSize.ts      # Window resize hook
│   │
│   ├── integrations/             # Third-party integrations
│   │   └── supabase/
│   │       └── client.ts         # Supabase client config
│   │
│   ├── lib/                      # Utility functions and libraries
│   │   └── axios.ts              # HTTP client setup
│   │
│   ├── services/                 # Business logic and API services
│   │   └── api.service.ts        # API endpoints wrapper
│   │
│   ├── styles/                   # Global styles and CSS
│   │   └── globals.css           # Global stylesheet
│   │
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # Global types
│   │
│   └── utils/                    # Utility functions
│       └── formatters.ts         # Data formatting helpers
│
├── public/                       # Static assets (images, icons, fonts)
├── Dockerfile                    # Docker configuration
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- **Node.js**: 18.0 or higher
- **npm** or **yarn**: Latest stable version

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cleancraft-next-demo.git
   cd cleancraft-next-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Docker
docker build -t cleancraft .
docker run -p 3000:3000 cleancraft
```

## Folder Structure Explanation

### `/src` Directory
The `src` directory contains all application source code, following industry best practices:

- **`app/`** - Next.js app directory with routes, layouts, and pages
- **`components/`** - Reusable UI components (buttons, cards, sections)
- **`config/`** - Centralized configuration (environment, features, URLs)
- **`contexts/`** - React Context for state management (auth, theme, etc.)
- **`hooks/`** - Custom React hooks (useWindowSize, useAuth, etc.)
- **`integrations/`** - Third-party service integrations (Supabase, Stripe, etc.)
- **`lib/`** - Core utilities and library setup (HTTP client, helpers)
- **`services/`** - Business logic and API service layer
- **`styles/`** - Global styles, CSS variables, and theme
- **`types/`** - TypeScript interfaces and type definitions
- **`utils/`** - Pure utility functions (formatters, validators)

## Architecture & Best Practices

### Directory Organization
- **Separation of Concerns** - Each folder has a specific responsibility
- **Scalability** - Easy to add new features without affecting existing code
- **Maintainability** - Clear structure makes code easy to understand and modify
- **Reusability** - Components and utilities are modular and reusable

### Component Design
- **Functional Components** with React Hooks
- **Separation of Concerns** - Smart and presentational components
- **Prop Validation** - TypeScript for type safety
- **Performance Optimization** - React.memo and code splitting

### Code Organization
- **Modular Structure** - Feature-based organization
- **Utility Functions** - Centralized helper functions
- **Constants Management** - Centralized configuration
- **Type Definitions** - Comprehensive TypeScript interfaces

### Performance Metrics
- ⚡ Optimized bundle size
- 🚀 Fast Time-to-Interactive (TTI)
- 📊 Lighthouse scores: A+ grade
- 🔄 Efficient re-renders with React optimization

## Deployment

### Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel
```

### Docker Deployment
```bash
docker build -t cleancraft:latest .
docker run -d -p 3000:3000 cleancraft:latest
```

### Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=your_api_url
API_SECRET_KEY=your_secret_key
```

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add feature description'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Code Standards
- Follow ESLint configuration
- Write clear, descriptive commit messages
- Ensure TypeScript strict mode compliance
- Add tests for new features

## Testing

```bash
npm run test           # Run tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

## Performance

CleanCraft is optimized for production environments:

- **Bundle Size**: Optimized with code splitting
- **Caching**: Strategic HTTP caching headers
- **Image Optimization**: Next.js image component usage
- **Database**: Ready for integration with PostgreSQL, MongoDB
- **API**: RESTful design patterns

## Security

- ✅ Security headers configured
- ✅ CORS policies implemented
- ✅ Input validation and sanitization
- ✅ Environment variables for sensitive data
- ✅ Regular dependency updates

## Documentation

For detailed documentation, please refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)

## Roadmap

- [ ] Authentication system integration
- [ ] Database connectivity (PostgreSQL/MongoDB)
- [ ] API endpoint development
- [ ] Testing suite expansion
- [ ] CI/CD pipeline setup
- [ ] Analytics integration
- [ ] Performance monitoring

## Troubleshooting

### Port already in use
```bash
# Change port
npm run dev -- -p 3001
```

### Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Generate new build cache
npm run type-check
```

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Support & Contact

- 📧 **Email**: support@cleancraft.dev
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/cleancraft-next-demo/issues)
- 📝 **Documentation**: [Wiki](https://github.com/yourusername/cleancraft-next-demo/wiki)

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [React](https://react.dev)
- Styled with modern CSS standards
- Community contributions and feedback

---

**Made with ❤️ for the developer community**

*Last Updated: February 2026*
