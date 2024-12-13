# Project Structure

This document outlines the planned file structure for the Form Feedback project. For detailed information about each directory's purpose and contents, see [DIRECTORY_DETAILS.md](DIRECTORY_DETAILS.md).

```
formfeedback/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── dashboard/         # User dashboard
│   │   │   └── page.tsx
│   │   └── forms/            # Form creation and management
│   │       ├── page.tsx
│   │       └── [formId]/
│   │           └── page.tsx
│   │
│   ├── components/            # Reusable components
│   │   ├── forms/            # Form builder components
│   │   │   ├── builder/
│   │   │   │   ├── FormBuilder.tsx
│   │   │   │   ├── ToolboxPanel.tsx
│   │   │   │   └── Canvas.tsx
│   │   │   ├── elements/
│   │   │   │   ├── TextInput.tsx
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   └── PaymentField.tsx
│   │   │   └── preview/
│   │   │       └── FormRenderer.tsx
│   │   ├── ui/              # UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Card.tsx
│   │   └── layout/          # Layout components
│   │
│   ├── lib/                 # Utility functions
│   │   ├── firebase.ts     # Firebase configuration
│   │   └── stripe.ts       # Stripe configuration
│   │
│   ├── types/              # TypeScript type definitions
│   │
│   ├── public/             # Static files
│   │
│   ├── styles/             # Global styles
│   │
│   └── config/             # Configuration files
│
├── public/                 # Static files
├── package.json           # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── postcss.config.js     # PostCSS configuration

## Implementation Order

We'll create directories and files as needed, following this logical progression:

1. Start with basic structure and authentication
2. Add form builder components
3. Implement file upload functionality
4. Add payment integration
5. Build out the dashboard

## Directory Details

### `/src/app`
Next.js App Router pages structure for routing and page components.

### `/src/components`
Reusable components organized by feature:
- `forms/`: Form-specific components
- `ui/`: General UI components
- `layout/`: Layout-related components

### `/src/lib`
Utility functions and third-party service configurations:
- Firebase setup
- Stripe integration
- Other utility functions

### `/src/types`
TypeScript type definitions and interfaces.

### `/src/public`
Static assets and files.

### `/src/styles`
Global styles and theme configurations.

### `/src/config`
Application configuration files and constants.
