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
        console.log(result)
        const electionDetails = {
            Election_id: result.Election_id,
            Start_time: new Date(result.Start_time),
            End_time: new Date(result.End_time),
            Votes_counted: result.Votes_counted
        }
        console.log(electionDetails)
        return electionDetails;
    }
}