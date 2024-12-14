import { rest } from 'msw';

export const handlers = [
  // Form API handlers
  rest.post('/api/forms', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ id: '123', success: true })
    );
  }),

  // File upload handlers
  rest.post('/api/uploads', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        fileId: '456',
        url: 'https://example.com/file.pdf',
        metadata: {
          filename: 'test.pdf',
          size: 1024,
          type: 'application/pdf'
        }
      })
    );
  }),

  // Authentication handlers
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'test-token',
        user: {
          id: 'user-123',
          email: 'test@example.com'
        }
      })
    );
  })
];
