const express = require('express');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const auth = require('../../auth');
const utils = require('../../utils');

var database = require('../../database');
var userData
var messages = []

/* GET home page. */
router.get('/', async function (req, res, next) {
    console.log("rendering EC home")
    var election = await utils.getElectionDetails();

    userData = auth.getUserData(req, res);
    console.log('user data - ', userData);

    // check if election ongoing
    if (election.isElectionOngoing) {
        messages.push({
            type: 'info',
            text: 'Election ongoing NO FUNTIONALITY FOR EC'
        })
    }
    // check if user is EC
    if (auth.isEc(req, res)) {
        console.log('user is EC')
        res.render('./ec/home', {
            title: 'Express',
            session: req.session,
            election: election,
            messages: messages
        })
        messages = []
    }
    else {
        res.redirect('../')
    }
})

router.get('/add_candidate', async (req, res, next) => {
    var election = await utils.getElectionDetails();
    if (election.isElectionNotStarted && auth.isEc(req, res)) {
        var rollno = req.query.Rollno
        var voter = {}
        var posts = []
        if (rollno !== undefined) {
            voter = await utils.getVoter(rollno);
            if (voter.length > 0) {
                if (await utils.isVoterCandidate(rollno)) {
                    messages.push({
                        type: 'info',
                        text: 'Voter already a Candidate'
                    })
                }
                else {
                    posts = await utils.getPosts()
                    voter = voter[0]
                }
            }
            else {
                messages.push({
                    type: 'info',
                    text: 'Voter rollno invalid'
                })
                rollno = undefined
            }
        }
        res.render('./ec/add_candidate', {
            title: 'Express',
            session: req.session,
            election: election,
            rollno: rollno,
            voter: voter,
            posts: posts,
            messages: messages
        })
        messages = []
    }
    else {
        res.redirect('../')
    }
})

router.post('/add_candidate', async function (req, res) {
    console.log('Adding Candidate')
    var election = await utils.getElectionDetails();
    if (election.isElectionNotStarted && auth.isEc(req, res)) {
        var rollno
        if (req.body.rollno === undefined || req.body.manifesto === undefined ||
            req.body.name === undefined || req.body.photo === undefined) {
            res.render('message', {
                title: 'Express',
                session: req.session,
                election: election,
                messages: [
                    {
                        type: 'info',
                        text: 'Form not completed'
                    }
                ]
            });
        }
        else {
            rollno = req.body.rollno
            if (await utils.isVoterCandidate(rollno)) {
                messages.push({
                    type: 'info',
                    text: 'Voter already a Candidate'
                })
                res.redirect('add_candidate')
            }
            else {
                const uploadFolder = path.join(__dirname, "..", "..", "public", "images", "candidates");
                const fileName = String(rollno) + ".png";
                //tried uploading pic not working properly
                //so duplication pic to corresponding candidate

                fs.copyFileSync(path.join(uploadFolder, 'candidate3.png'),
                    path.join(uploadFolder, fileName), 2)

                // adding candidate to DB
                postId = req.body.postId
                manifesto = req.body.manifesto
                try {
                    await utils.addCandidate(rollno, postId, manifesto, "images\\\\candidates\\\\" + fileName)
                }
                catch (err) {
                    console.log(err)
                }
            }


        }
    }

    else {
        res.redirect('../')
    }
})

module.exports = router;