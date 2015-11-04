'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ExtendableError = (function (_Error) {
  _inherits(ExtendableError, _Error);

  function ExtendableError(message) {
    _classCallCheck(this, ExtendableError);

    _get(Object.getPrototypeOf(ExtendableError.prototype), 'constructor', this).call(this, message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor.name);
  }

  return ExtendableError;
})(Error);

var APIError = (function (_ExtendableError) {
  _inherits(APIError, _ExtendableError);

  function APIError(message) {
    _classCallCheck(this, APIError);

    _get(Object.getPrototypeOf(APIError.prototype), 'constructor', this).call(this, message);
    this.statusCode = 500;
  }

  return APIError;
})(ExtendableError);

var LoginError = (function (_ExtendableError2) {
  _inherits(LoginError, _ExtendableError2);

  function LoginError(message) {
    _classCallCheck(this, LoginError);

    _get(Object.getPrototypeOf(LoginError.prototype), 'constructor', this).call(this, message);
    this.statusCode = 401;
  }

  return LoginError;
})(ExtendableError);

var TeapotError = (function (_ExtendableError3) {
  _inherits(TeapotError, _ExtendableError3);

  function TeapotError() {
    _classCallCheck(this, TeapotError);

    _get(Object.getPrototypeOf(TeapotError.prototype), 'constructor', this).call(this, 'I\'m a teapot.');
    this.statusCode = 418;
  }

  return TeapotError;
})(ExtendableError);

var NotImplementedError = (function (_ExtendableError4) {
  _inherits(NotImplementedError, _ExtendableError4);

  function NotImplementedError() {
    _classCallCheck(this, NotImplementedError);

    _get(Object.getPrototypeOf(NotImplementedError.prototype), 'constructor', this).call(this, 'Not Implemented.');
    this.statusCode = 501;
  }

  return NotImplementedError;
})(ExtendableError);

var NotFoundError = (function (_ExtendableError5) {
  _inherits(NotFoundError, _ExtendableError5);

  function NotFoundError() {
    var message = arguments.length <= 0 || arguments[0] === undefined ? 'Not Found.' : arguments[0];

    _classCallCheck(this, NotFoundError);

    _get(Object.getPrototypeOf(NotFoundError.prototype), 'constructor', this).call(this, message);
    this.statusCode = 404;
  }

  return NotFoundError;
})(ExtendableError);

var BadRequestError = (function (_ExtendableError6) {
  _inherits(BadRequestError, _ExtendableError6);

  function BadRequestError() {
    var message = arguments.length <= 0 || arguments[0] === undefined ? 'Bad Request.' : arguments[0];

    _classCallCheck(this, BadRequestError);

    _get(Object.getPrototypeOf(BadRequestError.prototype), 'constructor', this).call(this, message);
    this.statusCode = 400;
  }

  return BadRequestError;
})(ExtendableError);

var InternalServerError = (function (_ExtendableError7) {
  _inherits(InternalServerError, _ExtendableError7);

  function InternalServerError() {
    var message = arguments.length <= 0 || arguments[0] === undefined ? 'Internal Server Error.' : arguments[0];

    _classCallCheck(this, InternalServerError);

    _get(Object.getPrototypeOf(InternalServerError.prototype), 'constructor', this).call(this, message);
    this.statusCode = 500;
  }

  return InternalServerError;
})(ExtendableError);

var InvalidFlagError = (function (_ExtendableError8) {
  _inherits(InvalidFlagError, _ExtendableError8);

  function InvalidFlagError() {
    var message = arguments.length <= 0 || arguments[0] === undefined ? 'Flag is invalid.' : arguments[0];

    _classCallCheck(this, InvalidFlagError);

    _get(Object.getPrototypeOf(InvalidFlagError.prototype), 'constructor', this).call(this, message);
    this.statusCode = 400;
  }

  return InvalidFlagError;
})(ExtendableError);

exports['default'] = {
  API: APIError,
  Login: LoginError,
  Teapot: TeapotError,
  NotImplemented: NotImplementedError,
  BadRequest: BadRequestError,
  Internal: InternalServerError,
  InvalidFlag: InvalidFlagError,
  NotFound: NotFoundError
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QVc7QUFDbkIsZ0JBQWMsRUFBRSxtQkFBbUI7QUFDbkMsWUFBVSxFQUFFLGVBQWU7QUFDM0IsVUFBUSxFQUFFLG1CQUFtQjtBQUM3QixhQUFXLEVBQUUsZ0JBQWdCO0FBQzdCLFVBQVEsRUFBRSxhQUFhO0NBQ3hCIiwiZmlsZSI6ImVycm9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEV4dGVuZGFibGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZTtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHRoaXMuY29uc3RydWN0b3IubmFtZSk7XG4gIH1cbn1cblxuY2xhc3MgQVBJRXJyb3IgZXh0ZW5kcyBFeHRlbmRhYmxlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5zdGF0dXNDb2RlID0gNTAwO1xuICB9XG59XG5cbmNsYXNzIExvZ2luRXJyb3IgZXh0ZW5kcyBFeHRlbmRhYmxlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5zdGF0dXNDb2RlID0gNDAxO1xuICB9XG59XG5cbmNsYXNzIFRlYXBvdEVycm9yIGV4dGVuZHMgRXh0ZW5kYWJsZUVycm9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoJ0lcXCdtIGEgdGVhcG90LicpO1xuICAgIHRoaXMuc3RhdHVzQ29kZSA9IDQxODtcbiAgfVxufVxuXG5jbGFzcyBOb3RJbXBsZW1lbnRlZEVycm9yIGV4dGVuZHMgRXh0ZW5kYWJsZUVycm9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoJ05vdCBJbXBsZW1lbnRlZC4nKTtcbiAgICB0aGlzLnN0YXR1c0NvZGUgPSA1MDE7XG4gIH1cbn1cblxuY2xhc3MgTm90Rm91bmRFcnJvciBleHRlbmRzIEV4dGVuZGFibGVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSAnTm90IEZvdW5kLicpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLnN0YXR1c0NvZGUgPSA0MDQ7XG4gIH1cbn1cblxuY2xhc3MgQmFkUmVxdWVzdEVycm9yIGV4dGVuZHMgRXh0ZW5kYWJsZUVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSA9ICdCYWQgUmVxdWVzdC4nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5zdGF0dXNDb2RlID0gNDAwO1xuICB9XG59XG5cbmNsYXNzIEludGVybmFsU2VydmVyRXJyb3IgZXh0ZW5kcyBFeHRlbmRhYmxlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gJ0ludGVybmFsIFNlcnZlciBFcnJvci4nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5zdGF0dXNDb2RlID0gNTAwO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRGbGFnRXJyb3IgZXh0ZW5kcyBFeHRlbmRhYmxlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gJ0ZsYWcgaXMgaW52YWxpZC4nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5zdGF0dXNDb2RlID0gNDAwO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgQVBJOiBBUElFcnJvcixcbiAgTG9naW46IExvZ2luRXJyb3IsXG4gIFRlYXBvdDogVGVhcG90RXJyb3IsXG4gIE5vdEltcGxlbWVudGVkOiBOb3RJbXBsZW1lbnRlZEVycm9yLFxuICBCYWRSZXF1ZXN0OiBCYWRSZXF1ZXN0RXJyb3IsXG4gIEludGVybmFsOiBJbnRlcm5hbFNlcnZlckVycm9yLFxuICBJbnZhbGlkRmxhZzogSW52YWxpZEZsYWdFcnJvcixcbiAgTm90Rm91bmQ6IE5vdEZvdW5kRXJyb3Jcbn07XG4iXX0=