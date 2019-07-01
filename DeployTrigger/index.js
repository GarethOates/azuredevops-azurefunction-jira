const Jira = require('../shared/jira');
const Transitions = require('../shared/transitions');

const VALID_ENVIRONMENTS = ['TEST', 'QA', 'PROD'];

module.exports = async function (context, req) {
    if (!req.body) {
        context.log('No request body found');
        context.done();
    }

    const commits = req.body.resource.data.commits;
    const environment = req.body.resource.environment.name.toUpperCase();

    if (!commits) {
        context.log("No commits found");
        context.done();
    }

    context.log(`Found ${commits.length} commits`);

    if (!VALID_ENVIRONMENTS.includes(environment)) {
        context.log('Environment not valid');
        context.done();
    };

    context.log(`Deployment to: ${environment}`);

    const index = 0;
    const issuesProcessed = [];

    commits.forEach(async commit => {
        const issueId = Jira.getIssueId(commit.message);

        if (!issueId) {
            context.log(`Issue ${issueId} not found`);

            return;
        };

        context.log('Found Issue with Id: ' + issueId);

        if (issuesProcessed.includes(issueId)) {
            context.log('Issue already updated');

            return;
        };

        issuesProcessed[index] = issueId;
        index++;

        const transitions = Jira.getValidTransitions(issueId);
        const status = Transitions[environment.toUpperCase()];

        if (!transitions.includes(status)) {
            context.log('No valid transitions found');

            return;
        };

        context.log("Found valid transition");

        await Jira.setIssueStatus(issueId, status);

        context.log(`${issueId} transitioned to status ${status}`);
    });

    context.log("Finished processing commit messages");
    context.done();
};
