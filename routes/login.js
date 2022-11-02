var express = require('express');
var router = express.Router();

var database = require('../database');
var auth = require('../auth');
var messages = []

/* GET home page. */
router.get('/', function (req, res, next) {
    if (auth.isLoggedIn(req, res)) {
        res.redirect('../')
    }
    else {
        res.render('login', {
            title: 'Express',
            session: req.session,
            messages: messages,
        });
        messages = [];
    }
});

router.post('/', function (request, response, next) {

    var user_type = request.body.user_type;

    var user_name = request.body.user_name;

    var user_password = request.body.user_password;

    if (user_type && user_name && user_password) {
        var query = `
        SELECT * FROM user_login 
        WHERE user_email = "${user_name}";
        `;

        if (user_type === 'Voter') {
            query = `
            SELECT * FROM voter 
            WHERE Rollno = "${user_name}";            
            `
        }
        else if (user_type === 'EC') {
            query = `
            SELECT * FROM ELECTION_COORDINATOR 
            WHERE username = "${user_name}";            
            `
        }
        else {
            response.send('Invalid user type');
            response.end();
        }

        database.query(query, function (error, data) {
            var result = JSON.parse(JSON.stringify(data));
            console.log(result);
            if (result.length > 0) {
                if (user_type === 'Voter') {
                    if (result[0].Password === user_password) {
                        request.session.user_name = result[0].Rollno;
                        request.session.user_type = user_type;
                        response.h

                        response.redirect("/");
                    }
                    else
                        response.send('Incorrect Password');
                }
                else {
                    if (result[0].Password === user_password) {
                        request.session.user_name = result[0].Username;
                        request.session.user_type = user_type;

                        response.redirect("/");
                    }
                    else
                        response.send('Incorrect Password');
                }
            }
            else {
                response.send('Username NOT IN DATABASE');
            }
            response.end();
        });
    }
    else {
        response.send('Please Enter Email Address and Password Details');
        response.end();
    }

});


module.exports = router;

