const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const publicPath = path.join(__dirname, 'public');

const port = 3000;

const sortByPoint = (point) => {
  return (prev, curr) => +prev[point] < +curr[point] ? 1 : -1;
};
const isAuth = (req) => req.cookies.isAuth || false;

let results = [];

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.listen(port, () => {
  console.log(`Server listens http://localhost:${port}`);
});

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
  if (req.userAuth) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(publicPath, 'login.html'));
  }
});

app.get('/users', (req, res) => {
  fs.readFile(path.join(publicPath, 'results.json'), 'utf8', (err, data) => {
    if (err) throw err;
    if (data === '') return false;

    results = [];

    results = results.concat(JSON.parse(data));

    results.sort(sortByPoint('result'));

    if (results.length > 10)
      results.slice(0, 10);

    res.send(results);
  });
});

app.get('/currentUserInfo', (req, res) => {
  const userName = req.cookies.currentUser;
  const results = fs.readFileSync(path.join(publicPath, 'results.json'), 'utf8');
  const currentUserResults = JSON.parse(results).filter((item) => item.name === userName);
  const userInfo = {
    name: userName
  };

  currentUserResults.sort(sortByPoint('result'));

  userInfo.maxResult = currentUserResults[0].result;

  res.send(userInfo);
});

app.get('/logout', (req, res, next) => {
  res.clearCookie('isAuth');
  res.clearCookie('currentUser');

  res.redirect('/');
});


app.post('/login', (req, res) => {
  const data = fs.readFileSync(path.join(publicPath, 'users.json'));
  const user = JSON.parse(data).find((item) => (
      req.body.username === item.name &&
      req.body.password === item.pass
  ));

  if(user) {
    res.cookie('isAuth', true, {maxAge: 3600000});
    res.cookie('currentUser', user.name, {maxAge: 3600000});
  }

  res.redirect('/');
});

app.post('/results', (req, res)=> {
  if(!req.body) return res.sendStatus(400);

  results.push(req.body);

  fs.writeFile(
    path.join(publicPath, 'results.json'),
      JSON.stringify(results),
    'utf8',
    (err) => {
      if (err) throw err;

      console.log('Results written to file')
    }
  );

  res.end();
});

app.post('/clear', (req, res)=> {
  if(!req.body) return res.sendStatus(400);

  results = [];

  fs.writeFile(
      path.join(publicPath, 'results.json'),
      JSON.stringify(req.body),
      'utf8',
      (err) => {
        if (err) throw err;

        console.log('Results file clear')
      }
  );

  res.end();
});
