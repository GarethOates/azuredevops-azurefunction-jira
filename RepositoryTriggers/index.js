const Transitions = require('../shared/transitions');
const Jira = require('../shared/jira');

module.exports = async function (context, req) {
    if (!req.body) context.done();
    const body = req.body;

    let message;
    let transition;

    switch(body.eventType) {
        case 'git.push':
            message = body.message.text;
            transition = Transitions.OPEN_TO_IN_PROGRESS
            break;
        case 'git.pullrequest.created':
            message = body.resource.sourceRefName;
            transition = Transitions.IN_PROGRESS_TO_FIXED;
            break;
        default:
            context.log('Trigger not recognised. Exiting');
            context.done();
    }

    const issueId = Jira.getIssueId(message);

    context.log('Issue Id: ' + issueId);

    const validTransitions = await Jira.getValidTransitions(issueId);

    if (!validTransitions.includes(transition)) {
        context.log('No valid transitions found');
        context.done();

        return;
    }

    context.log('Found valid Transition');

    await Jira.setIssueStatus(issueId, transition);

    context.log('Task transitioned successfully');
    context.done();
};
