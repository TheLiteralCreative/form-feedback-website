# Directory Details

## 1. src/app/ (Next.js App Router)

### page.tsx
- Landing page with features overview
- Main entry point for the application

### dashboard/
User's workspace containing:
- View created forms
- See form submissions
- Access analytics dashboard
- Manage user settings

### forms/
Form management where users can:
- Create new forms
- Edit existing forms
- Preview forms before publishing
- Manage form settings

### api/
Backend endpoints handling:
- Form submission handling
- Payment processing integration
- File upload management
- Webhook handlers

## 2. src/components/

### forms/
Form building blocks including:
- Input fields (text, email, file uploads)
- Conditional logic controls
- Payment form elements
- Form preview components
- Form builder interface

### ui/
Reusable UI components:
- Buttons (primary, secondary, etc.)
- Cards (content containers)
- Modals (popups, dialogs)
- Loading states
- Error boundaries

### layout/
Page structure components:
- Navigation bars
- Sidebars
- Headers/Footers
- Page layouts
- Container components

## 3. src/lib/ (Core functionality)

### firebase.ts
Firebase setup and configuration:
- Authentication services
- File storage management
- Database operations
- Security rules

### stripe.ts
Payment processing:
- Stripe integration
- Payment methods
- Subscription handling
- Webhook processing

### validation.ts
Form validation rules:
- Input validation
- Form submission checks
- Data sanitization
- Error handling

### analytics.ts
Data collection and analysis:
- Usage tracking
- Form performance
- User behavior
- Response analytics

## 4. src/types/

TypeScript definitions for:
- Form structures
- User data interfaces
- API responses
- Database models
- Component props
- State management

## 5. public/

Static assets:
- Images
- Icons
- Fonts
- Public documents
- Favicon
- Manifest files

## Directory Organization Principles

### Component Organization
- Each component directory contains index file
- Separate styling in same directory
- Test files alongside components
- Shared types in types directory

### Code Separation
- Business logic in lib/
- UI components in components/
- Page layouts in layout/
- API routes in api/

### Type Safety
- All components typed
- API responses typed
- Database models typed
- Strict TypeScript configuration

### Testing Structure
- Unit tests alongside components
- Integration tests in __tests__
- E2E tests in cypress/
- Test utilities in test-utils/

## Best Practices

### File Naming
- Components: PascalCase
- Utilities: camelCase
- Types: PascalCase
- Constants: UPPER_CASE

### Code Organization
- One component per file
- Shared utilities in lib/
- Types near usage when specific
- Global types in types/

### Import Organization
- External imports first
- Internal absolute imports
- Internal relative imports
- Style imports last

### Component Structure
- Props interface first
- Component definition
- Hooks
- Helper functions
- Exports
