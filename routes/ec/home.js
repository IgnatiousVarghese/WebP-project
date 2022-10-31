var express = require('express');
var router = express.Router();
var auth = require('../../auth');
var utils = require('../../utils');

var database = require('../../database');
var userData

/* GET home page. */
router.get('/', async function (req, res, next) {
    console.log("rendering EC home")
    var election = await utils.getElectionDetails();

    userData = auth.getUserData(req, res);
    console.log('user data - ', userData);

    // check if user is voter
    if (auth.isEc(req, res)) {
        console.log('user is EC')
        res.render('./ec/home', {
            title: 'Express',
            session: req.session,
            election: election
        })
    }
    else {
        res.redirect('../')
    }
})

router.post('/', (req, res, next) => {
    var postId = req.body.post;
    res.redirect("voter/?postId=" + postId);
})

module.exports = router;