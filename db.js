const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
const dbName = 'users';

module.exports = async () => {
  await client.connect((err) => {
    console.log('Connected successfull to server')
    err && console.log(err);
  });

  return client.db(dbName);
};
