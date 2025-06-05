require('dotenv').config
const server = require('./src/app.js');
const { conn } = require('./src/config/database.js');
const port = process.env.PORT || 3001;
conn.sync({ force: true }).then(() => {
  server.listen(port, () => {
    console.log('My API listening at', port);
  });
});