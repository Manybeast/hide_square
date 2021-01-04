const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const publicPath = path.join(__dirname, 'public');

const port = 7000;

const sortByField = (field) => {
  return (prev, curr) => +prev[field] < +curr[field] ? 1 : -1;
};
let results = [];

app.use(express.static(publicPath));
app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server listens http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.headers('Content-Type', 'text/html');
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/users', (req, res) => {
  fs.readFile(path.join(publicPath, 'results.txt'), 'utf8', (err, data) => {
    if (err) throw err;
    if (data === '') return false;

    results = [];

    results = results.concat(JSON.parse(data));

    results.sort(sortByField('result'));

    if (results.length > 10)
      results.slice(0, 10);

    res.send(results);
  });
});

app.post('/results', (req, res)=> {
  if(!req.body) return res.sendStatus(400);

  results.push(req.body);

  fs.writeFile(
    path.join(publicPath, 'results.txt'),
    JSON.stringify(results),
    'utf8',
    (err) => {
      if (err) throw err;

      console.log('Done')
    }
  );

  res.end();
});

app.post('/clear', (req, res)=> {
  if(!req.body) return res.sendStatus(400);

  results = [];

  fs.writeFile(
      path.join(publicPath, 'results.txt'),
      '',
      'utf8',
      (err) => {
        if (err) throw err;

        console.log('Done')
      }
  );

  res.end();
});
