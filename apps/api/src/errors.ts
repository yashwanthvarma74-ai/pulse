export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const unauthorized = () => new HttpError(401, 'unauthorized', 'Sign in to continue.');
