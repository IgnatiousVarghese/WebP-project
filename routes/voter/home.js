var express = require('express');
var router = express.Router();
var auth = require('../../auth');
var utils = require('../../utils');

var database = require('../../database');
var userData
var messages = []

/* GET home page. */
router.get('/', async function (req, res, next) {
    console.log("rendering voter home")

    // check if user is voter
    if (auth.isVoter(req, res)) {
        var election = await utils.getElectionDetails();
        var posts = await utils.getPosts();
        var postId = req.query.postId;
        console.log('postId: ' + postId)

        if (election.isElectionNotStarted) {
            console.log("Election Not Sarted")
            messages.push({
                type: "info",
                text: "election NOT started"
            })
        }
        else if (election.isElectionOver) {
            console.log("Election Over")
            messages.push({
                type: "info",
                text: "election OVER"
            })
        }
        else if (postId !== undefined) {
            userData = auth.getUserData(req, res);
            console.log('user data - ', userData);

            var post = undefined;
            var candidates = [];
            for (var i = 0; i < posts.length; i++) {
                if (Number(postId) === Number(posts[i].Id)) {
                    post = posts[i];
                    break;
                }
            }
            if (post === undefined) {
                messages.push({
                    type: "error",
                    text: "postID invalid"
                })
            }
            else {
                try {
                    candidates = await utils.getCandidatesByPostId(postId);
                    //check if voter already voted for this post 
                    if (await utils.notVoted(userData['user_name'], postId)) {
                        console.log('post' + post)
                        console.log('candidates' + JSON.stringify(candidates[0]))
                    }
                    else {
                        messages.push({
                            type: "info",
                            text: "You have already voted"
                        })
                    }
                }
                catch (err) {
                    messages.push({
                        type: "error",
                        text: "Postid invalid"
                    })
                }
            }
            res.render('./voter/view_candidate', {
                title: 'Express',
                session: req.session,
                hasVoted: false,
                election: election,
                post: post,
                candidates: candidates,
                messages: messages,
            });
            messages = []
            return;
        }
        res.render('./voter/home', {
            title: 'Express',
            session: req.session,
            election: election,
            posts: posts,
            messages: messages,
        });
        messages = []
    }
    else{
        res.redirect('../')
    }
})

router.post('/', (req, res, next) => {
    var postId = req.body.post;
    res.redirect("voter/?postId=" + postId);
})

router.post('/vote', async function (req, res, next) {
    console.log("POST req for Voting")
    console.log(req.body)
    var election = await utils.getElectionDetails();

    if (auth.isVoter(req, res) === false) {
        res.redirect('/')
        return;
    }
    else {
        if (election.isElectionOngoing === false) {
            messages.push({
                type: "info",
                text: "Election NOT OPEN",
            })
        }
        else if (req.body.postId === undefined || req.body.candidateId === undefined) {
            messages.push({
                type: "info",
                text: "Incomplete post request for vote",
            })
        }

        else {
            const postId = req.body.postId
            const candidateRollno = req.body.candidateId
            const voterRollno = auth.getUserData(req, res)['user_name']

            console.log(candidateRollno, postId, voterRollno)

            if (await utils.notVoted(voterRollno, postId)) {
                console.log("not voted")
                try {
                    var result = await utils.Vote(voterRollno, postId, candidateRollno)
                    console.log(result)
                    messages.push({
                        type: 'success',
                        text: 'Vote done successfully',
                    })
                }
                catch (err) {
                    messages.push({
                        type: 'error',
                        text: err.message,
                    })
                }
                res.redirect('/voter')
                return;
            }
            else {
                console.log("ALREADY voted")
                messages.push({
                    type: "error",
                    text: "Already VOTED"
                })
            }
        }
        res.redirect('/voter')
    }
})

module.exports = router;