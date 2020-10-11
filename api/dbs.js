var mysql      = require('mysql');
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
  database : 'SongDo'
});

module.exports = {'sinchon' : sinchonDB, 'songdo' : songdoDB};