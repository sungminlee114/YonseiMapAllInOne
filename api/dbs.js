var mysql      = require('mysql2');
var sinchonDB = mysql.createConnection({
    host     : 'localhost',
    user     : 'admin',
    password : '1234',
    port     : 3306,
    database : 'Sinchon'
  });
  
var songdoDB = mysql.createConnection({
  host     : 'localhost',
  user     : 'admin',
  password : '1234',
  port     : 3306,
  database : 'Songdo'
});

module.exports = {'sinchon' : sinchonDB, 'songdo' : songdoDB};