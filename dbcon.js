var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit    : 10,
    host               : 'classmysql.engr.oregonstate.edu',
    user               : 'user',
    password           : 'password',
    database           : 'user',
    multipleStatements : 'true'
});
module.exports.pool = pool;
