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
    let index = 0;

    for (let i = 0; i < commits.length; i++) {
        let commit = commits[i];

        const issueId = Jira.getIssueId(commit.message);

        if (!issueId) {
            context.log('Could not determine issue Id');
            continue;
        };

        context.log(`Processing Issue: ${issueId}`);

        if (issuesProcessed.includes(issueId)) {
            context.log('Issue already processed. Skipping');
            continue;
        };

        issuesProcessed[index] = issueId;
        index++;

        context.log('Getting Valid Transitions..');
        let transitions = await Jira.getValidTransitions(issueId);
        
        if (!transitions) {
            context.log('Could not retrieve transitions');
            continue;
        }

        context.log('Getting correct status value');
        const status = Transitions[environment];

        if (!transitions.includes(status)) {
            context.log('No valid transitions found. Skipping');
            continue;
        };

        context.log("Found valid transition");

        await Jira.setIssueStatus(issueId, status);

        context.log(`${issueId} transitioned to DEPLOYED IN ${status}`);
    }

    context.log("Finished processing commit messages");
    context.done();
};
