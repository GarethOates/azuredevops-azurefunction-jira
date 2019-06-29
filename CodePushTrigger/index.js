const Transitions = require('../shared/transitions');
const Jira = require('../shared/jira');

module.exports = async function (context, req) {
    if (!req.body) context.done();

    const body = req.body;
    const message = body.message.text;
    const issueId = Jira.getIssueId(message);

    context.log('Issue Id: ' + issueId);

    const validTransitions = await Jira.getValidTransitions(issueId);

    if (!validTransitions.includes(Transitions.OPEN_TO_IN_PROGRESS)
    ) {
        context.log('No valid transitions found');
        context.done();

        return;
    }

    context.log('Found valid Transition');

    await Jira.setIssueStatus(issueId, Transitions.OPEN_TO_IN_PROGRESS);

    context.log('Task transitioned to In Progress');
};
