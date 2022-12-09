const Calls = function(request) {
    this.request = request;
};

Calls.prototype.RegisterForUpdates = async function() {
    let body = "call:list\ncall:info:";

    let ts = Math.floor(Date.now() / 1000);
    return await this.request.client
        .post(`/pwproxy/?action=subscribe&page=channels:${ts}`, body)
        .then((body) => {
            return {
                subscribeKey: ts,
                response: body.data,
            };
        });
};

Calls.prototype.PollForUpdates = async function(subscribeKey) {
    return await this.request.client
        .get(`/pwproxy/?action=get_keys&page=channels:${subscribeKey}`)
        .then((body) => body.data);
};

module.exports = Calls;