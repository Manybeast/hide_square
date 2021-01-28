const connection = require('./db');
const ObjectId = require('mongodb').ObjectID;
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require( 'bcrypt' );
const salt = bcrypt.genSaltSync(10);
const session = require('express-session');
const sessionParams = {
  secret: 'secret-word',
  cookie: {originalMaxAge: 3600000},
  resave: true,
  saveUninitialized: true
};

const app = express();
const publicPath = path.join(__dirname, 'public');
const port = 3000;
const usersDbName = 'info';
const resultsDbName = 'results';

const isAuth = (req) => req.session.userId || false;
const isValid = async (body) => {
  const name = body.username.trim();
  const login = body.login.trim();
  const pass = body.password.trim();
  const confirm = body.confirm.trim();
  const userData = await db.collection(usersDbName).findOne({login: login});
  let verificationData = {};

  if (!!userData) {
    verificationData.regLoginError = 'The login you entered is already in use';
  }

  if (!(/^[a-z0-9]{3,}$/.test(login))) {
    verificationData.regLoginError = 'The length must be 3 or more characters. Only small letters or numbers can be used';
  }

  if (!(/^[a-z0-9]{8,}$/i.test(pass))) {
    verificationData.regPasswordError = 'The length must be 8 or more characters. Only letters or numbers can be used';
  }

  if (name.search(/[^\w\s]/gi) > 0 || name === '') {
    verificationData.regNameError = 'The length must be 3 or more characters. Only letters, space or numbers can be used';
  }

  if (confirm !== pass || confirm === '') {
    verificationData.regConfirmError = 'The entered password and password confirmation do not match';
  }

  return verificationData;
};

let db;

const init = async () => {
  db = await connection();

  app.listen(port, () => {
    console.log(`Server listens http://localhost:${port}`);
  });
  app.use(express.static(publicPath));
  app.use(bodyParser.json());
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use(session(sessionParams));
  app.use((err, req, res, next) => {
    res.status(400).send(`<pre>${err.message}</pre>`);
  });
  app.use((req, res, next) => {
    req.userAuth = isAuth(req);

    return next();
  });

  app.get('/', (req, res) => {
    if (req.userAuth) {
      res.sendFile(path.join(publicPath, 'main.html'));
    } else {
      res.sendFile(path.join(publicPath, 'login.html'));
    }
  });

  app.get('/login', (req, res) => {
    res.redirect('/');
  });

  app.get('/registration', (req, res) => {
    res.redirect('/');
  });

  app.get('/results', async (req, res) => {
    let results = await db.collection(resultsDbName).find({}).sort({result: -1}).toArray();

    res.send(results);
  });

  app.get('/currentUserInfo', async (req, res) => {
    const userId = req.session.userId;
    let currentUser = await db.collection(resultsDbName).find({id: userId}).sort({result: -1}).toArray();
    let userInfo= {
      name: req.session.userName,
      maxResult: 0
    };

    if (currentUser.length) {
      userInfo.maxResult = currentUser[0].result;
    }

    res.send(userInfo);
  });

  app.get('/logout', (req, res) => {
    req.session.destroy();

    res.end();
  });

  app.post('/registration', async (req, res) => {
    const verificationResult = await isValid(req.body);

    if (Object.keys(verificationResult).length) return res.status(400).json(verificationResult);

    const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
    const now = new Date();
    const user = await db.collection(usersDbName).insertOne({
      name: req.body.username,
      login: req.body.login,
      password: bcrypt.hashSync(req.body.password, salt),
      date: `${now.getDate()}/${now.getMonth() < 9 ? '0' + (now.getMonth() + 1) : now.getMonth()}/${now.getFullYear()}`,
      role: 'gamer',
      ip: ip
    });
    const userData = user.ops[0];

    if(user.result.ok) {
      req.session.userId = userData._id;
      req.session.userName = userData.name;
    }

    res.end();
  });

  app.post('/login', async (req, res) => {
    try {
      const userData = await db.collection(usersDbName).findOne({login: req.body.login.trim()});
      const passwordValid = userData && bcrypt.compareSync(req.body.password.trim(), userData.password);

      if (!userData) return res.status(401).json({ errorInput: 'LOGIN' });

      if(passwordValid) {
        req.session.userId = userData._id;
        req.session.userName = userData.name;
        return res.end();
      } else {
        return res.status(401).json({ errorInput: 'PASSWORD' });
      }
    } catch (e) {
      return res.sendStatus(400);
    }
  });

  app.post('/results', async (req, res)=> {
    if(!req.body) return res.sendStatus(400);

    const newResults = await db.collection(resultsDbName).insertOne({
      id: req.session.userId,
      name: req.session.userName,
      result: req.body.result,
    });

    res.send(newResults.ops);
  });

  app.post('/clear', async (req, res)=> {
    if(!req.body) return res.sendStatus(400);

    const cleanResults = await db.collection(resultsDbName).deleteMany({});

    res.end();
  });
};

init();
