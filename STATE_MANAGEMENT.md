# Form State Management

## Core State Interface

```typescript
// lib/state/formState.ts

interface FormState {
  elements: FormElement[];
  validation: ValidationRules;
  metadata: FormMetadata;
  ui: {
    selectedElement: string | null;
    isDragging: boolean;
    activePanel: 'toolbox' | 'properties';
  };
}

interface FormElement {
  id: string;
  type: string;
  properties: Record<string, any>;
  validation?: ValidationRule[];
}

interface ValidationRules {
  [elementId: string]: {
    rules: ValidationRule[];
    status: 'valid' | 'invalid' | 'pending';
    errors: string[];
  };
}

interface FormMetadata {
  id: string;
  title: string;
  created: Date;
  modified: Date;
  security: SecurityConfig;
}
```

## Custom Form Hook

```typescript
// lib/hooks/useFormBuilder.ts

interface FormBuilderOptions {
  initialData?: Partial<FormState>;
  resolver?: (formSchema: any) => ValidationRules;
}

export function useFormBuilder(options: FormBuilderOptions = {}) {
  // Form state management with React Hook Form
  const methods = useForm<FormState>({
    defaultValues: options.initialData,
    resolver: options.resolver
  });

  // Local UI state with Redux
  const dispatch = useDispatch();
  const uiState = useSelector(selectFormUIState);

  // Combine form operations
  const operations = {
    // Add new element to form
    addElement: (element: FormElement) => {
      const elements = methods.getValues('elements');
      methods.setValue('elements', [...elements, element]);
      dispatch(selectElement(element.id));
    },

    // Update existing element
    updateElement: (id: string, updates: Partial<FormElement>) => {
      const elements = methods.getValues('elements');
      const index = elements.findIndex(el => el.id === id);
      
      if (index !== -1) {
        elements[index] = { ...elements[index], ...updates };
        methods.setValue('elements', elements);
      }
    },

    // Handle element selection
    selectElement: (elementId: string) => {
      dispatch(selectElement(elementId));
    },

    // Handle drag and drop
    setDragging: (isDragging: boolean) => {
      dispatch(setDraggingState(isDragging));
    },

    // Switch active panel
    setActivePanel: (panel: 'toolbox' | 'properties') => {
      dispatch(setActivePanel(panel));
    }
  };

  return {
    ...methods,
    ...operations,
    uiState
  };
}
```

## Real-Time Validation

```typescript
// lib/validation/realTimeValidation.ts

interface ValidationContext {
  formState: FormState;
  element: FormElement;
  value: any;
}

class RealTimeValidator {
  private validationQueue: Map<string, NodeJS.Timeout> = new Map();

  validate(context: ValidationContext): Promise<ValidationResult> {
    return new Promise((resolve) => {
      // Clear existing validation timeout for this element
      if (this.validationQueue.has(context.element.id)) {
        clearTimeout(this.validationQueue.get(context.element.id));
      }

      // Set new validation timeout
      const timeoutId = setTimeout(async () => {
        const result = await this.executeValidation(context);
        resolve(result);
        this.validationQueue.delete(context.element.id);
      }, 300); // Debounce validation

      this.validationQueue.set(context.element.id, timeoutId);
    });
  }

  private async executeValidation(context: ValidationContext): Promise<ValidationResult> {
    const { element, value } = context;
    const rules = element.validation || [];

    for (const rule of rules) {
      const result = await this.validateRule(rule, value);
      if (!result.valid) {
        return result;
      }
    }

    return { valid: true };
  }

  private async validateRule(rule: ValidationRule, value: any): Promise<ValidationResult> {
    // Implement validation logic based on rule type
    switch (rule.type) {
      case 'required':
        return this.validateRequired(value);
      case 'pattern':
        return this.validatePattern(value, rule.pattern);
      case 'custom':
        return this.validateCustom(value, rule.validator);
      default:
        return { valid: true };
    }
  }
}
```

## Redux Integration

```typescript
// lib/state/formSlice.ts

const formSlice = createSlice({
  name: 'form',
  initialState: {
    ui: {
      selectedElement: null,
      isDragging: false,
      activePanel: 'toolbox' as const
    }
  },
  reducers: {
    selectElement: (state, action: PayloadAction<string>) => {
      state.ui.selectedElement = action.payload;
    },
    setDraggingState: (state, action: PayloadAction<boolean>) => {
      state.ui.isDragging = action.payload;
    },
    setActivePanel: (state, action: PayloadAction<'toolbox' | 'properties'>) => {
      state.ui.activePanel = action.payload;
    }
  }
});
```

## Usage Example

```typescript
// components/FormBuilder/FormBuilder.tsx

export function FormBuilder() {
  const {
    register,
    handleSubmit,
    watch,
    formState,
    addElement,
    updateElement,
    selectElement,
    uiState
  } = useFormBuilder({
    initialData: {
      elements: [],
      validation: {},
      metadata: {
        id: generateId(),
        title: 'New Form',
        created: new Date(),
        modified: new Date(),
        security: defaultSecurityConfig
      },
      ui: {
        selectedElement: null,
        isDragging: false,
        activePanel: 'toolbox'
      }
    }
  });

  // Watch for changes to trigger validation
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change') {
        validateField(name, value);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div className="form-builder">
      <Toolbox onAddElement={addElement} />
      <Canvas
        elements={formState.elements}
        selectedElement={uiState.selectedElement}
        onElementSelect={selectElement}
        onElementUpdate={updateElement}
      />
      <PropertiesPanel
        element={getSelectedElement()}
        onUpdate={updateElement}
      />
    </div>
  );
}
```

## State Management Best Practices

1. **Form State**
   - Use React Hook Form for form state
   - Implement real-time validation
   - Handle complex form operations

2. **UI State**
   - Use Redux for UI-specific state
   - Handle drag-and-drop state
   - Manage panel visibility

3. **Performance**
   - Debounce validation
   - Optimize re-renders
   - Cache form state

4. **Integration**
   - Connect with security features
   - Handle file uploads
   - Manage form submissions

## Next Steps

1. **Implementation**
   - Set up Redux store
   - Implement form validation
   - Add drag-and-drop
   - Create UI components

2. **Testing**
   - Unit test hooks
   - Test validation rules
   - Test state updates
   - Integration tests

3. **Optimization**
   - Performance monitoring
   - State persistence
   - Error handling
   - Loading states
