const mySQL = require('mysql2');

const connection = mySQL.connection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'to_do_list'
});

if (connection) {
    console.log("connection established");
}