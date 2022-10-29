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

    getUserData: function (req, res) {
        if (req.session.user_type === undefined)
            return null;
        return {
            'user_type': req.session.user_type,
            'user_name': req.session.user_name,
        };
    }
}