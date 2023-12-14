export class Errors extends Error {
  errors: Array<{
    errorType: string;
    message: string;
  }>;

  constructor(
    errors: Array<{
      errorType: string;
      message: string;
    }>
  ) {
    super();
    this.errors = errors;
    this.name = "Errors";
  }

  get message() {
    return this.errors.map((error) => error.message).join(", ");
  }
}
