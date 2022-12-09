const Queues = function(request) {
    this.request = request;
};

Queues.prototype.GetQueues = async function() {
    return await this.request.client
        .get(
            "/?app=pbxware&t=ccstatistics&v=queue_statistics:selqueues&server=1&noshowheader=1&noshowfooter=1&ajax=true"
        )
        .then((data) => data.data)
        .catch(() => null);
};

Queues.prototype.GetQueueAgentsAndExtensions = async function(queuename) {
    return await this.request.client
        .get(
            `/?app=pbxware&e=callcenter&t=queues&v=queues:monitorqueue&noshowheader=1&noshowfooter=1&server=1&id=${queuename}&getmembersdata=true&ajax=true`
        )
        .then((data) => {
            return {
                agents: data.data.agentsData,
                extensions: data.data.extensionsData,
            };
        })
        .catch(() => null);
};

Queues.prototype.RegisterForUpdates = async function() {
    let body =
        "queue:list\nqueue:status:;queue:members:;queue:stats;queue:calls:;queue:call:";

    let ts = Math.floor(Date.now() / 1000);
    return await this.request.client
        .post(`/pwproxy/?action=subscribe&page=queue:${ts}`, body)
        .then((body) => {
            return {
                subscribeKey: ts,
                response: body.data,
            };
        });
};

Queues.prototype.PollForUpdates = async function(subscribeKey) {
    return await this.request.client
        .get(`/pwproxy/?action=get_keys&page=queue:${subscribeKey}`)
        .then((body) => body.data);
};

module.exports = Queues;