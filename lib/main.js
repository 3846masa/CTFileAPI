// Import
'use strict';

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('babel/polyfill');

var _bluebird = require('bluebird');

var _sourceMapSupport = require('source-map-support');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _appRootPath = require('app-root-path');

var _appRootPath2 = _interopRequireDefault(_appRootPath);

var _jsSha3 = require('js-sha3');

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportTwitter = require('passport-twitter');

var _errors = require('./errors');

var _errors2 = _interopRequireDefault(_errors);

// Promisify

(0, _sourceMapSupport.install)();

(0, _bluebird.promisifyAll)(_fs2['default']);

// Variable
var app = (0, _express2['default'])();
var twitterStrategy = new _passportTwitter.Strategy({
  consumerKey: process.env['TWITTER_CONSUMER_KEY'] || _config2['default'].get('TWITTER_CONSUMER_KEY'),
  consumerSecret: process.env['TWITTER_CONSUMER_SECRET'] || _config2['default'].get('TWITTER_CONSUMER_SECRET'),
  callbackURL: _url2['default'].resolve(process.env['ROOT_URL'] || _config2['default'].get('ROOT_URL'), 'auth/twitter/callback')
}, function (token, tokenSecret, profile, done) {
  done(null, profile);
});

var schema = new _sequelize2['default']('database', null, null, {
  dialect: 'sqlite',
  storage: _path2['default'].resolve(_appRootPath2['default'].path, 'database.sqlite')
});
var models = schema.models;

var staticPath = _path2['default'].resolve(_appRootPath2['default'].path, 'static');

