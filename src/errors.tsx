export class OAuthError extends Error {
  constructor(public error: string, public error_description?: string) {
    super(error_description || error);
  }
}
