export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public details?: any
  ) {
    super(message);
  }
}
