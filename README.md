# Vardhman Mills Project

This project follows a monorepo structure with three main applications: Admin Panel, Frontend Store, and Backend API.

## Project Structure

```
vardhman_mills/
├── admin/                      # Admin Dashboard Application
│   ├── public/                # Static files
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── src/
│   │   ├── app/              # Next.js 13+ App Router
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/       # React components
│   │   ├── context/         # React context providers
│   │   ├── lib/            # Utility functions and libraries
│   │   └── pages/          # Additional pages
|   ├── .env.local
|   ├── .env.local.example
|   ├── .gitignore
│   ├── eslint.config.mjs    # ESLint configuration
│   ├── next-env.d.ts       # Next.js TypeScript declarations
│   ├── next.config.ts      # Next.js configuration
│   ├── package.json        # Dependencies and scripts
│   ├── postcss.config.mjs  # PostCSS configuration
│   ├── README.md          # Admin application documentation
│   └── tsconfig.json      # TypeScript configuration
│
├── backend/                # Backend API Server
│   ├── src/
│   │   ├── app.ts         # Express application setup
│   │   ├── server.ts      # Server entry point
│   │   ├── __tests__/     # Test files
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── database/      # Database configurations and migrations
│   │   ├── events/        # Event handlers
│   │   ├── jobs/          # Background jobs and schedulers
│   │   ├── logs/          # Application logs
│   │   ├── middlewares/   # Express middlewares
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic services
│   │   ├── types/         # TypeScript type definitions
│   │   ├── uploads/       # File upload directory
│   │   ├── utils/         # Utility functions
│   │   └── validators/    # Input validation schemas
|   ├── .env
|   ├── .env.example
|   ├── .env.production
|   ├── .env.test
|   ├── .gitignore
│   ├── package.json       # Dependencies and scripts
│   ├── README.md         # Backend application documentation
│   └── tsconfig.json     # TypeScript configuration
│
├── frontend/              # Customer-facing Store Application
│   ├── public/           # Static files
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── src/
│   │   ├── __tests__/    # Test files
│   │   ├── app/          # Next.js 13+ App Router
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/   # React components
│   │   │   ├── auth/     # Authentication components
│   │   │   ├── cart/     # Shopping cart components
│   │   │   ├── checkout/ # Checkout flow components
│   │   │   ├── common/   # Shared components
│   │   │   ├── products/ # Product-related components
│   │   │   └── ui/       # UI components library
│   │   ├── constants/    # Application constants
│   │   ├── context/     # React context providers
│   │   ├── data/        # Static data and mock data
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions and libraries
│   │   ├── middleware/  # Next.js middleware
│   │   ├── pages/       # Next.js pages
│   │   │   ├── _app.tsx
│   │   │   ├── _document.tsx
│   │   │   ├── index.tsx
│   │   │   ├── api/     # API routes
│   │   │   ├── auth/    # Authentication pages
│   │   │   ├── checkout/ # Checkout pages
│   │   │   ├── orders/  # Order management pages
│   │   │   ├── products/ # Product pages
│   │   │   └── profile/ # User profile pages
│   │   ├── store/       # State management
│   │   ├── styles/      # Global styles
│   │   └── types/       # TypeScript type definitions
|   ├── .env.local
|   ├── .env.local.example
|   ├── .gitignore
│   ├── eslint.config.mjs # ESLint configuration
│   ├── next-env.d.ts    # Next.js TypeScript declarations
│   ├── next.config.ts   # Next.js configuration
│   ├── package.json     # Dependencies and scripts
│   ├── postcss.config.mjs # PostCSS configuration
│   ├── README.md        # Frontend application documentation
│   └── tsconfig.json    # TypeScript configuration
│
├── package.json          # Root package.json for workspace management
└── README.md            # Main project documentation (this file)
```

## Applications Overview

### Admin Dashboard (`/admin`)
- Next.js-based admin panel for managing the e-commerce platform
- TypeScript for type safety
- Modern app router architecture

### Backend API (`/backend`)
- Express.js-based REST API server
- TypeScript implementation
- Modular architecture with clear separation of concerns
- Includes authentication, file handling, and business logic

### Frontend Store (`/frontend`)
- Next.js-based e-commerce storefront
- TypeScript implementation
- Feature-rich components for shopping experience
- Includes cart, checkout, and user profile management

## Technology Stack

- **Frontend & Admin**: Next.js, TypeScript, React
- **Backend**: Node.js, Express.js, TypeScript
- **Development Tools**: ESLint, PostCSS, TypeScript

## Getting Started

Each application has its own README.md with specific setup instructions. Please refer to:
- `/admin/README.md` for Admin Dashboard setup
- `/backend/README.md` for Backend API setup
- `/frontend/README.md` for Frontend Store setup

## License

[License details to be added]
