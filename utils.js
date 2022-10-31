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
        const electionDetails = {
            Election_id: result.Election_id,
            Start_time: new Date(result.Start_time),
            End_time: new Date(result.End_time),
            Votes_counted: result.Votes_counted
        }
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
        try {
            var result = await excequteAsyncQuery(query)
        }
        catch (err) {
            return JSON.parse(JSON.stringify(err.sqlMessage));
        }
        return JSON.parse(JSON.stringify(result))
    }
}