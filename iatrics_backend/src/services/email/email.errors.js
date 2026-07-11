class EmailError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = "EmailError";
    this.code = code;
    this.details = details;
  }
}

class EmailValidationError extends EmailError {
  constructor(message, details = {}) {
    super(message, "EMAIL_VALIDATION_ERROR", details);
    this.name = "EmailValidationError";
  }
}

class EmailProviderError extends EmailError {
  constructor(message, details = {}) {
    super(message, "EMAIL_PROVIDER_ERROR", details);
    this.name = "EmailProviderError";
  }
}

module.exports = {
  EmailError,
  EmailProviderError,
  EmailValidationError,
};
