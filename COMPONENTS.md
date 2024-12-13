# Form Builder Component System

## Directory Structure

```
components/forms/
├── builder/
│   ├── FormCanvas.tsx     # Main drag-and-drop area
│   ├── ToolboxPanel.tsx   # Available form elements
│   └── PropertiesPanel.tsx # Edit selected element
├── elements/
│   ├── TextInput.tsx      # Text/email/number inputs
│   ├── FileUpload.tsx     # File upload component
│   ├── PaymentField.tsx   # Stripe integration
│   └── ConditionalLogic.tsx # IF/THEN rules
└── preview/
    └── FormRenderer.tsx   # Live preview component
```

## Component Interaction Flow

1. Users drag elements from ToolboxPanel to FormCanvas
2. Selected elements can be customized via PropertiesPanel
3. Changes are reflected immediately in the preview
4. Form structure is maintained in state and can be saved/loaded

## Component Details

### Builder Components

#### FormCanvas.tsx
- Main drag-and-drop area for form elements
- Handles element positioning and ordering
- Manages form layout and structure
- Implements drag-and-drop zones

#### ToolboxPanel.tsx
- Displays available form elements
- Provides drag handles for elements
- Groups elements by category
- Shows element descriptions

#### PropertiesPanel.tsx
- Edit selected element properties
- Configure:
  - Field labels
  - Validation rules
  - Styling options
  - Dependencies between fields

### Form Elements

Each element is a self-contained component with:

#### Common Features
- Input handling
- Error handling
- Conditional logic hooks
- Validation system
- Style customization
- Accessibility support

#### TextInput.tsx
- Text input variations:
  - Single line text
  - Multi-line text
  - Email validation
  - Number formatting
  - URL validation
  - Phone number formatting

#### FileUpload.tsx
- File upload capabilities:
  - Multiple file support
  - File type restrictions
  - Size limitations
  - Upload progress
  - Preview capability

#### PaymentField.tsx
- Stripe integration:
  - Payment element
  - Price display
  - Currency handling
  - Payment validation

#### ConditionalLogic.tsx
- IF/THEN rule system:
  - Field visibility rules
  - Value-based conditions
  - Multi-field dependencies
  - Action triggers

### Preview Component

#### FormRenderer.tsx
- Live preview functionality:
  - Real-time updates
  - Mobile/desktop views
  - Validation testing
  - Submission simulation

## Component Properties

### Field Properties
- Labels and descriptions
- Placeholder text
- Required/optional status
- Help text
- Custom CSS classes

### Validation Rules
- Required fields
- Format validation
- Custom validation rules
- Error messages
- Cross-field validation

### Styling Options
- Theme customization
- Layout options
- Responsive behavior
- Custom CSS
- Brand colors

### Field Dependencies
- Show/hide conditions
- Value dependencies
- Calculation rules
- Custom triggers

## State Management

### Form State
- Element collection
- Element order
- Form settings
- Validation rules

### Element State
- Current values
- Validation status
- Error messages
- Dependency status

### UI State
- Selected element
- Drag operations
- Property panel view
- Preview mode

## Event Handling

### User Interactions
- Drag and drop
- Property updates
- Value changes
- Validation triggers

### System Events
- Form saving
- Data loading
- Preview updates
- Error handling

## Best Practices

### Component Development
- Use TypeScript for type safety
- Implement proper error boundaries
- Follow accessibility guidelines
- Maintain consistent styling
- Document props and methods

### State Management
- Use appropriate state solutions
- Implement undo/redo
- Handle edge cases
- Maintain data consistency

### Performance
- Optimize re-renders
- Lazy load components
- Cache form data
- Debounce updates

### Testing
- Unit test components
- Test drag and drop
- Validate form logic
- Test accessibility
- Performance testing
