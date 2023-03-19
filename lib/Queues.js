const Queues = function (request) {
  this.request = request;
};

Queues.prototype.GetQueues = async function () {
  return await this.request.client
    .get(
      "/?app=pbxware&t=ccstatistics&v=queue_statistics:selqueues&server=1&noshowheader=1&noshowfooter=1&ajax=true"
    )
    .then((data) => data.data)
    .catch(() => null);
};

Queues.prototype.GetQueueAgentsAndExtensions = async function (queuename) {
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

Queues.prototype.RegisterForUpdates =  function () {
  let body =
    "queue:list\nqueue:status:;queue:members:;queue:stats;queue:calls:;queue:call:";
  let context = this;

  let ts = Math.floor(Date.now() / 1000);
  return  this.request.client
    .post(`/pwproxy/?action=subscribe&page=queue:${ts}`, body)
    .then((body) => {
      context.subscribeKey = ts;
      context.response = body.data;
      return context.response;
    });
};

Queues.prototype.PollForUpdates =  function () {
  let context = this;
  return  this.request.client
    .get(`/pwproxy/?action=get_keys&page=queue:${context.subscribeKey}`)
    .then((body) => body.data)
    .catch((err) => {
        if (err.response.status === 404 && !context.isRetry) {
          //if the status is 404, then we need to re-register for updates
          console.log("Re-subscribing for queue updates");
          return context.RegisterForUpdates().then(() => {
            context.isRetry = true;
            return context.PollForUpdates();
          });
        } else {
          return Promise.reject(err);
        }
      });

};

module.exports = Queues;
