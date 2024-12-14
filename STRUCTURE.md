# Application Structure

## Directory Organization

```
src/app/
├── (auth)/                 # Authentication routes group
│   ├── login/             
│   │   └── page.tsx       # Login page
│   ├── register/          
│   │   └── page.tsx       # Registration page
│   └── layout.tsx         # Shared auth layout
│
├── dashboard/             # User dashboard
│   ├── page.tsx          # Main dashboard view
│   ├── loading.tsx       # Loading UI
│   ├── error.tsx         # Error handling
│   └── forms/            # Form management
│       ├── [formId]/     # Dynamic form routes
│       │   ├── page.tsx  # Form detail/edit
│       │   └── analytics/# Form analytics
│       ├── submissions/  # Form submissions
│       └── new/          # New form creation
│           └── page.tsx
│
├── api/                  # API routes
│   ├── forms/           
│   │   └── route.ts     # Form CRUD operations
│   ├── uploads/         
│   │   └── route.ts     # File upload handling
│   └── webhooks/        
│       └── stripe/      # Payment processing
│           └── route.ts
│
├── layout.tsx            # Root layout
├── page.tsx             # Home page
└── providers.tsx        # Global providers
```

## Route Structure

### Authentication Routes
- `/login` - User authentication
- `/register` - New user registration
- Protected by AuthGuard middleware

### Dashboard Routes
- `/dashboard` - Main user dashboard
- `/dashboard/forms/new` - Create new form
- `/dashboard/forms/[formId]` - Edit existing form
- `/dashboard/forms/[formId]/analytics` - Form analytics
- `/dashboard/forms/[formId]/submissions` - View submissions

### API Routes
- `/api/forms` - Form management endpoints
- `/api/uploads` - File upload handling
- `/api/webhooks/stripe` - Payment processing

## Component Organization

### Layout Components
```typescript
// Root Layout
// src/app/layout.tsx
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <Providers>
          <Navigation />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

// Auth Layout
// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-container">
      <AuthHeader />
      {children}
    </div>
  );
}
```

### Page Components
```typescript
// Dashboard Page
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  return (
    <DashboardLayout>
      <FormsList />
      <AnalyticsSummary />
      <RecentActivity />
    </DashboardLayout>
  );
}

// Form Editor Page
// src/app/dashboard/forms/[formId]/page.tsx
export default async function FormEditorPage({
  params
}: {
  params: { formId: string }
}) {
  return (
    <FormEditorLayout>
      <FormBuilder />
      <SecurityPanel />
      <SubmissionSettings />
    </FormEditorLayout>
  );
}
```

### API Routes
```typescript
// Form API Route
// src/app/api/forms/route.ts
export async function GET(request: Request) {
  // List forms
}

export async function POST(request: Request) {
  // Create new form
}

// Upload API Route
// src/app/api/uploads/route.ts
export async function POST(request: Request) {
  // Handle file upload with security
}
```

## Key Features

### Authentication
- Protected routes
- Session management
- Role-based access

### Form Management
- Dynamic form builder
- Real-time validation
- File upload integration
- Security settings

### Dashboard
- Form analytics
- Submission management
- User settings
- Activity tracking

### API Integration
- RESTful endpoints
- File processing
- Webhook handling
- Error management

## Development Guidelines

1. **Route Organization**
   - Group related routes
   - Use dynamic routes for IDs
   - Implement proper error boundaries
   - Add loading states

2. **Component Structure**
   - Maintain clear hierarchy
   - Use shared layouts
   - Implement proper TypeScript types
   - Follow naming conventions

3. **API Design**
   - RESTful principles
   - Proper error handling
   - Request validation
   - Rate limiting

4. **Security**
   - Route protection
   - Input validation
   - CSRF protection
   - API authentication

## Next Steps

1. **Implementation Priority**
   - Set up base layouts
   - Implement auth flow
   - Create form builder
   - Add API endpoints

2. **Security Integration**
   - Add auth middleware
   - Implement form validation
   - Set up file security
   - Add API protection

3. **Feature Development**
   - Build dashboard UI
   - Create form editor
   - Add analytics
   - Implement submissions

4. **Testing & Deployment**
   - Write component tests
   - Add API tests
   - Set up CI/CD
   - Configure monitoring
