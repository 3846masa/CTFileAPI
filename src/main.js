// Import
import 'babel/polyfill';
import { promisify, promisifyAll } from 'bluebird';
import { install as sourceMapSupport } from 'source-map-support';
sourceMapSupport();

import path from 'path';
import fs from 'fs';
import config from 'config';
import projectRoot from 'app-root-path';
import { sha3_512 } from 'js-sha3';

import Database from 'sequelize';

import express from 'express';
import expressSession from 'express-session';
import expressLog from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';

import Errors from './errors';

// Promisify
promisifyAll(fs);

// Variable
let app = express();
let twitterStrategy = new TwitterStrategy(
  {
    consumerKey: process.env['TWITTER_CONSUMER_KEY'] || config.get('TWITTER_CONSUMER_KEY'),
    consumerSecret: process.env['TWITTER_CONSUMER_SECRET'] || config.get('TWITTER_CONSUMER_SECRET'),
    callbackURL: 'http://localhost:3000/auth/twitter/callback'
  },
  (token, tokenSecret, profile, done) => {
    done(null, profile);
  }
);

let schema = new Database('database', null, null, {
  dialect: 'sqlite',
  storage: path.resolve(projectRoot.path, 'database.sqlite')
});
let models = schema.models;

let staticPath = path.resolve(projectRoot.path, 'static');

// Settings
// // Database
schema.define('User', {
  userID: {
    type: Database.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  userName: Database.TEXT,
  displayName: Database.TEXT,
  iconUrl: Database.TEXT,
  score: {
    type: Database.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});
schema.define('Score', {
  userID: {
    type: Database.INTEGER,
    allowNull: false
  },
  questionNameHash: {
    type: Database.STRING,
    allowNull: false
  },
  score: {
    type: Database.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  indexes: [
    { fields: [ 'userID' ] },
    { fields: [ 'questionNameHash' ] }
  ]
});

// // Passport
passport.use(twitterStrategy);
passport.serializeUser((user, done) => { (async () => {
  let userData = {
    userID: user.id,
    userName: user.username,
    displayName: user.displayName,
    iconUrl: user.photos[0].value
  };
  await models.User.findOrCreate({
    where: { userID: user.id },
    default: userData
  });
  await models.User.update(userData, {
    where: { userID: user.id },
    slient: true
  });
  return { userID: user.id };
})().then((val) => done(null, val)).catch(done); });

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// // Express
app.use(expressLog('combined'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(expressSession({
  secret: 'testctf',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', express.static(staticPath));

// Routing
app.get('/', (req, res) => {
  res.json({'status': 'ok'});
});

app.get('/questionList.json', (req, res, next) => { (async () => {
  let filesAndFolders = await fs.readdirAsync(staticPath);
  let folders = filesAndFolders.filter((file) => {
    let stat = fs.statSync(path.resolve(staticPath, file));
    return stat.isDirectory();
  });
  res.json(folders);
})().catch(next); });

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/user',
    failureRedirect: '/error/login'
  })
);

app.get('/login', (req, res) => {
  if (!req.user) res.redirect('/auth/twitter');
  else res.redirect('/user');
});

app.get('/user', (req, res, next) => { (async () => {
  if (!req.user) throw new Errors.Login('Login is required.');
  let userData = await models.User.findOne({ where: { userID: req.user.userID } });
  if (!userData) throw new Errors.Login('Login is required.');
  Object.assign(userData, { userID: undefined });
  res.json({'status': 'ok', 'user': userData});
})().catch(next); });

app.get('/scores', (req, res, next) => { (async () => {
  let data = await models.User.all({ sort: 'score' });
  data = data.map((info) => Object.assign(info, { userID: undefined }));
  res.json({'status': 'ok', 'scores': data});
})().catch(next); });

app.post('/submit', (req, res, next) => { (async () => {
  if (!req.get('Content-Type').includes('application/json')) {
    throw new Errors.BadRequest('Should to set "Content-Type: application/json".');
  }
  if (!req.user) throw new Errors.Login('Login is required.');
  let userData = await models.User.findOne({ where: { userID: req.user.userID } });
  if (!userData) throw new Errors.Login('Login is required.');
  if (!req.body.question || !req.body.flag) {
    throw new Errors.BadRequest('Require question name and flag.');
  }

  let questionPath = path.resolve(staticPath, req.body.question);
  if (!questionPath.includes(staticPath)) {
    throw new Errors.BadRequest('Invalid question name.');
  }
  await fs.statAsync(questionPath)
    .catch(() => { throw new Errors.NotFound('Question is not found.'); });

  let flagPath = path.resolve(questionPath, 'FLAG.sha3-512');
  let trueFlagHash = await fs.readFileAsync(flagPath)
    .then((hash) => hash.toString().replace(/\s/g, '').toLowerCase())
    .catch((err) => { throw new Errors.Internal(err.stack); });

  let userFlagHash = sha3_512(req.body.flag).replace(/\s/g, '').toLowerCase();

  if (trueFlagHash === userFlagHash) {
    let questionName = path.relative(staticPath, questionPath);
    let questionNameHash = sha3_512(questionName).replace(/\s/g, '').toLowerCase();
    let score = parseInt(questionName.split('-')[1], 10) || 0;
    let query = {
      userID: userData.userID,
      questionNameHash: questionNameHash
    };

    let scoreInfo = await models.Score.findOne(query);

    if (!scoreInfo) {
      await models.Score.create(
        Object.assign({}, query, { score: score })
      );
      await models.User.update(
        { score: userData.score + score },
        { where: { userID: userData.userID } }
      );
      res.json({'status': 'ok'});
    } else {
      res.json({'status': 'ok', 'message': 'Already submitted.'});
    }
  } else {
    throw new Errors.InvalidFlag();
  }

})().catch(next); });

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/error/:reason', (req, res, next) => {
  if (req.params.reason === 'login') {
    next(new Errors.Login('Can\'t Login.'));
  } else {
    next(new Errors.API('Internal Server Error.'));
  }
});

app.all('/teapot', (req, res, next) => {
  next(new Errors.Teapot());
});

app.get('*', function(req, res, next) {
  next(new Errors.NotImplemented());
});

// Error Handling
app.use(function(err, req, res, next) {
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
schema.sync().then(() => {
  let server = app.listen(3000, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.warn('Listening at %s:%s', host, port);
  });
});
