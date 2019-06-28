module.exports = async function (context, req) {
    if (!req.body) {
        context.res(400, "POST body must be present");
    }

    context.res(200, req.body);
};
