import { z } from '@hono/zod-openapi';

export const healthResponseSchema = z.object({
  status: z.string().openapi({ example: 'ok' }),
  timestamp: z.iso.date().openapi({ example: new Date().toISOString() }),
});
