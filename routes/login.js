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

            messages.push({
                type: 'error',
                text: 'Invalid User type'
            })
            response.render('login', {
                title: 'Express',
                session: request.session,
                messages: messages,
            })
            messages = [];
            return;
        }

        database.query(query, function (error, data) {
            var result = JSON.parse(JSON.stringify(data));
            console.log(result);
            if (result.length > 0) {
                if (user_type === 'Voter') {
                    if (result[0].Password === user_password) {
                        request.session.user_name = result[0].Rollno;
                        request.session.user_type = user_type;

                        response.redirect("/");
                    }
                    else {

                        messages.push({
                            type: 'error',
                            text: 'Incorrect password'
                        })
                        response.render('login', {
                            title: 'Express',
                            session: request.session,
                            messages: messages,
                        })
                        messages = [];
                        return;
                    }
                }
                else {
                    if (result[0].Password === user_password) {
                        request.session.user_name = result[0].Username;
                        request.session.user_type = user_type;

                        response.redirect("/");
                    }
                    else {

                        messages.push({
                            type: 'error',
                            text: 'Incorrect password'
                        })
                        response.render('login', {
                            title: 'Express',
                            session: request.session,
                            messages: messages,
                        })
                        messages = [];
                        return;
                    }
                }
            }
                else {

                    messages.push({
                        type: 'error',
                        text: 'Username not in database'
                    })
                    response.render('login', {
                        title: 'Express',
                        session: request.session,
                        messages: messages,
                    })
                    messages = [];
                    return;
                }
        });
    }
    
    else {
        messages.push({
            type: 'error',
            text: 'Incomplete Form'
        })
        response.render('login', {
            title: 'Express',
            session: request.session,
            messages: messages,
        })
        messages = [];
        return;
    }

});


module.exports = router;

