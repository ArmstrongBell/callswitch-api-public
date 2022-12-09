const axios = require("axios");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar, Cookie, MemoryCookieStore } = require("tough-cookie");
const Request = require("./Request");
const Queues = require("./Queues");
const Agents = require("./Agents");
const Calls = require("./Calls");

const API = function(tenant, username, password) {
    this.username = username;
    this.tenant = tenant;
    this.password = password;
    this.request = new Request(tenant, username, password);
    this.client = null;
    this.calls = new Calls(this.request);
    this.queues = new Queues(this.request);
    this.agents = new Agents(this.request);
};

API.prototype.Authenticate = async function() {
    return await this.request.Authenticate();
};

module.exports = API;