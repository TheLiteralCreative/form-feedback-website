# Testing Strategy

## Testing Levels

### 1. Unit Testing

```typescript
// __tests__/components/FormField.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { FormField } from '@/components/FormField';

describe('FormField Component', () => {
  it('validates required fields correctly', () => {
    const { getByRole, getByText } = render(
      <FormField
        type="text"
        required={true}
        validation={[{ type: 'required', message: 'Field is required' }]}
      />
    );

    const input = getByRole('textbox');
    fireEvent.blur(input);
    
    expect(getByText('Field is required')).toBeInTheDocument();
  });
});

// __tests__/utils/validation.test.ts
import { validateField } from '@/utils/validation';

describe('Field Validation', () => {
  it('validates email format correctly', async () => {
    const result = await validateField('email', 'invalid-email');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid email format');
  });
});

// __tests__/state/formState.test.ts
import { formReducer } from '@/state/formReducer';

describe('Form State Management', () => {
  it('updates form element correctly', () => {
    const initialState = {
      elements: [{ id: '1', type: 'text', value: '' }]
    };
    
    const action = {
      type: 'UPDATE_ELEMENT',
      payload: { id: '1', value: 'new value' }
    };
    
    const newState = formReducer(initialState, action);
    expect(newState.elements[0].value).toBe('new value');
  });
});
```

### 2. Integration Testing

```typescript
// __tests__/integration/FormBuilder.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { FormBuilder } from '@/components/FormBuilder';
import { Provider } from 'react-redux';
import { store } from '@/store';

describe('Form Builder Integration', () => {
  it('creates and validates a complete form', async () => {
    const { getByText, getByLabelText } = render(
      <Provider store={store}>
        <FormBuilder />
      </Provider>
    );

    // Add form field
    fireEvent.click(getByText('Add Field'));
    fireEvent.click(getByText('Text Input'));

    // Configure field
    const fieldConfig = getByLabelText('Field Label');
    fireEvent.change(fieldConfig, { target: { value: 'Email' } });

    // Add validation
    fireEvent.click(getByText('Add Validation'));
    fireEvent.click(getByText('Email'));

    // Verify field is added with validation
    await waitFor(() => {
      expect(getByText('Email')).toBeInTheDocument();
      expect(getByText('Email validation')).toBeInTheDocument();
    });
  });
});

// __tests__/integration/FileUpload.test.tsx
describe('File Upload System', () => {
  it('handles file upload with security checks', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    const { getByLabelText, getByText } = render(<FileUpload />);
    
    const input = getByLabelText('Upload File');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(getByText('File uploaded successfully')).toBeInTheDocument();
    });
  });
});
```

### 3. E2E Testing

```typescript
// e2e/formCreation.spec.ts
import { test, expect } from '@playwright/test';

test('complete form creation flow', async ({ page }) => {
  await page.goto('/forms/new');
  
  // Login
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');

  // Create form
  await page.click('[data-testid="create-form"]');
  await page.fill('[data-testid="form-title"]', 'Test Form');
  
  // Add fields
  await page.click('[data-testid="add-field"]');
  await page.click('[data-testid="field-type-text"]');
  
  // Configure security
  await page.click('[data-testid="security-settings"]');
  await page.check('[data-testid="require-auth"]');
  
  // Save form
  await page.click('[data-testid="save-form"]');
  
  // Verify form created
  await expect(page.getByText('Form created successfully')).toBeVisible();
});
```

### 4. Security Testing

```typescript
// __tests__/security/inputValidation.test.ts
describe('Input Validation Security', () => {
  it('prevents XSS attacks', async () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const result = await validateInput(maliciousInput);
    expect(result.sanitized).not.toContain('<script>');
  });
});

// __tests__/security/fileUpload.test.ts
describe('File Upload Security', () => {
  it('blocks malicious files', async () => {
    const maliciousFile = new File(['test'], 'malicious.exe', { type: 'application/x-msdownload' });
    const result = await validateFile(maliciousFile);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('File type not allowed');
  });
});
```

### 5. Performance Testing

```typescript
// __tests__/performance/formLoading.test.ts
describe('Form Loading Performance', () => {
  it('loads large form within threshold', async () => {
    const startTime = performance.now();
    
    await renderLargeForm(100); // form with 100 fields
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(1000); // should load in less than 1s
  });
});
```

## Test Setup

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}'
  ]
};
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' }
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' }
    }
  ]
};

export default config;
```

### MSW Setup

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/api/forms', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ id: '123', success: true })
    );
  }),
  
  rest.post('/api/upload', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ fileId: '456', url: 'https://example.com/file.pdf' })
    );
  })
];
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Testing Best Practices

1. **Unit Testing**
   - Test individual components in isolation
   - Mock dependencies
   - Focus on business logic
   - Maintain high coverage

2. **Integration Testing**
   - Test component interactions
   - Verify state management
   - Test API integrations
   - Validate form workflows

3. **E2E Testing**
   - Test complete user flows
   - Verify critical paths
   - Test across browsers
   - Include mobile testing

4. **Security Testing**
   - Regular security audits
   - Penetration testing
   - Input validation
   - File upload security

5. **Performance Testing**
   - Load testing
   - Response times
   - Resource usage
   - Database optimization

## Next Steps

1. **Setup Testing Environment**
   - Configure Jest and RTL
   - Set up Playwright
   - Configure MSW
   - Set up CI/CD

2. **Implement Test Suites**
   - Write component tests
   - Create integration tests
   - Develop E2E scenarios
   - Add security tests

3. **Performance Monitoring**
   - Set up metrics
   - Create benchmarks
   - Monitor trends
   - Optimize bottlenecks
