import { createHonoServer } from 'react-router-hono-server/node';
import { app } from './hono-app';

// Re-export the app for Vercel serverless functions
export { app };

export default await createHonoServer({
  app,
  defaultLogger: false,
});
