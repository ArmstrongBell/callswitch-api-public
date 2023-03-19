const Calls = function (request) {
  this.request = request;
};

Calls.prototype.RegisterForUpdates = function () {
  let body = "call:list\ncall:info:";
  let context = this;

  let ts = Math.floor(Date.now() / 1000);
  return this.request.client
    .post(`/pwproxy/?action=subscribe&page=channels:${ts}`, body)
    .then((body) => {
      context.subscribeKey = ts;
      context.response = body.data;
      return context.response;
    });
};

Calls.prototype.PollForUpdates = function () {
  let context = this;
  return this.request.client
    .get(`/pwproxy/?action=get_keys&page=channels:${context.subscribeKey}`)
    .then((body) => body.data)
    .catch((err) => {
      if (err.response.status === 404 && !context.isRetry) {
        //if the status is 404, then we need to re-register for updates
        console.log("Re-subscribing for call updates");
        return context.RegisterForUpdates().then(() => {
          context.isRetry = true;
          return context.PollForUpdates();
        });
      } else {
        return Promise.reject(err);
      }
    });
};

module.exports = Calls;
