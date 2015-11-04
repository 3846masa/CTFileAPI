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
  callbackURL: 'http://localhost:3000/auth/twitter/callback'
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
//# sourceMappingURL=data:application/json;base64,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LGFBQVMsRUFBRSxHQUFHLENBQUMsSUFBSTtBQUNuQixXQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87R0FDckIsQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDOzs7QUFHSCxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDdkIsTUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsWUFBTTtBQUNsQyxRQUFJLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ3BDLFFBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDakMsV0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDaEQsQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbXBvcnRcbmltcG9ydCAnYmFiZWwvcG9seWZpbGwnO1xuaW1wb3J0IHsgcHJvbWlzaWZ5LCBwcm9taXNpZnlBbGwgfSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgeyBpbnN0YWxsIGFzIHNvdXJjZU1hcFN1cHBvcnQgfSBmcm9tICdzb3VyY2UtbWFwLXN1cHBvcnQnO1xuc291cmNlTWFwU3VwcG9ydCgpO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgY29uZmlnIGZyb20gJ2NvbmZpZyc7XG5pbXBvcnQgcHJvamVjdFJvb3QgZnJvbSAnYXBwLXJvb3QtcGF0aCc7XG5pbXBvcnQgeyBzaGEzXzUxMiB9IGZyb20gJ2pzLXNoYTMnO1xuXG5pbXBvcnQgRGF0YWJhc2UgZnJvbSAnc2VxdWVsaXplJztcblxuaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgZXhwcmVzc1Nlc3Npb24gZnJvbSAnZXhwcmVzcy1zZXNzaW9uJztcbmltcG9ydCBleHByZXNzTG9nIGZyb20gJ21vcmdhbic7XG5pbXBvcnQgYm9keVBhcnNlciBmcm9tICdib2R5LXBhcnNlcic7XG5pbXBvcnQgY29va2llUGFyc2VyIGZyb20gJ2Nvb2tpZS1wYXJzZXInO1xuXG5pbXBvcnQgcGFzc3BvcnQgZnJvbSAncGFzc3BvcnQnO1xuaW1wb3J0IHsgU3RyYXRlZ3kgYXMgVHdpdHRlclN0cmF0ZWd5IH0gZnJvbSAncGFzc3BvcnQtdHdpdHRlcic7XG5cbmltcG9ydCBFcnJvcnMgZnJvbSAnLi9lcnJvcnMnO1xuXG4vLyBQcm9taXNpZnlcbnByb21pc2lmeUFsbChmcyk7XG5cbi8vIFZhcmlhYmxlXG5sZXQgYXBwID0gZXhwcmVzcygpO1xubGV0IHR3aXR0ZXJTdHJhdGVneSA9IG5ldyBUd2l0dGVyU3RyYXRlZ3koXG4gIHtcbiAgICBjb25zdW1lcktleTogcHJvY2Vzcy5lbnZbJ1RXSVRURVJfQ09OU1VNRVJfS0VZJ10gfHwgY29uZmlnLmdldCgnVFdJVFRFUl9DT05TVU1FUl9LRVknKSxcbiAgICBjb25zdW1lclNlY3JldDogcHJvY2Vzcy5lbnZbJ1RXSVRURVJfQ09OU1VNRVJfU0VDUkVUJ10gfHwgY29uZmlnLmdldCgnVFdJVFRFUl9DT05TVU1FUl9TRUNSRVQnKSxcbiAgICBjYWxsYmFja1VSTDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hdXRoL3R3aXR0ZXIvY2FsbGJhY2snXG4gIH0sXG4gICh0b2tlbiwgdG9rZW5TZWNyZXQsIHByb2ZpbGUsIGRvbmUpID0+IHtcbiAgICBkb25lKG51bGwsIHByb2ZpbGUpO1xuICB9XG4pO1xuXG5sZXQgc2NoZW1hID0gbmV3IERhdGFiYXNlKCdkYXRhYmFzZScsIG51bGwsIG51bGwsIHtcbiAgZGlhbGVjdDogJ3NxbGl0ZScsXG4gIHN0b3JhZ2U6IHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdC5wYXRoLCAnZGF0YWJhc2Uuc3FsaXRlJylcbn0pO1xubGV0IG1vZGVscyA9IHNjaGVtYS5tb2RlbHM7XG5cbmxldCBzdGF0aWNQYXRoID0gcGF0aC5yZXNvbHZlKHByb2plY3RSb290LnBhdGgsICdzdGF0aWMnKTtcblxuLy8gU2V0dGluZ3Ncbi8vIC8vIERhdGFiYXNlXG5zY2hlbWEuZGVmaW5lKCdVc2VyJywge1xuICB1c2VySUQ6IHtcbiAgICB0eXBlOiBEYXRhYmFzZS5JTlRFR0VSLFxuICAgIGFsbG93TnVsbDogZmFsc2UsXG4gICAgcHJpbWFyeUtleTogdHJ1ZVxuICB9LFxuICB1c2VyTmFtZTogRGF0YWJhc2UuVEVYVCxcbiAgZGlzcGxheU5hbWU6IERhdGFiYXNlLlRFWFQsXG4gIGljb25Vcmw6IERhdGFiYXNlLlRFWFQsXG4gIHNjb3JlOiB7XG4gICAgdHlwZTogRGF0YWJhc2UuSU5URUdFUixcbiAgICBhbGxvd051bGw6IGZhbHNlLFxuICAgIGRlZmF1bHRWYWx1ZTogMFxuICB9XG59KTtcbnNjaGVtYS5kZWZpbmUoJ1Njb3JlJywge1xuICB1c2VySUQ6IHtcbiAgICB0eXBlOiBEYXRhYmFzZS5JTlRFR0VSLFxuICAgIGFsbG93TnVsbDogZmFsc2VcbiAgfSxcbiAgcXVlc3Rpb25OYW1lSGFzaDoge1xuICAgIHR5cGU6IERhdGFiYXNlLlNUUklORyxcbiAgICBhbGxvd051bGw6IGZhbHNlXG4gIH0sXG4gIHNjb3JlOiB7XG4gICAgdHlwZTogRGF0YWJhc2UuSU5URUdFUixcbiAgICBhbGxvd051bGw6IGZhbHNlLFxuICAgIGRlZmF1bHRWYWx1ZTogMFxuICB9XG59LCB7XG4gIGluZGV4ZXM6IFtcbiAgICB7IGZpZWxkczogWyAndXNlcklEJyBdIH0sXG4gICAgeyBmaWVsZHM6IFsgJ3F1ZXN0aW9uTmFtZUhhc2gnIF0gfVxuICBdXG59KTtcblxuLy8gLy8gUGFzc3BvcnRcbnBhc3Nwb3J0LnVzZSh0d2l0dGVyU3RyYXRlZ3kpO1xucGFzc3BvcnQuc2VyaWFsaXplVXNlcigodXNlciwgZG9uZSkgPT4geyAoYXN5bmMgKCkgPT4ge1xuICBsZXQgdXNlckRhdGEgPSB7XG4gICAgdXNlcklEOiB1c2VyLmlkLFxuICAgIHVzZXJOYW1lOiB1c2VyLnVzZXJuYW1lLFxuICAgIGRpc3BsYXlOYW1lOiB1c2VyLmRpc3BsYXlOYW1lLFxuICAgIGljb25Vcmw6IHVzZXIucGhvdG9zWzBdLnZhbHVlXG4gIH07XG4gIGF3YWl0IG1vZGVscy5Vc2VyLmZpbmRPckNyZWF0ZSh7XG4gICAgd2hlcmU6IHsgdXNlcklEOiB1c2VyLmlkIH0sXG4gICAgZGVmYXVsdDogdXNlckRhdGFcbiAgfSk7XG4gIGF3YWl0IG1vZGVscy5Vc2VyLnVwZGF0ZSh1c2VyRGF0YSwge1xuICAgIHdoZXJlOiB7IHVzZXJJRDogdXNlci5pZCB9LFxuICAgIHNsaWVudDogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIHsgdXNlcklEOiB1c2VyLmlkIH07XG59KSgpLnRoZW4oKHZhbCkgPT4gZG9uZShudWxsLCB2YWwpKS5jYXRjaChkb25lKTsgfSk7XG5cbnBhc3Nwb3J0LmRlc2VyaWFsaXplVXNlcihmdW5jdGlvbihvYmosIGRvbmUpIHtcbiAgZG9uZShudWxsLCBvYmopO1xufSk7XG5cbi8vIC8vIEV4cHJlc3NcbmFwcC51c2UoZXhwcmVzc0xvZygnY29tYmluZWQnKSk7XG5hcHAudXNlKGNvb2tpZVBhcnNlcigpKTtcbmFwcC51c2UoYm9keVBhcnNlci5qc29uKCkpO1xuYXBwLnVzZShleHByZXNzU2Vzc2lvbih7XG4gIHNlY3JldDogJ3Rlc3RjdGYnLFxuICByZXNhdmU6IHRydWUsXG4gIHNhdmVVbmluaXRpYWxpemVkOiB0cnVlXG59KSk7XG5hcHAudXNlKHBhc3Nwb3J0LmluaXRpYWxpemUoKSk7XG5hcHAudXNlKHBhc3Nwb3J0LnNlc3Npb24oKSk7XG5cbmFwcC51c2UoJy8nLCBleHByZXNzLnN0YXRpYyhzdGF0aWNQYXRoKSk7XG5cbi8vIFJvdXRpbmdcbmFwcC5nZXQoJy8nLCAocmVxLCByZXMpID0+IHtcbiAgcmVzLmpzb24oeydzdGF0dXMnOiAnb2snfSk7XG59KTtcblxuYXBwLmdldCgnL3F1ZXN0aW9uTGlzdC5qc29uJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7IChhc3luYyAoKSA9PiB7XG4gIGxldCBmaWxlc0FuZEZvbGRlcnMgPSBhd2FpdCBmcy5yZWFkZGlyQXN5bmMoc3RhdGljUGF0aCk7XG4gIGxldCBmb2xkZXJzID0gZmlsZXNBbmRGb2xkZXJzLmZpbHRlcigoZmlsZSkgPT4ge1xuICAgIGxldCBzdGF0ID0gZnMuc3RhdFN5bmMocGF0aC5yZXNvbHZlKHN0YXRpY1BhdGgsIGZpbGUpKTtcbiAgICByZXR1cm4gc3RhdC5pc0RpcmVjdG9yeSgpO1xuICB9KTtcbiAgcmVzLmpzb24oZm9sZGVycyk7XG59KSgpLmNhdGNoKG5leHQpOyB9KTtcblxuYXBwLmdldCgnL2F1dGgvdHdpdHRlcicsIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZSgndHdpdHRlcicpKTtcblxuYXBwLmdldCgnL2F1dGgvdHdpdHRlci9jYWxsYmFjaycsXG4gIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZSgndHdpdHRlcicsIHtcbiAgICBzdWNjZXNzUmVkaXJlY3Q6ICcvdXNlcicsXG4gICAgZmFpbHVyZVJlZGlyZWN0OiAnL2Vycm9yL2xvZ2luJ1xuICB9KVxuKTtcblxuYXBwLmdldCgnL2xvZ2luJywgKHJlcSwgcmVzKSA9PiB7XG4gIGlmICghcmVxLnVzZXIpIHJlcy5yZWRpcmVjdCgnL2F1dGgvdHdpdHRlcicpO1xuICBlbHNlIHJlcy5yZWRpcmVjdCgnL3VzZXInKTtcbn0pO1xuXG5hcHAuZ2V0KCcvdXNlcicsIChyZXEsIHJlcywgbmV4dCkgPT4geyAoYXN5bmMgKCkgPT4ge1xuICBpZiAoIXJlcS51c2VyKSB0aHJvdyBuZXcgRXJyb3JzLkxvZ2luKCdMb2dpbiBpcyByZXF1aXJlZC4nKTtcbiAgbGV0IHVzZXJEYXRhID0gYXdhaXQgbW9kZWxzLlVzZXIuZmluZE9uZSh7IHdoZXJlOiB7IHVzZXJJRDogcmVxLnVzZXIudXNlcklEIH0gfSk7XG4gIGlmICghdXNlckRhdGEpIHRocm93IG5ldyBFcnJvcnMuTG9naW4oJ0xvZ2luIGlzIHJlcXVpcmVkLicpO1xuICBPYmplY3QuYXNzaWduKHVzZXJEYXRhLCB7IHVzZXJJRDogdW5kZWZpbmVkIH0pO1xuICByZXMuanNvbih7J3N0YXR1cyc6ICdvaycsICd1c2VyJzogdXNlckRhdGF9KTtcbn0pKCkuY2F0Y2gobmV4dCk7IH0pO1xuXG5hcHAuZ2V0KCcvc2NvcmVzJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7IChhc3luYyAoKSA9PiB7XG4gIGxldCBkYXRhID0gYXdhaXQgbW9kZWxzLlVzZXIuYWxsKHsgc29ydDogJ3Njb3JlJyB9KTtcbiAgZGF0YSA9IGRhdGEubWFwKChpbmZvKSA9PiBPYmplY3QuYXNzaWduKGluZm8sIHsgdXNlcklEOiB1bmRlZmluZWQgfSkpO1xuICByZXMuanNvbih7J3N0YXR1cyc6ICdvaycsICdzY29yZXMnOiBkYXRhfSk7XG59KSgpLmNhdGNoKG5leHQpOyB9KTtcblxuYXBwLnBvc3QoJy9zdWJtaXQnLCAocmVxLCByZXMsIG5leHQpID0+IHsgKGFzeW5jICgpID0+IHtcbiAgaWYgKCFyZXEuZ2V0KCdDb250ZW50LVR5cGUnKS5pbmNsdWRlcygnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9ycy5CYWRSZXF1ZXN0KCdTaG91bGQgdG8gc2V0IFwiQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXCIuJyk7XG4gIH1cbiAgaWYgKCFyZXEudXNlcikgdGhyb3cgbmV3IEVycm9ycy5Mb2dpbignTG9naW4gaXMgcmVxdWlyZWQuJyk7XG4gIGxldCB1c2VyRGF0YSA9IGF3YWl0IG1vZGVscy5Vc2VyLmZpbmRPbmUoeyB3aGVyZTogeyB1c2VySUQ6IHJlcS51c2VyLnVzZXJJRCB9IH0pO1xuICBpZiAoIXVzZXJEYXRhKSB0aHJvdyBuZXcgRXJyb3JzLkxvZ2luKCdMb2dpbiBpcyByZXF1aXJlZC4nKTtcbiAgaWYgKCFyZXEuYm9keS5xdWVzdGlvbiB8fCAhcmVxLmJvZHkuZmxhZykge1xuICAgIHRocm93IG5ldyBFcnJvcnMuQmFkUmVxdWVzdCgnUmVxdWlyZSBxdWVzdGlvbiBuYW1lIGFuZCBmbGFnLicpO1xuICB9XG5cbiAgbGV0IHF1ZXN0aW9uUGF0aCA9IHBhdGgucmVzb2x2ZShzdGF0aWNQYXRoLCByZXEuYm9keS5xdWVzdGlvbik7XG4gIGlmICghcXVlc3Rpb25QYXRoLmluY2x1ZGVzKHN0YXRpY1BhdGgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9ycy5CYWRSZXF1ZXN0KCdJbnZhbGlkIHF1ZXN0aW9uIG5hbWUuJyk7XG4gIH1cbiAgYXdhaXQgZnMuc3RhdEFzeW5jKHF1ZXN0aW9uUGF0aClcbiAgICAuY2F0Y2goKCkgPT4geyB0aHJvdyBuZXcgRXJyb3JzLk5vdEZvdW5kKCdRdWVzdGlvbiBpcyBub3QgZm91bmQuJyk7IH0pO1xuXG4gIGxldCBmbGFnUGF0aCA9IHBhdGgucmVzb2x2ZShxdWVzdGlvblBhdGgsICdGTEFHLnNoYTMtNTEyJyk7XG4gIGxldCB0cnVlRmxhZ0hhc2ggPSBhd2FpdCBmcy5yZWFkRmlsZUFzeW5jKGZsYWdQYXRoKVxuICAgIC50aGVuKChoYXNoKSA9PiBoYXNoLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxzL2csICcnKS50b0xvd2VyQ2FzZSgpKVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7IHRocm93IG5ldyBFcnJvcnMuSW50ZXJuYWwoZXJyLnN0YWNrKTsgfSk7XG5cbiAgbGV0IHVzZXJGbGFnSGFzaCA9IHNoYTNfNTEyKHJlcS5ib2R5LmZsYWcpLnJlcGxhY2UoL1xccy9nLCAnJykudG9Mb3dlckNhc2UoKTtcblxuICBpZiAodHJ1ZUZsYWdIYXNoID09PSB1c2VyRmxhZ0hhc2gpIHtcbiAgICBsZXQgcXVlc3Rpb25OYW1lID0gcGF0aC5yZWxhdGl2ZShzdGF0aWNQYXRoLCBxdWVzdGlvblBhdGgpO1xuICAgIGxldCBxdWVzdGlvbk5hbWVIYXNoID0gc2hhM181MTIocXVlc3Rpb25OYW1lKS5yZXBsYWNlKC9cXHMvZywgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgbGV0IHNjb3JlID0gcGFyc2VJbnQocXVlc3Rpb25OYW1lLnNwbGl0KCctJylbMV0sIDEwKSB8fCAwO1xuICAgIGxldCBxdWVyeSA9IHtcbiAgICAgIHVzZXJJRDogdXNlckRhdGEudXNlcklELFxuICAgICAgcXVlc3Rpb25OYW1lSGFzaDogcXVlc3Rpb25OYW1lSGFzaFxuICAgIH07XG5cbiAgICBsZXQgc2NvcmVJbmZvID0gYXdhaXQgbW9kZWxzLlNjb3JlLmZpbmRPbmUocXVlcnkpO1xuXG4gICAgaWYgKCFzY29yZUluZm8pIHtcbiAgICAgIGF3YWl0IG1vZGVscy5TY29yZS5jcmVhdGUoXG4gICAgICAgIE9iamVjdC5hc3NpZ24oe30sIHF1ZXJ5LCB7IHNjb3JlOiBzY29yZSB9KVxuICAgICAgKTtcbiAgICAgIGF3YWl0IG1vZGVscy5Vc2VyLnVwZGF0ZShcbiAgICAgICAgeyBzY29yZTogdXNlckRhdGEuc2NvcmUgKyBzY29yZSB9LFxuICAgICAgICB7IHdoZXJlOiB7IHVzZXJJRDogdXNlckRhdGEudXNlcklEIH0gfVxuICAgICAgKTtcbiAgICAgIHJlcy5qc29uKHsnc3RhdHVzJzogJ29rJ30pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMuanNvbih7J3N0YXR1cyc6ICdvaycsICdtZXNzYWdlJzogJ0FscmVhZHkgc3VibWl0dGVkLid9KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9ycy5JbnZhbGlkRmxhZygpO1xuICB9XG5cbn0pKCkuY2F0Y2gobmV4dCk7IH0pO1xuXG5hcHAuZ2V0KCcvbG9nb3V0JywgKHJlcSwgcmVzKSA9PiB7XG4gIHJlcS5sb2dvdXQoKTtcbiAgcmVzLnJlZGlyZWN0KCcvJyk7XG59KTtcblxuYXBwLmdldCgnL2Vycm9yLzpyZWFzb24nLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgaWYgKHJlcS5wYXJhbXMucmVhc29uID09PSAnbG9naW4nKSB7XG4gICAgbmV4dChuZXcgRXJyb3JzLkxvZ2luKCdDYW5cXCd0IExvZ2luLicpKTtcbiAgfSBlbHNlIHtcbiAgICBuZXh0KG5ldyBFcnJvcnMuQVBJKCdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3IuJykpO1xuICB9XG59KTtcblxuYXBwLmFsbCgnL3RlYXBvdCcsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICBuZXh0KG5ldyBFcnJvcnMuVGVhcG90KCkpO1xufSk7XG5cbmFwcC5nZXQoJyonLCBmdW5jdGlvbihyZXEsIHJlcywgbmV4dCkge1xuICBuZXh0KG5ldyBFcnJvcnMuTm90SW1wbGVtZW50ZWQoKSk7XG59KTtcblxuLy8gRXJyb3IgSGFuZGxpbmdcbmFwcC51c2UoZnVuY3Rpb24oZXJyLCByZXEsIHJlcywgbmV4dCkge1xuICBpZiAoZXJyLnN0YXR1c0NvZGUpIHtcbiAgICByZXMuc3RhdHVzKGVyci5zdGF0dXNDb2RlKTtcbiAgfSBlbHNlIHtcbiAgICByZXMuc3RhdHVzKDUwMCk7XG4gIH1cblxuICByZXMuc2VuZCh7XG4gICAgc3RhdHVzOiAnZXJyb3InLFxuICAgIGVycm9yTmFtZTogZXJyLm5hbWUsXG4gICAgbWVzc2FnZTogZXJyLm1lc3NhZ2VcbiAgfSk7XG59KTtcblxuLy8gU2VydmVcbnNjaGVtYS5zeW5jKCkudGhlbigoKSA9PiB7XG4gIGxldCBzZXJ2ZXIgPSBhcHAubGlzdGVuKDMwMDAsICgpID0+IHtcbiAgICBsZXQgaG9zdCA9IHNlcnZlci5hZGRyZXNzKCkuYWRkcmVzcztcbiAgICBsZXQgcG9ydCA9IHNlcnZlci5hZGRyZXNzKCkucG9ydDtcbiAgICBjb25zb2xlLndhcm4oJ0xpc3RlbmluZyBhdCAlczolcycsIGhvc3QsIHBvcnQpO1xuICB9KTtcbn0pO1xuIl19