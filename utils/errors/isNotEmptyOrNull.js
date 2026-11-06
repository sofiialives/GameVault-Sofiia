const isNotEmptyOrNull = (value) => {
    return value !== null && value !== undefined && value !== "";
};

module.exports = isNotEmptyOrNull;