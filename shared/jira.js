const rp = require('request-promise');

const username = process.env["JIRA_USERNAME"];
const apikey = process.env["JIRA_API_KEY"];
const baseUrl = process.env["JIRA_BASE_URL"];

module.exports = {
    getIssueId(message) {
        const pattern = /VF-(\d){2,4}/g;
        const taskArray = message.match(pattern);

        if (!taskArray) {
            return null;
        }

        return taskArray[0];
    },
    async getValidTransitions(issueId) {
        let options = getOptions(issueId);
        options.method = 'GET';

        const resultString = await rp(options);
        const result = JSON.parse(resultString);

        let states = result.transitions
            .map(transition => parseInt(transition.id));

        return states;
    },
    async setIssueStatus(issueId, status) {
        let options = getOptions(issueId);
        options.method = 'POST';
        options.body = JSON.stringify({ "transition": { "id": status }});

        let result = await rp(options);

        return result;
    }
}

function getOptions(issueId) {
    const auth = base64Encode(`${username}:${apikey}`);

    return {
        url: `${baseUrl}/rest/api/3/issue/${issueId}/transitions`,
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }
}

function base64Encode(data) {
    const buff = Buffer.from(data);

    return buff.toString('base64');
}
