const isLoggedIn = (req, res, next) => {
    try {
        if (req.session.userID) {
            next()
        } else {
            return res.status(400).json({
                message: "You need to login."
            })
        }
    } catch (error) {
        console.log(error)
    }
};

const isLoggedOut = (req, res, next) => {
    try {
        if (req.session.userID) {
            return res.status(400).json({
                message: "You need to logout"
            })
        } next();
    } catch (error) {
        console.log(error)
    }
}

module.exports = { isLoggedIn, isLoggedOut };