const axios = require("axios");
const Request = require("./Request");
const Queues = require("./Queues");
const Agents = require("./Agents");
const Calls = require("./Calls");
const Extensions = require("./Extensions");

const API = function(tenant, username, password) {
    this.username = username;
    this.tenant = tenant;
    this.password = password;
    this.request = new Request(tenant, username, password);
    this.client = null;
    this.calls = new Calls(this.request);
    this.queues = new Queues(this.request);
    this.agents = new Agents(this.request);
    this.extensions = new Extensions(this.request);
    console.log(":: Using API featuring re-authentication functionality ::")
};

API.prototype.Authenticate = async function() {
    return await this.request.Authenticate();
};

module.exports = API;