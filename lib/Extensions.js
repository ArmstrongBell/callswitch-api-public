

const Extensions = function(request) {
    this.request = request;
};


Extensions.prototype.RegisterForUpdates = async function() {
    let body = "ext:list\next:info:;ext:hint:";

    let ts = Math.floor(Date.now() / 1000);
    let url=`/pwproxy/?action=subscribe&page=extension:${ts}`;
    return await this.request.client
        .post(url, body)
        .then((body) => {
            return {
                subscribeKey: ts,
                response: body.data,
            };
        });
};

Extensions.prototype.PollForUpdates = async function(subscribeKey) {
    let url=`/pwproxy/?action=get_keys&page=extension:${subscribeKey}`;
    return await this.request.client
        .get(url)
        .then((body) => body.data);
};

module.exports = Extensions;