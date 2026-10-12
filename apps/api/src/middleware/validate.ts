import type { z } from 'zod';
import { HttpError } from '../errors';

// Parses untrusted input at the API boundary and turns a failure into a 400 with readable issues.
export function parse<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new HttpError(
      400,
      'invalid_request',
      result.error.issues[0]?.message ?? 'Invalid request.',
    );
  }
  return result.data;
}
