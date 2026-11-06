const ctrlWrapper = (ctrl) => {
    const fn = async (req, res, next) => {
        try {
            await ctrl(req, res, next);
        } catch (error) {
            if (typeof next === "function") {
                next(error);
            } else {
                console.error("Error:", error);
            }
        }
    };
    return fn;
};

module.exports = ctrlWrapper;