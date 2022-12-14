var database = require('./database');


function excequteAsyncQuery(query) {
    return new Promise((resolve, reject) => {
        database.query(query, (error, elements) => {
            if (error) {
                return reject(error);
            }
            return resolve(elements);
        });
    });
}

module.exports = {
    getElectionDetails: async function () {
        var query = `SELECT * FROM election limit 1;`
        var result = await excequteAsyncQuery(query)
        result = JSON.parse(JSON.stringify(result))[0]
        var Start_time = new Date(result.Start_time)
        var End_time = new Date(result.End_time)
        var time_now = new Date()
        var complete = Boolean(result.Votes_counted)

        var isElectionOngoing = time_now > Start_time && time_now < End_time
        var isElectionNotStarted = time_now < Start_time && time_now < End_time
        var isElectionOver = time_now > Start_time && time_now > End_time


        const electionDetails = {
            Election_id: result.Election_id,
            Start_time: Start_time,
            End_time: End_time,
            complete: complete,
            isElectionOngoing: isElectionOngoing,
            isElectionNotStarted: isElectionNotStarted,
            isElectionOver: isElectionOver,
        }
        // console.log(electionDetails)
        return electionDetails;
    },

    getPosts: async function () {
        var query = `SELECT * FROM post;`
        var result = await excequteAsyncQuery(query)
        result = JSON.parse(JSON.stringify(result))
        return result;
    },

    getCandidatesByPostId: async function (postId) {
        var query = `SELECT c.*, v.Name FROM candidate c 
        INNER JOIN voter v ON (c.Rollno = v.Rollno) WHERE post_id = ${postId};`
        var result = await excequteAsyncQuery(query)
        result = JSON.parse(JSON.stringify(result))
        return result;
    },

    getCandidatesInfo: async function (rollno) {
        var query = `SELECT c.Rollno, v.Name, p.name as Post_name
                FROM ((candidate c INNER JOIN voter v ON c.Rollno = v.Rollno )
                INNER JOIN post p ON c.post_id = p.id)
                where c.rollno = '${rollno}';`
        var result = await excequteAsyncQuery(query)
        result = JSON.parse(JSON.stringify(result))
        console.log(JSON.stringify(result))
        return result;
    },

    addCandidate: async function (rollno, postId, manifesto, photo) {
        console.log(photo)
        var query = `INSERT INTO candidate values ('${rollno}', '${postId}', '${manifesto}', '${photo}');`
        return await excequteAsyncQuery(query)
    },

    removeCandidate: async function (rollno) {
        var query = `DELETE FROM candidate WHERE rollno = '${rollno}';`
        var result = await excequteAsyncQuery(query)
        return JSON.parse(JSON.stringify(result))
    },

    isVoterCandidate: async function (rollno) {
        var query = `SELECT * FROM candidate WHERE rollno = '${rollno}';`
        var result = await excequteAsyncQuery(query)
        result = JSON.parse(JSON.stringify(result))
        console.log('isVoterCandidate-', result.length !== 0)
        return result.length !== 0
    },

    getVoter: async function (Rollno) {
        var query = `SELECT * from Voter where (rollno = '${Rollno}');`
        var result = await excequteAsyncQuery(query)
        result = JSON.parse(JSON.stringify(result))
        return result;
    },

    notVoted: async function (voterRollno, postId) {
        var query = `select * from vote where post_id = ${postId} and voter_id = '${voterRollno}';`
        var result = await excequteAsyncQuery(query)
        result = JSON.parse(JSON.stringify(result))
        if (result.length === 0) {
            return true
        }
        return false
    },

    Vote: async function (voterRollno, postId, candidateRollno) {
        var query =
            `Insert into vote (voter_id, Post_id, Candidate_id, Cast_time) 
                values (
                (select rollno from voter where rollno = '${voterRollno}'),
                ${postId}, 
                (select rollno from candidate where Rollno = '${candidateRollno}'), 
                now()
                );`

        var result = await excequteAsyncQuery(query)
        return JSON.parse(JSON.stringify(result))
    },

    getElectionResult: async function () {
        var query = `select count(voter_id) as vote_count, candidate_id, post_id, name as post_name 
                    from (vote inner join post p on p.id = vote.post_id	)
                    group by candidate_id order by vote_count desc;`
        var result = await excequteAsyncQuery(query)
        return JSON.parse(JSON.stringify(result))
    },

    setElectionStatusAsComplete: async function () {
        var query = `update election set votes_counted = 1 where election_id = 1;`
        var result = await excequteAsyncQuery(query)
        return JSON.parse(JSON.stringify(result))
    },
}