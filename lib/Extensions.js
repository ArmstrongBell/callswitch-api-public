const Extensions = function (request) {
  this.request = request;
};

Extensions.prototype.RegisterForUpdates = function () {
  let body = "ext:list\next:info:;ext:hint:";
  let context = this;

  let ts = Math.floor(Date.now() / 1000);
  let url = `/pwproxy/?action=subscribe&page=extension:${ts}`;
  return this.request.client.post(url, body).then((body) => {
    context.subscribeKey = ts;
    context.response = body.data;
    return context.response;
  });
};

Extensions.prototype.PollForUpdates = function () {
  let context = this;

  let url = `/pwproxy/?action=get_keys&page=extension:${context.subscribeKey}`;
  return this.request.client.get(url).then((body) => body.data)
  .catch((err) => {
    if (err.response.status === 404 && !context.isRetry) {
      //if the status is 404, then we need to re-register for updates
      console.log("Re-subscribing for extension updates");
      return context.RegisterForUpdates().then(() => {
        context.isRetry = true;
        return context.PollForUpdates();
      });
    } else {
      return Promise.reject(err);
    }
  });;
};

module.exports = Extensions;
