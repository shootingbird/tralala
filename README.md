## SteadFast International eCommerce PWA

# Project Architecture
## Frontend (Next.js)
- Progressive Web App (PWA)
- Admin Dashboard
- Affiliate Marketing Portal
 
# Development Tools:
## Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- Lucide React (Icons)
- js-cookie (Storage Management)
- Redux Toolkit (State Management)
- React Query (API Data Fetching)
- Axios (HTTP Client)
- NextAuth.js (Authentication)
- Zod (Validation)
- React Hook Form

## Payment Integration
- Paystack
  - Payment Processing
  - Transaction Verification
  - Recurring Billing
  - Split Payments (for Affiliates)
  - Payment Analytics

## PWA Features
- Offline Support
- Push Notifications
- App Installation
- Service Workers
- Background Sync
- Cache Management

# Testing
- Jest
- React Testing Library
- Postman (API Testing)

# Context & State
- Auth Context
- Theme Context
- Cart State
- Payment State

# API Integration
- RESTful Endpoints
- Error Handling
- Request/Response Interceptors
- API Rate Limiting
- Data Caching
- Retry Logic

# Security
- CORS Configuration
- API Authentication
- Input Sanitization
- XSS Protection
- CSRF Protection





# Naming Conventions

## Folders
- PascalCase for component folders: `Components/`, `Pages/`, `Layouts/`
- camelCase for utility folders: `utils/`, `hooks/`, `contexts/`
- kebab-case for configuration files: `next-config/`

## Components
- PascalCase for component files: `ProductCard.tsx`, `NavBar.tsx`
- PascalCase for component names: `export default function ProductCard()`

## Files
- camelCase for utility files: `useAuth.ts`, `formatPrice.ts`
- kebab-case for configuration files: `tailwind-config.js`
- kebab-case for style files: `global-styles.css`

## Variables & Functions
- camelCase for variables: `productPrice`, `userDetails`
- camelCase for functions: `handleSubmit`, `calculateTotal`
- PascalCase for types and interfaces: `interface ProductType`

## Constants
- SCREAMING_SNAKE_CASE for constants: `MAX_PRICE`, `API_URL`

## CSS Classes
- kebab-case for custom classes: `product-grid`, `nav-item`
- Follow Tailwind CSS conventions for utility classes


# Git Commit Message Guide
Use the following prefixes to maintain consistency in commit messages:
 

feat: – For new features
Example: feat: add user profile page

fix: – For bug fixes
Example: fix: resolve login issue on mobile

minor: – For small updates or improvements
Example: minor: improve button hover effect

chore: – For maintenance tasks (e.g., dependency updates, refactoring)
Example: chore: update dependencies

docs: – For documentation updates
Example: docs: update API usage guide


refactor: – For restructuring code without changing functionality
Example: refactor: optimize database query logic

style: – For formatting, missing semicolons, whitespace, etc.
Example: style: fix indentation in Navbar.tsx

perf: – For performance improvements
Example: perf: reduce image loading time

test: – For adding or updating tests
Example: test: add unit tests for auth service

ci: – For changes related to CI/CD configurations
Example: ci: update GitHub Actions workflow




 
