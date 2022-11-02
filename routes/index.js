var express = require('express');
var router = express.Router();
var auth = require('../auth');
var utils = require('../utils');

var database = require('../database');
var user_data
var messages = []

/* GET home page. */
router.get('/', async function (req, res, next) {
    console.log("rendering index")

    var election = await utils.getElectionDetails();

    user_data = auth.getUserData(req, res);
    console.log(user_data);
    if (user_data === null) {
        res.render('index', {
            title: 'Express', 
            session: req.session, 
            election: election,
            messages: messages,
        });
        messages = [];
    }
    else if (user_data['user_type'] === 'Voter') {
        res.redirect('/voter')
    }
    else if (user_data['user_type'] === 'EC') {
        res.redirect('/ec')
    }
    else
        res.redirect('/logout');
});

router.post('/test', (req, res, next) => {
    
    const form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        console.log(files)
  
        var oldPath = files.profilePic.path;
        var newPath = path.join(__dirname, 'uploads')
                + '/'+files.profilePic.name
        var rawData = fs.readFileSync(oldPath)
      
        fs.writeFile(newPath, rawData, function(err){
            if(err) console.log(err)
            return res.send("Successfully uploaded")
        })
  })
});

module.exports = router;

