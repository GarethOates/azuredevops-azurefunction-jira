const Transitions = require('../shared/transitions');
const Jira = require('../shared/jira');

module.exports = async function (context, req) {
    if (!req.body) context.done();

    const body = req.body;
    const message = body.resource.sourceRefName;
    const issueId = Jira.getIssueId(message);

    context.log('Issue Id: ' + issueId);

    const validTransitions = await Jira.getValidTransitions(issueId);

    if (!validTransitions.includes(Transitions.IN_PROGRESS_TO_FIXED)
    ) {
        context.log('No valid transitions found');
        context.done();

        return;
    }

    context.log('Found valid Transition');

    await Jira.setIssueStatus(issueId, Transitions.IN_PROGRESS_TO_FIXED);

    context.log('Task transitioned to Fixed by Programmer');
};
