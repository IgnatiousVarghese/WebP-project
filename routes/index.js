var express = require('express');
var router = express.Router();
var auth = require('../auth');

var database = require('../database');
var user_data

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("rendering index")
    user_data = auth.getUserData(req, res);
    console.log(user_data);
    if (user_data === null) {
        res.render('index', { title: 'Express', session: req.session });
    }
    else if(user_data['user_type'] === 'Voter'){
        res.render('./voter/home', { title: 'Express', session: req.session });
    }
    else if(user_data['user_type'] === 'EC'){
        res.render('./ec/home', { title: 'Express', session: req.session });
    }
    else
        res.redirect('/logout');
});

module.exports = router;

