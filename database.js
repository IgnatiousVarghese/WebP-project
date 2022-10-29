const mysql = require('mysql');

const connection = mysql.createConnection({
	host : 'localhost',
	database : 'test',
	user : 'root',
	password : '1234'
});

connection.connect(function(error){
	if(error)
	{
		throw error;
	}
	else
	{
		console.log('MySQL Database is connected Successfully');
	}
});

module.exports = connection;