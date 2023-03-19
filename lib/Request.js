const axios = require("axios");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar, Cookie, MemoryCookieStore } = require("tough-cookie");
const fs = require("fs");

const Request = function (tenant, username, password) {
  this.username = username;
  this.tenant = tenant;
  this.password = password;
  this.jar = new CookieJar(new MemoryCookieStore(), {
    rejectPublicSuffixes: true,
  });

  let url = `https://${this.tenant}.callswitch.net/`;
  this.client = wrapper(axios.create({ jar: this.jar, baseURL: url }));
  this.client.interceptors.response.use(
    CreateOKCodeIntercept(this.client, this),
    CreateErrorCodeIntercept(this.client, this)
  );
};

Request.prototype.Authenticate = function () {
  var FormData = require("form-data");
  var data = new FormData();

  data.append("email", this.username);
  data.append("password", this.password);
  data.append("sm_int_login", "Login");

  let errorMatch = /id="error".*?>(?:<.*?>)*(.*?)(?:<\/.*?>)*\n/;
  return this.client
    .post("", data, { headers: data.getHeaders(), isAuthRequest: true })
    .then(async (response) => {
      if (response.data && response.data.match(errorMatch))
        return { result: false, error: response.data.match(errorMatch)[1] };
      else return { result: true, error: null };
    });
};

function CreateOKCodeIntercept(axiosInstance, request) {
  // Instead of giving a 401 reponse to invalid credentials and then re-directing to the login page,
  // callswitch instead sends the HTML of the login page with a 200 OK response to any protected URL.
  // This means, instead of looking for a 401 or 403 reponse, we have to check every response to see if the html
  // looks like the login page. If this is the case then we can tell that auth has failed, and we should re-try
  // Note: we must make an exception to handle when the actual login page is served as part of the authenticate procedure
  // In this case we should skip the re-auth logic to prevent a execution loop
  // MG: 16/03/2023

  return (response) => {
    if (response.config.isAuthRequest) return Promise.resolve(response);
    else {
      if (
        response.data.includes("login_button") ||
        response.data.includes("login_password_field")
      ) {
        console.log("Credentials failed, attempting to re-authenticate...");
        //try to reauthenticate...
        return request.Authenticate().then((authResult) => {
          //check if the re-auth has worked, if so, then send back a promise to get the orginal page
          if (authResult.result == true) {
            console.log(
              "Re-authnetication successful, getting the page originally requested"
            );
            return axiosInstance({
              url: response.config.url,
              method: response.config.method,
              data: response.config.data,
              hasReauthenticated: true,
            });
          }
          //otherwise, return to original response
          else {
            console.log(
              "Re-authentication failed, returning the original response (can't recover)"
            );

            return Promise.resolve(response);
          }
        });
      }
      // we're not seeing the loging page html - all looks good, return the original response
      else return Promise.resolve(response);
    }
  };
}

function CreateErrorCodeIntercept(axiosInstance, request) {
  return (response) => {
    let {
      config,
      response: { status },
    } = response;

    // Check if the error is due to server  authentication failure
    if (status === 401 || status === 403) {
      if (response.config.isAuthRequest) return response;

      console.log(
        `Got response code ${status}, attempting to re-authenticate...`
      );
      //try to reauthenticate...
      return request.Authenticate().then((authResult) => {
        //check if the re-auth has worked, if so, then send back a promise to get the orginal page
        if (authResult.result == true) {
          console.log(
            "Re-authentication successful, getting the page originally requested"
          );
          return axiosInstance({
            url: response.config.url,
            method: response.config.method,
            data: response.config.data,
            hasReauthenticated: true,
          });
        }
        //otherwise, return to original response
        else {
          console.log(
            "Re-authnetication failed, returning the original response (can't recover)"
          );
          return Promise.resolve(response);
        }
      });


    } else {
      return Promise.reject(response);
    }
  };
}

module.exports = Request;
