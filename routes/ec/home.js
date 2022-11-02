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

    // check election status 
    if (election.isElectionNotStarted) {
        messages.push({
            type: 'info',
            text: 'Election NOT started yet. Please add/remove candidates'
        })
    }
    else if (election.isElectionOngoing) {
        messages.push({
            type: 'info',
            text: 'Election ongoing NO FUNTIONALITY FOR EC'
        })
    }
    else {
        if (election.complete) {
            messages.push({
                type: 'info',
                text: 'Election OVER, Results also published'
            })
        }
        else {
            messages.push({
                type: 'info',
                text: 'Election OVER, can publish results anytime'
            })
        }
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
                    voter = undefined
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
                voter = undefined
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
        // console.log('rollno-',req.body.rollno, 'name-', req.body.name, 'manifesto-', req.body.manifesto)
        if (req.body.rollno === undefined || req.body.manifesto === undefined ||
            req.body.name === undefined || req.body.photo === undefined) {
            messages.push(
                {
                    type: 'error',
                    text: 'Form not completed'
                }
            )
        }
        else {
            rollno = req.body.rollno
            if (await utils.isVoterCandidate(rollno)) {
                messages.push({
                    type: 'info',
                    text: 'Voter already a Candidate'
                })
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
                    messages.push({
                        type: 'success',
                        text: 'Voter made candidate successfully',
                    })
                }
                catch (err) {
                    messages.push({
                        type: 'error',
                        text: err.message,
                    })
                }
            }
        }
        res.redirect('add_candidate')
    }

    else {
        res.redirect('../')
    }
})

router.get('/remove_candidate', async (req, res, next) => {
    var election = await utils.getElectionDetails();
    var rollno = req.query.Rollno
    var voter = {}
    var candidate = {}
    if (election.isElectionNotStarted && auth.isEc(req, res)) {
        if (rollno !== undefined) {
            voter = await utils.getVoter(rollno);
            if (voter.length > 0) {
                if (await utils.isVoterCandidate(rollno)) {
                    candidate = await utils.getCandidatesInfo(rollno)
                    messages.push({
                        type: 'info',
                        text: 'Voter already a Candidate'
                    })
                }
                else {
                    messages.push({
                        type: 'error',
                        text: 'Voter NOT a Candidate'
                    })
                }
            }
            else {
                messages.push({
                    type: 'info',
                    text: 'Voter rollno invalid'
                })
            }
        }
        res.render('./ec/remove_candidate', {
            title: 'Express',
            session: req.session,
            election: election,
            rollno: rollno,
            candidate: candidate,
            messages: messages
        })
        messages = []
    }
    else {
        res.redirect('../')
    }
})

router.post('/remove_candidate', async function (req, res) {
    console.log('Removing Candidate')
    var election = await utils.getElectionDetails();
    if (election.isElectionNotStarted && auth.isEc(req, res)) {
        var rollno
        // console.log('rollno-',req.body.rollno)
        if (req.body.rollno === undefined) {
            messages.push(
                {
                    type: 'error',
                    text: 'Form not completed'
                }
            )
        }
        else {
            rollno = req.body.rollno
            try {
                //error if vote exists for that candidate
                await utils.removeCandidate(rollno)
                messages.push({
                    type: 'success',
                    text: 'Candidate REMOVED successfully',
                })
            }
            catch (err) {
                messages.push({
                    type: 'error',
                    text: err.message,
                })
            }
        }
        res.redirect('remove_candidate')
    }

    else {
        res.redirect('../')
    }
})

router.get('/publish_result', async function (req, res) {
    console.log('Publishing result')
    var election = await utils.getElectionDetails();
    if (election.isElectionOver && auth.isEc(req, res)) {
        try {
            var result = await utils.getElectionResult()
            messages.push({
                type: 'success',
                text: 'Election result was successfully calculated'
            })
            await utils.setElectionStatusAsComplete()
            messages.push({
                type: 'success',
                text: 'Election Status set as Complete'
            })
        } catch (error) {
            messages.push({
                type: 'error',
                text: error.message
            })
        }
    }
    if (!election.isElectionOver) {
        messages.push({
            type: 'waring',
            text: 'Can publish result only if the election is over'
        })
    }
    res.redirect('/')
})

module.exports = router;