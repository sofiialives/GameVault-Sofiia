const errorMessages = require("./codeMessaes");

const httpError = (status, message = errorMessages(status), details) => {
    const error = new Error(message);
    error.status = status;
    if (details) error.details = details;
    return error;
};

module.exports = httpError;
