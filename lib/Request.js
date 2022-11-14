const axios = require("axios");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar, Cookie, MemoryCookieStore } = require("tough-cookie");
const fs = require("fs");

const Request = function(tenant, username, password) {
    this.username = username;
    this.tenant = tenant;
    this.password = password;
    this.jar = new CookieJar(new MemoryCookieStore(), {
        rejectPublicSuffixes: true,
    });

    this.client = null;
};

Request.prototype.Authenticate = function() {
    var FormData = require("form-data");
    var data = new FormData();

    data.append("email", this.username);
    data.append("password", this.password);
    data.append("sm_int_login", "Login");

    let url = `https://${this.tenant}.callswitch.net/`;
    console.log(url);
    this.client = wrapper(axios.create({ jar: this.jar, baseURL: url }));
    let errorMatch = /id="error".*?>(?:<.*?>)*(.*?)(?:<\/.*?>)*\n/;
    return this.client
        .post("", data, { headers: data.getHeaders() })
        .then(async(response) => {
            if (response.data && response.data.match(errorMatch))
                return { result: false, error: response.data.match(errorMatch)[1] };
            else return { result: true, error: null };
        });
};


module.exports = Request;