var express = require('express');
var router = express.Router();
var auth = require('../../auth');
var utils = require('../../utils');

var database = require('../../database');
var userData

/* GET home page. */
router.get('/', async function (req, res, next) {
    console.log("rendering voter home")
    var election = await utils.getElectionDetails();

    userData = auth.getUserData(req, res);
    console.log('user data - ', userData);

    // check if user is voter
    if (auth.isVoter(req, res)) {
        var posts = await utils.getPosts();

        // check if postId parameter is present
        if (req.query.postId !== undefined) {
            var postId = req.query.postId;
            var post
            for (var i = 0; i < posts.length; i++) {
                if (Number(postId) === Number(posts[i].Id)) {
                    post = posts[i];
                    break;
                }
            }

            //check if voter already voted for this post 
            if (await utils.notVoted(userData['user_name'], postId)) {
                var candidates = await utils.getCandidatesByPostId(postId);
                console.log('post' + post)
                console.log('candidates' + candidates)
                res.render('./voter/view_candidate', {
                    title: 'Express',
                    session: req.session,
                    hasVoted: false,
                    election: election,
                    post: post,
                    candidates: candidates,
                });
            }
            else{
                res.render('./voter/vote_done', {
                    title: 'Express',
                    session: req.session,
                    hasVoted: true,
                    election: election,
                    post: post,
                });
            }
        }

        else {
            res.render('./voter/home', {
                title: 'Express',
                session: req.session,
                election: election,
                posts: posts,
            });
        }
    }
    else {
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

    if (auth.isVoter(req, res) === false ||
        req.body.postId === undefined || req.body.candidateId === undefined) {
        res.redirect('/');
    }

    const postId = req.body.postId
    const candidateRollno = req.body.candidateId
    const voterRollno = auth.getUserData(req, res)['user_name']

    console.log(candidateRollno, postId, voterRollno)

    if (await utils.notVoted(voterRollno, postId)) {
        console.log("not voted")

        var result = await utils.Vote(voterRollno, postId, candidateRollno)
        console.log(result)
        res.redirect('/voter/?postId=' + postId)

    }
    else {
        console.log("ALREADY voted")
        res.redirect('/voter')
    }


})

module.exports = router;