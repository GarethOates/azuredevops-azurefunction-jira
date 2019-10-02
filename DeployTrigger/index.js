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

    const issuesProcessed = [];

    commits.forEach(async (commit, index) => {
        const issueId = Jira.getIssueId(commit.message);

        if (!issueId) {
            context.log('Could not determine issue Id');
            return;
        };

        context.log('Processing Issue: ' + issueId);

        if (issuesProcessed.includes(issueId)) {
            context.log('Issue already processed. Skipping');
            return;
        };

        issuesProcessed[index] = issueId;
        index++;

        context.log('Getting Valid Transitions..');
        const transitions = await Jira.getValidTransitions(issueId);
        
        context.log('Getting correct status value');
        const status = Transitions[environment];

        if (!transitions.includes(status)) {
            context.log('No valid transitions found. Skipping');
            return;
        };

        context.log("Found valid transition");

        await Jira.setIssueStatus(issueId, status);

        context.log(`${issueId} transitioned to DEPLOYED IN ${status}`);
    });

    context.log("Finished processing commit messages");
    context.done();
};
