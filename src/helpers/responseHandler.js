const errorResponse = (req, res, statusCode, message) => {
    return res.status(statusCode).json({
        ok: false,
        message: message
    })
};

const successResponse = (res, statusCode, message, data) => {
    return res.status(statusCode).json({
        ok: true,
        message: message,
        daya: data
    })
}

module.exports = { errorResponse, successResponse };