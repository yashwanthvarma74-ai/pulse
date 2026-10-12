import type { ErrorRequestHandler } from 'express';
import type { Logger } from 'pino';
import { HttpError } from '../errors';

export function errorHandler(logger: Logger): ErrorRequestHandler {
  // Express recognises an error handler by its four parameters, so _next has to stay.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (error, _req, res, _next) => {
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: { code: error.code, message: error.message } });
      return;
    }
    // Malformed JSON and oversized bodies are rejected by the body parser with their own status.
    const status = (error as { status?: unknown }).status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      res
        .status(status)
        .json({ error: { code: 'bad_request', message: 'The request body is not valid.' } });
      return;
    }
    logger.error({ err: error }, 'unhandled error');
    res.status(500).json({ error: { code: 'internal', message: 'Something went wrong.' } });
  };
}
