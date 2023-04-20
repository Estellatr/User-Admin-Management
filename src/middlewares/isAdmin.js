const { errorResponse } = require("../helpers/responseHandler");
const User = require("../models/users");

const isAdmin = async (req, res, next) => {
    try {
        const id = req.session.userID;
        
        
        if (id) {
            const adminData = await User.findById()
            if (adminData?.is_admin ===1) {
                next()
            } else {
                errorResponse(res, 401, "You must be an admin to access this page.")
            }
        } else {
            return errorResponse(res, 400, 'Please Login.')
        }
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    isAdmin
}