// Settings
// // Database
schema.define('User', {
  userID: {
    type: _sequelize2['default'].INTEGER,
    allowNull: false,
    primaryKey: true
  },
  userName: _sequelize2['default'].TEXT,
  displayName: _sequelize2['default'].TEXT,
  iconUrl: _sequelize2['default'].TEXT,
  score: {
    type: _sequelize2['default'].INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});
schema.define('Score', {
  userID: {
    type: _sequelize2['default'].INTEGER,
    allowNull: false
  },
  questionNameHash: {
    type: _sequelize2['default'].STRING,
    allowNull: false
  },
  score: {
    type: _sequelize2['default'].INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  indexes: [{ fields: ['userID'] }, { fields: ['questionNameHash'] }]
});

// // Passport
_passport2['default'].use(twitterStrategy);
_passport2['default'].serializeUser(function (user, done) {
  (function callee$1$0() {
    var userData;
    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          userData = {
            userID: user.id,
            userName: user.username,
            displayName: user.displayName,
            iconUrl: user.photos[0].value
          };
          context$2$0.next = 3;
          return regeneratorRuntime.awrap(models.User.findOrCreate({
            where: { userID: user.id },
            'default': userData
          }));

        case 3:
          context$2$0.next = 5;
          return regeneratorRuntime.awrap(models.User.update(userData, {
            where: { userID: user.id },
            slient: true
          }));

        case 5:
          return context$2$0.abrupt('return', { userID: user.id });

        case 6:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  })().then(function (val) {
    return done(null, val);
  })['catch'](done);
});

_passport2['default'].deserializeUser(function (obj, done) {
  done(null, obj);
});

// // Express
app.use((0, _morgan2['default'])('combined'));
app.use((0, _cookieParser2['default'])());
app.use(_bodyParser2['default'].json());
app.use((0, _expressSession2['default'])({
  secret: 'testctf',
  resave: true,
  saveUninitialized: true
}));
app.use(_passport2['default'].initialize());
app.use(_passport2['default'].session());

app.use('/', _express2['default']['static'](staticPath));

// Routing
app.get('/', function (req, res) {
  res.json({ 'status': 'ok' });
});

app.get('/questionList.json', function (req, res, next) {
  (function callee$1$0() {
    var filesAndFolders, folders;
    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.next = 2;
          return regeneratorRuntime.awrap(_fs2['default'].readdirAsync(staticPath));

        case 2:
          filesAndFolders = context$2$0.sent;
          folders = filesAndFolders.filter(function (file) {
            var stat = _fs2['default'].statSync(_path2['default'].resolve(staticPath, file));
            return stat.isDirectory();
          });

          res.json(folders);

        case 5:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  })()['catch'](next);
});

app.get('/auth/twitter', _passport2['default'].authenticate('twitter'));

app.get('/auth/twitter/callback', _passport2['default'].authenticate('twitter', {
  successRedirect: '/user',
  failureRedirect: '/error/login'
}));

app.get('/login', function (req, res) {
  if (!req.user) res.redirect('/auth/twitter');else res.redirect('/user');
});

app.get('/user', function (req, res, next) {
  (function callee$1$0() {
    var userData;
    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          if (req.user) {
            context$2$0.next = 2;
            break;
          }

          throw new _errors2['default'].Login('Login is required.');

        case 2:
          context$2$0.next = 4;
          return regeneratorRuntime.awrap(models.User.findOne({ where: { userID: req.user.userID } }));

        case 4:
          userData = context$2$0.sent;

          if (userData) {
            context$2$0.next = 7;
            break;
          }

          throw new _errors2['default'].Login('Login is required.');

        case 7:
          Object.assign(userData, { userID: undefined });
          res.json({ 'status': 'ok', 'user': userData });

        case 9:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  })()['catch'](next);
});

app.get('/scores', function (req, res, next) {
  (function callee$1$0() {
    var data;
    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.next = 2;
          return regeneratorRuntime.awrap(models.User.all({ sort: 'score' }));

        case 2:
          data = context$2$0.sent;

          data = data.map(function (info) {
            return Object.assign(info, { userID: undefined });
          });
          res.json({ 'status': 'ok', 'scores': data });

        case 5:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  })()['catch'](next);
});

app.post('/submit', function (req, res, next) {
  (function callee$1$0() {
    var userData, questionPath, flagPath, trueFlagHash, userFlagHash, questionName, questionNameHash, score, query, scoreInfo;
    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          if (req.get('Content-Type').includes('application/json')) {
            context$2$0.next = 2;
            break;
          }

          throw new _errors2['default'].BadRequest('Should to set "Content-Type: application/json".');

        case 2:
          if (req.user) {
            context$2$0.next = 4;
            break;
          }

          throw new _errors2['default'].Login('Login is required.');

        case 4:
          context$2$0.next = 6;
          return regeneratorRuntime.awrap(models.User.findOne({ where: { userID: req.user.userID } }));

        case 6:
          userData = context$2$0.sent;

          if (userData) {
            context$2$0.next = 9;
            break;
          }

          throw new _errors2['default'].Login('Login is required.');

        case 9:
          if (!(!req.body.question || !req.body.flag)) {
            context$2$0.next = 11;
            break;
          }

          throw new _errors2['default'].BadRequest('Require question name and flag.');

        case 11:
          questionPath = _path2['default'].resolve(staticPath, req.body.question);

          if (questionPath.includes(staticPath)) {
            context$2$0.next = 14;
            break;
          }

          throw new _errors2['default'].BadRequest('Invalid question name.');

        case 14:
          context$2$0.next = 16;
          return regeneratorRuntime.awrap(_fs2['default'].statAsync(questionPath)['catch'](function () {
            throw new _errors2['default'].NotFound('Question is not found.');
          }));

        case 16:
          flagPath = _path2['default'].resolve(questionPath, 'FLAG.sha3-512');
          context$2$0.next = 19;
          return regeneratorRuntime.awrap(_fs2['default'].readFileAsync(flagPath).then(function (hash) {
            return hash.toString().replace(/\s/g, '').toLowerCase();
          })['catch'](function (err) {
            throw new _errors2['default'].Internal(err.stack);
          }));

        case 19:
          trueFlagHash = context$2$0.sent;
          userFlagHash = (0, _jsSha3.sha3_512)(req.body.flag).replace(/\s/g, '').toLowerCase();

          if (!(trueFlagHash === userFlagHash)) {
            context$2$0.next = 40;
            break;
          }

          questionName = _path2['default'].relative(staticPath, questionPath);
          questionNameHash = (0, _jsSha3.sha3_512)(questionName).replace(/\s/g, '').toLowerCase();
          score = parseInt(questionName.split('-')[1], 10) || 0;
          query = {
            userID: userData.userID,
            questionNameHash: questionNameHash
          };
          context$2$0.next = 28;
          return regeneratorRuntime.awrap(models.Score.findOne(query));

        case 28:
          scoreInfo = context$2$0.sent;

          if (scoreInfo) {
            context$2$0.next = 37;
            break;
          }

          context$2$0.next = 32;
          return regeneratorRuntime.awrap(models.Score.create(Object.assign({}, query, { score: score })));

        case 32:
          context$2$0.next = 34;
          return regeneratorRuntime.awrap(models.User.update({ score: userData.score + score }, { where: { userID: userData.userID } }));

        case 34:
          res.json({ 'status': 'ok' });
          context$2$0.next = 38;
          break;

        case 37:
          res.json({ 'status': 'ok', 'message': 'Already submitted.' });

        case 38:
          context$2$0.next = 41;
          break;

        case 40:
          throw new _errors2['default'].InvalidFlag();

        case 41:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this);
  })()['catch'](next);
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/error/:reason', function (req, res, next) {
  if (req.params.reason === 'login') {
    next(new _errors2['default'].Login('Can\'t Login.'));
  } else {
    next(new _errors2['default'].API('Internal Server Error.'));
  }
});

app.all('/teapot', function (req, res, next) {
  next(new _errors2['default'].Teapot());
});

app.get('*', function (req, res, next) {
  next(new _errors2['default'].NotImplemented());
});

// Error Handling
app.use(function (err, req, res, next) {
  if (err.statusCode) {
    res.status(err.statusCode);
  } else {
    res.status(500);
  }

  res.send({
    status: 'error',
    errorName: err.name,
    message: err.message
  });
});

// Serve
schema.sync().then(function () {
  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.warn('Listening at %s:%s', host, port);
  });
});
//# sourceMappingURL=data:application/json;base64,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TUFBTTtBQUNMLE9BQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDakI7O0FBRUQsS0FBRyxDQUFDLElBQUksQ0FBQztBQUNQLFVBQU0sRUFBRSxPQUFPO0FBQ2YsYUFBUyxFQUFFLEdBQUcsQ0FBQyxJQUFJO0FBQ25CLFdBQU8sRUFBRSxHQUFHLENBQUMsT0FBTztHQUNyQixDQUFDLENBQUM7Q0FDSixDQUFDLENBQUM7OztBQUdILE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUN2QixNQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxZQUFNO0FBQ2xDLFFBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDcEMsUUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQztBQUNqQyxXQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNoRCxDQUFDLENBQUM7Q0FDSixDQUFDLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEltcG9ydFxuaW1wb3J0ICdiYWJlbC9wb2x5ZmlsbCc7XG5pbXBvcnQgeyBwcm9taXNpZnksIHByb21pc2lmeUFsbCB9IGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7IGluc3RhbGwgYXMgc291cmNlTWFwU3VwcG9ydCB9IGZyb20gJ3NvdXJjZS1tYXAtc3VwcG9ydCc7XG5zb3VyY2VNYXBTdXBwb3J0KCk7XG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcbmltcG9ydCBjb25maWcgZnJvbSAnY29uZmlnJztcbmltcG9ydCBwcm9qZWN0Um9vdCBmcm9tICdhcHAtcm9vdC1wYXRoJztcbmltcG9ydCB7IHNoYTNfNTEyIH0gZnJvbSAnanMtc2hhMyc7XG5cbmltcG9ydCBEYXRhYmFzZSBmcm9tICdzZXF1ZWxpemUnO1xuXG5pbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCBleHByZXNzU2Vzc2lvbiBmcm9tICdleHByZXNzLXNlc3Npb24nO1xuaW1wb3J0IGV4cHJlc3NMb2cgZnJvbSAnbW9yZ2FuJztcbmltcG9ydCBib2R5UGFyc2VyIGZyb20gJ2JvZHktcGFyc2VyJztcbmltcG9ydCBjb29raWVQYXJzZXIgZnJvbSAnY29va2llLXBhcnNlcic7XG5cbmltcG9ydCBwYXNzcG9ydCBmcm9tICdwYXNzcG9ydCc7XG5pbXBvcnQgeyBTdHJhdGVneSBhcyBUd2l0dGVyU3RyYXRlZ3kgfSBmcm9tICdwYXNzcG9ydC10d2l0dGVyJztcblxuaW1wb3J0IEVycm9ycyBmcm9tICcuL2Vycm9ycyc7XG5cbi8vIFByb21pc2lmeVxucHJvbWlzaWZ5QWxsKGZzKTtcblxuLy8gVmFyaWFibGVcbmxldCBhcHAgPSBleHByZXNzKCk7XG5sZXQgdHdpdHRlclN0cmF0ZWd5ID0gbmV3IFR3aXR0ZXJTdHJhdGVneShcbiAge1xuICAgIGNvbnN1bWVyS2V5OiBwcm9jZXNzLmVudlsnVFdJVFRFUl9DT05TVU1FUl9LRVknXSB8fCBjb25maWcuZ2V0KCdUV0lUVEVSX0NPTlNVTUVSX0tFWScpLFxuICAgIGNvbnN1bWVyU2VjcmV0OiBwcm9jZXNzLmVudlsnVFdJVFRFUl9DT05TVU1FUl9TRUNSRVQnXSB8fCBjb25maWcuZ2V0KCdUV0lUVEVSX0NPTlNVTUVSX1NFQ1JFVCcpLFxuICAgIGNhbGxiYWNrVVJMOlxuICAgICAgdXJsLnJlc29sdmUocHJvY2Vzcy5lbnZbJ1JPT1RfVVJMJ10gfHwgY29uZmlnLmdldCgnUk9PVF9VUkwnKSwgJ2F1dGgvdHdpdHRlci9jYWxsYmFjaycpXG4gIH0sXG4gICh0b2tlbiwgdG9rZW5TZWNyZXQsIHByb2ZpbGUsIGRvbmUpID0+IHtcbiAgICBkb25lKG51bGwsIHByb2ZpbGUpO1xuICB9XG4pO1xuXG5sZXQgc2NoZW1hID0gbmV3IERhdGFiYXNlKCdkYXRhYmFzZScsIG51bGwsIG51bGwsIHtcbiAgZGlhbGVjdDogJ3NxbGl0ZScsXG4gIHN0b3JhZ2U6IHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdC5wYXRoLCAnZGF0YWJhc2Uuc3FsaXRlJylcbn0pO1xubGV0IG1vZGVscyA9IHNjaGVtYS5tb2RlbHM7XG5cbmxldCBzdGF0aWNQYXRoID0gcGF0aC5yZXNvbHZlKHByb2plY3RSb290LnBhdGgsICdzdGF0aWMnKTtcblxuLy8gU2V0dGluZ3Ncbi8vIC8vIERhdGFiYXNlXG5zY2hlbWEuZGVmaW5lKCdVc2VyJywge1xuICB1c2VySUQ6IHtcbiAgICB0eXBlOiBEYXRhYmFzZS5JTlRFR0VSLFxuICAgIGFsbG93TnVsbDogZmFsc2UsXG4gICAgcHJpbWFyeUtleTogdHJ1ZVxuICB9LFxuICB1c2VyTmFtZTogRGF0YWJhc2UuVEVYVCxcbiAgZGlzcGxheU5hbWU6IERhdGFiYXNlLlRFWFQsXG4gIGljb25Vcmw6IERhdGFiYXNlLlRFWFQsXG4gIHNjb3JlOiB7XG4gICAgdHlwZTogRGF0YWJhc2UuSU5URUdFUixcbiAgICBhbGxvd051bGw6IGZhbHNlLFxuICAgIGRlZmF1bHRWYWx1ZTogMFxuICB9XG59KTtcbnNjaGVtYS5kZWZpbmUoJ1Njb3JlJywge1xuICB1c2VySUQ6IHtcbiAgICB0eXBlOiBEYXRhYmFzZS5JTlRFR0VSLFxuICAgIGFsbG93TnVsbDogZmFsc2VcbiAgfSxcbiAgcXVlc3Rpb25OYW1lSGFzaDoge1xuICAgIHR5cGU6IERhdGFiYXNlLlNUUklORyxcbiAgICBhbGxvd051bGw6IGZhbHNlXG4gIH0sXG4gIHNjb3JlOiB7XG4gICAgdHlwZTogRGF0YWJhc2UuSU5URUdFUixcbiAgICBhbGxvd051bGw6IGZhbHNlLFxuICAgIGRlZmF1bHRWYWx1ZTogMFxuICB9XG59LCB7XG4gIGluZGV4ZXM6IFtcbiAgICB7IGZpZWxkczogWyAndXNlcklEJyBdIH0sXG4gICAgeyBmaWVsZHM6IFsgJ3F1ZXN0aW9uTmFtZUhhc2gnIF0gfVxuICBdXG59KTtcblxuLy8gLy8gUGFzc3BvcnRcbnBhc3Nwb3J0LnVzZSh0d2l0dGVyU3RyYXRlZ3kpO1xucGFzc3BvcnQuc2VyaWFsaXplVXNlcigodXNlciwgZG9uZSkgPT4geyAoYXN5bmMgKCkgPT4ge1xuICBsZXQgdXNlckRhdGEgPSB7XG4gICAgdXNlcklEOiB1c2VyLmlkLFxuICAgIHVzZXJOYW1lOiB1c2VyLnVzZXJuYW1lLFxuICAgIGRpc3BsYXlOYW1lOiB1c2VyLmRpc3BsYXlOYW1lLFxuICAgIGljb25Vcmw6IHVzZXIucGhvdG9zWzBdLnZhbHVlXG4gIH07XG4gIGF3YWl0IG1vZGVscy5Vc2VyLmZpbmRPckNyZWF0ZSh7XG4gICAgd2hlcmU6IHsgdXNlcklEOiB1c2VyLmlkIH0sXG4gICAgZGVmYXVsdDogdXNlckRhdGFcbiAgfSk7XG4gIGF3YWl0IG1vZGVscy5Vc2VyLnVwZGF0ZSh1c2VyRGF0YSwge1xuICAgIHdoZXJlOiB7IHVzZXJJRDogdXNlci5pZCB9LFxuICAgIHNsaWVudDogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIHsgdXNlcklEOiB1c2VyLmlkIH07XG59KSgpLnRoZW4oKHZhbCkgPT4gZG9uZShudWxsLCB2YWwpKS5jYXRjaChkb25lKTsgfSk7XG5cbnBhc3Nwb3J0LmRlc2VyaWFsaXplVXNlcihmdW5jdGlvbihvYmosIGRvbmUpIHtcbiAgZG9uZShudWxsLCBvYmopO1xufSk7XG5cbi8vIC8vIEV4cHJlc3NcbmFwcC51c2UoZXhwcmVzc0xvZygnY29tYmluZWQnKSk7XG5hcHAudXNlKGNvb2tpZVBhcnNlcigpKTtcbmFwcC51c2UoYm9keVBhcnNlci5qc29uKCkpO1xuYXBwLnVzZShleHByZXNzU2Vzc2lvbih7XG4gIHNlY3JldDogJ3Rlc3RjdGYnLFxuICByZXNhdmU6IHRydWUsXG4gIHNhdmVVbmluaXRpYWxpemVkOiB0cnVlXG59KSk7XG5hcHAudXNlKHBhc3Nwb3J0LmluaXRpYWxpemUoKSk7XG5hcHAudXNlKHBhc3Nwb3J0LnNlc3Npb24oKSk7XG5cbmFwcC51c2UoJy8nLCBleHByZXNzLnN0YXRpYyhzdGF0aWNQYXRoKSk7XG5cbi8vIFJvdXRpbmdcbmFwcC5nZXQoJy8nLCAocmVxLCByZXMpID0+IHtcbiAgcmVzLmpzb24oeydzdGF0dXMnOiAnb2snfSk7XG59KTtcblxuYXBwLmdldCgnL3F1ZXN0aW9uTGlzdC5qc29uJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7IChhc3luYyAoKSA9PiB7XG4gIGxldCBmaWxlc0FuZEZvbGRlcnMgPSBhd2FpdCBmcy5yZWFkZGlyQXN5bmMoc3RhdGljUGF0aCk7XG4gIGxldCBmb2xkZXJzID0gZmlsZXNBbmRGb2xkZXJzLmZpbHRlcigoZmlsZSkgPT4ge1xuICAgIGxldCBzdGF0ID0gZnMuc3RhdFN5bmMocGF0aC5yZXNvbHZlKHN0YXRpY1BhdGgsIGZpbGUpKTtcbiAgICByZXR1cm4gc3RhdC5pc0RpcmVjdG9yeSgpO1xuICB9KTtcbiAgcmVzLmpzb24oZm9sZGVycyk7XG59KSgpLmNhdGNoKG5leHQpOyB9KTtcblxuYXBwLmdldCgnL2F1dGgvdHdpdHRlcicsIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZSgndHdpdHRlcicpKTtcblxuYXBwLmdldCgnL2F1dGgvdHdpdHRlci9jYWxsYmFjaycsXG4gIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZSgndHdpdHRlcicsIHtcbiAgICBzdWNjZXNzUmVkaXJlY3Q6ICcvdXNlcicsXG4gICAgZmFpbHVyZVJlZGlyZWN0OiAnL2Vycm9yL2xvZ2luJ1xuICB9KVxuKTtcblxuYXBwLmdldCgnL2xvZ2luJywgKHJlcSwgcmVzKSA9PiB7XG4gIGlmICghcmVxLnVzZXIpIHJlcy5yZWRpcmVjdCgnL2F1dGgvdHdpdHRlcicpO1xuICBlbHNlIHJlcy5yZWRpcmVjdCgnL3VzZXInKTtcbn0pO1xuXG5hcHAuZ2V0KCcvdXNlcicsIChyZXEsIHJlcywgbmV4dCkgPT4geyAoYXN5bmMgKCkgPT4ge1xuICBpZiAoIXJlcS51c2VyKSB0aHJvdyBuZXcgRXJyb3JzLkxvZ2luKCdMb2dpbiBpcyByZXF1aXJlZC4nKTtcbiAgbGV0IHVzZXJEYXRhID0gYXdhaXQgbW9kZWxzLlVzZXIuZmluZE9uZSh7IHdoZXJlOiB7IHVzZXJJRDogcmVxLnVzZXIudXNlcklEIH0gfSk7XG4gIGlmICghdXNlckRhdGEpIHRocm93IG5ldyBFcnJvcnMuTG9naW4oJ0xvZ2luIGlzIHJlcXVpcmVkLicpO1xuICBPYmplY3QuYXNzaWduKHVzZXJEYXRhLCB7IHVzZXJJRDogdW5kZWZpbmVkIH0pO1xuICByZXMuanNvbih7J3N0YXR1cyc6ICdvaycsICd1c2VyJzogdXNlckRhdGF9KTtcbn0pKCkuY2F0Y2gobmV4dCk7IH0pO1xuXG5hcHAuZ2V0KCcvc2NvcmVzJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7IChhc3luYyAoKSA9PiB7XG4gIGxldCBkYXRhID0gYXdhaXQgbW9kZWxzLlVzZXIuYWxsKHsgc29ydDogJ3Njb3JlJyB9KTtcbiAgZGF0YSA9IGRhdGEubWFwKChpbmZvKSA9PiBPYmplY3QuYXNzaWduKGluZm8sIHsgdXNlcklEOiB1bmRlZmluZWQgfSkpO1xuICByZXMuanNvbih7J3N0YXR1cyc6ICdvaycsICdzY29yZXMnOiBkYXRhfSk7XG59KSgpLmNhdGNoKG5leHQpOyB9KTtcblxuYXBwLnBvc3QoJy9zdWJtaXQnLCAocmVxLCByZXMsIG5leHQpID0+IHsgKGFzeW5jICgpID0+IHtcbiAgaWYgKCFyZXEuZ2V0KCdDb250ZW50LVR5cGUnKS5pbmNsdWRlcygnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9ycy5CYWRSZXF1ZXN0KCdTaG91bGQgdG8gc2V0IFwiQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXCIuJyk7XG4gIH1cbiAgaWYgKCFyZXEudXNlcikgdGhyb3cgbmV3IEVycm9ycy5Mb2dpbignTG9naW4gaXMgcmVxdWlyZWQuJyk7XG4gIGxldCB1c2VyRGF0YSA9IGF3YWl0IG1vZGVscy5Vc2VyLmZpbmRPbmUoeyB3aGVyZTogeyB1c2VySUQ6IHJlcS51c2VyLnVzZXJJRCB9IH0pO1xuICBpZiAoIXVzZXJEYXRhKSB0aHJvdyBuZXcgRXJyb3JzLkxvZ2luKCdMb2dpbiBpcyByZXF1aXJlZC4nKTtcbiAgaWYgKCFyZXEuYm9keS5xdWVzdGlvbiB8fCAhcmVxLmJvZHkuZmxhZykge1xuICAgIHRocm93IG5ldyBFcnJvcnMuQmFkUmVxdWVzdCgnUmVxdWlyZSBxdWVzdGlvbiBuYW1lIGFuZCBmbGFnLicpO1xuICB9XG5cbiAgbGV0IHF1ZXN0aW9uUGF0aCA9IHBhdGgucmVzb2x2ZShzdGF0aWNQYXRoLCByZXEuYm9keS5xdWVzdGlvbik7XG4gIGlmICghcXVlc3Rpb25QYXRoLmluY2x1ZGVzKHN0YXRpY1BhdGgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9ycy5CYWRSZXF1ZXN0KCdJbnZhbGlkIHF1ZXN0aW9uIG5hbWUuJyk7XG4gIH1cbiAgYXdhaXQgZnMuc3RhdEFzeW5jKHF1ZXN0aW9uUGF0aClcbiAgICAuY2F0Y2goKCkgPT4geyB0aHJvdyBuZXcgRXJyb3JzLk5vdEZvdW5kKCdRdWVzdGlvbiBpcyBub3QgZm91bmQuJyk7IH0pO1xuXG4gIGxldCBmbGFnUGF0aCA9IHBhdGgucmVzb2x2ZShxdWVzdGlvblBhdGgsICdGTEFHLnNoYTMtNTEyJyk7XG4gIGxldCB0cnVlRmxhZ0hhc2ggPSBhd2FpdCBmcy5yZWFkRmlsZUFzeW5jKGZsYWdQYXRoKVxuICAgIC50aGVuKChoYXNoKSA9PiBoYXNoLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxzL2csICcnKS50b0xvd2VyQ2FzZSgpKVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7IHRocm93IG5ldyBFcnJvcnMuSW50ZXJuYWwoZXJyLnN0YWNrKTsgfSk7XG5cbiAgbGV0IHVzZXJGbGFnSGFzaCA9IHNoYTNfNTEyKHJlcS5ib2R5LmZsYWcpLnJlcGxhY2UoL1xccy9nLCAnJykudG9Mb3dlckNhc2UoKTtcblxuICBpZiAodHJ1ZUZsYWdIYXNoID09PSB1c2VyRmxhZ0hhc2gpIHtcbiAgICBsZXQgcXVlc3Rpb25OYW1lID0gcGF0aC5yZWxhdGl2ZShzdGF0aWNQYXRoLCBxdWVzdGlvblBhdGgpO1xuICAgIGxldCBxdWVzdGlvbk5hbWVIYXNoID0gc2hhM181MTIocXVlc3Rpb25OYW1lKS5yZXBsYWNlKC9cXHMvZywgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgbGV0IHNjb3JlID0gcGFyc2VJbnQocXVlc3Rpb25OYW1lLnNwbGl0KCctJylbMV0sIDEwKSB8fCAwO1xuICAgIGxldCBxdWVyeSA9IHtcbiAgICAgIHVzZXJJRDogdXNlckRhdGEudXNlcklELFxuICAgICAgcXVlc3Rpb25OYW1lSGFzaDogcXVlc3Rpb25OYW1lSGFzaFxuICAgIH07XG5cbiAgICBsZXQgc2NvcmVJbmZvID0gYXdhaXQgbW9kZWxzLlNjb3JlLmZpbmRPbmUocXVlcnkpO1xuXG4gICAgaWYgKCFzY29yZUluZm8pIHtcbiAgICAgIGF3YWl0IG1vZGVscy5TY29yZS5jcmVhdGUoXG4gICAgICAgIE9iamVjdC5hc3NpZ24oe30sIHF1ZXJ5LCB7IHNjb3JlOiBzY29yZSB9KVxuICAgICAgKTtcbiAgICAgIGF3YWl0IG1vZGVscy5Vc2VyLnVwZGF0ZShcbiAgICAgICAgeyBzY29yZTogdXNlckRhdGEuc2NvcmUgKyBzY29yZSB9LFxuICAgICAgICB7IHdoZXJlOiB7IHVzZXJJRDogdXNlckRhdGEudXNlcklEIH0gfVxuICAgICAgKTtcbiAgICAgIHJlcy5qc29uKHsnc3RhdHVzJzogJ29rJ30pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMuanNvbih7J3N0YXR1cyc6ICdvaycsICdtZXNzYWdlJzogJ0FscmVhZHkgc3VibWl0dGVkLid9KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9ycy5JbnZhbGlkRmxhZygpO1xuICB9XG5cbn0pKCkuY2F0Y2gobmV4dCk7IH0pO1xuXG5hcHAuZ2V0KCcvbG9nb3V0JywgKHJlcSwgcmVzKSA9PiB7XG4gIHJlcS5sb2dvdXQoKTtcbiAgcmVzLnJlZGlyZWN0KCcvJyk7XG59KTtcblxuYXBwLmdldCgnL2Vycm9yLzpyZWFzb24nLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgaWYgKHJlcS5wYXJhbXMucmVhc29uID09PSAnbG9naW4nKSB7XG4gICAgbmV4dChuZXcgRXJyb3JzLkxvZ2luKCdDYW5cXCd0IExvZ2luLicpKTtcbiAgfSBlbHNlIHtcbiAgICBuZXh0KG5ldyBFcnJvcnMuQVBJKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3IuJykpO1xuICB9XG59KTtcblxuYXBwLmFsbCgnL3RlYXBvdCcsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICBuZXh0KG5ldyBFcnJvcnMuVGVhcG90KCkpO1xufSk7XG5cbmFwcC5nZXQoJyonLCBmdW5jdGlvbihyZXEsIHJlcywgbmV4dCkge1xuICBuZXh0KG5ldyBFcnJvcnMuTm90SW1wbGVtZW50ZWQoKSk7XG59KTtcblxuLy8gRXJyb3IgSGFuZGxpbmdcbmFwcC51c2UoZnVuY3Rpb24oZXJyLCByZXEsIHJlcywgbmV4dCkge1xuICBpZiAoZXJyLnN0YXR1c0NvZGUpIHtcbiAgICByZXMuc3RhdHVzKGVyci5zdGF0dXNDb2RlKTtcbiAgfSBlbHNlIHtcbiAgICByZXMuc3RhdHVzKDUwMCk7XG4gIH1cblxuICByZXMuc2VuZCh7XG4gICAgc3RhdHVzOiAnZXJyb3InLFxuICAgIGVycm9yTmFtZTogZXJyLm5hbWUsXG4gICAgbWVzc2FnZTogZXJyLm1lc3NhZ2VcbiAgfSk7XG59KTtcblxuLy8gU2VydmVcbnNjaGVtYS5zeW5jKCkudGhlbigoKSA9PiB7XG4gIGxldCBzZXJ2ZXIgPSBhcHAubGlzdGVuKDMwMDAsICgpID0+IHtcbiAgICBsZXQgaG9zdCA9IHNlcnZlci5hZGRyZXNzKCkuYWRkcmVzcztcbiAgICBsZXQgcG9ydCA9IHNlcnZlci5hZGRyZXNzKCkucG9ydDtcbiAgICBjb25zb2xlLndhcm4oJ0xpc3RlbmluZyBhdCAlczolcycsIGhvc3QsIHBvcnQpO1xuICB9KTtcbn0pO1xuIl19