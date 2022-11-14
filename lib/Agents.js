const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);

const Agents = function(request) {
    this.request = request;
};

function asSeconds(durationstring) {
    let valueMatch = /(\d{1,8})[dhms]/gi;
    let matches = [...durationstring.matchAll(valueMatch)];
    return dayjs
        .duration({
            days: +matches[0][1],
            hours: +matches[1][1],
            minutes: +matches[2][1],
            seconds: +matches[3][1],
        })
        .as("seconds");
}

Agents.prototype.GetAgentStats = function() {
    let processResults = function(results) {
        let agentDetailsMatch = /^Agent\/(\d*) \((.*)\)$/i;

        let agents = [];
        results.rows.forEach((agent) => {
            let agentDetails = agent[0].match(agentDetailsMatch);
            let agentObj = {
                agentNumber: agentDetails[1],
                name: agentDetails[2],
                calls: agent[1],
                answered: agent[2],
                unanswered: agent[3],
                talkTimeTotal: asSeconds(agent[4]),
                talkTimeMean: asSeconds(agent[5]),
                talkTimeMeanDelay: asSeconds(agent[6]),

                idleTimeTotal: asSeconds(agent[7]),
                idleTimeMean: asSeconds(agent[8]),

                sessionTotal: asSeconds(agent[9]),
                sessionCount: agent[10],

                pausesTotal: asSeconds(agent[11]),
                pausesCount: agent[12],
            };
            agents.push(agentObj);
        });
        return agents;
    };

    return this.request.client
        .get(
            "/?app=pbxware&e=callcenter&t=qagents&v=agents:monitorstats&noshowheader=1&noshowfooter=1&server=1&fetchdata=true&ajax=true"
        )
        .then((data) => {
            return processResults(data.data);
        })
        .catch((error) => error);
};

module.exports = Agents;