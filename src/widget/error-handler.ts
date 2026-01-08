export const ERROR_MESSAGE =
  "Chat failed to load. Clear chat or try again in a moment.";
export class CustomError extends Error {
  constructor(message: string, public details?: string, public code?: string) {
    super(message);
    this.name = "CustomError";
  }
}

export function handleError(error: Error) {
  if (error instanceof CustomError) {
    if (error.details) {
      console.error("Details:", error.details);
    }
  }
}
