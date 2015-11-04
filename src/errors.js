class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

class APIError extends ExtendableError {
  constructor(message) {
    super(message);
    this.statusCode = 500;
  }
}

class LoginError extends ExtendableError {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

class TeapotError extends ExtendableError {
  constructor() {
    super('I\'m a teapot.');
    this.statusCode = 418;
  }
}

class NotImplementedError extends ExtendableError {
  constructor() {
    super('Not Implemented.');
    this.statusCode = 501;
  }
}

class NotFoundError extends ExtendableError {
  constructor(message = 'Not Found.') {
    super(message);
    this.statusCode = 404;
  }
}

class BadRequestError extends ExtendableError {
  constructor(message = 'Bad Request.') {
    super(message);
    this.statusCode = 400;
  }
}

class InternalServerError extends ExtendableError {
  constructor(message = 'Internal Server Error.') {
    super(message);
    this.statusCode = 500;
  }
}

class InvalidFlagError extends ExtendableError {
  constructor(message = 'Flag is invalid.') {
    super(message);
    this.statusCode = 400;
  }
}

export default {
  API: APIError,
  Login: LoginError,
  Teapot: TeapotError,
  NotImplemented: NotImplementedError,
  BadRequest: BadRequestError,
  Internal: InternalServerError,
  InvalidFlag: InvalidFlagError,
  NotFound: NotFoundError
};
