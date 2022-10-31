module.exports = {
    isLoggedIn: function (req, res) {
        console.log(req.session);
        if (req.session.user_type === undefined) {
            return false;
        }
        else {
            return true;
        }
    },

    isVoter: function (req, res) {
        if (req.session.user_type && req.session.user_type === 'Voter')
            return true;
            //can be verified with DB too  
        return false;
    },

    getUserData: function (req, res) {
        if (req.session.user_type === undefined)
            return null;
        return {
            'user_type': req.session.user_type,
            'user_name': req.session.user_name,
        };
    }
}