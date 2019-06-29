# Azure DevOps to JIRA - Automating task status updates using Azure Functions

This repo is the basis of a future post on my blog over at garethoates.com.

## Pre-requisites

In order to run this project, the following tools and apps are recommended

* Visual Studio Code
* A Microsoft Azure subscription
* Azure Functions Extension for Visual Studio Code
* Node (v10.14.1)

### Running the functions locally

#### Configuration of JIRA variables

In order to get this to work against your own JIRA you will have to create a
`local.settings.json` file and populate it with the following:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "WEBSITE_NODE_DEFAULT_VERSION": "10.14.1",
    "JIRA_BASE_URL": "https://YOUR_NAME_HERE.atlassian.net",
    "JIRA_USERNAME": "YOUR_EMAIL_ADDRESS_HERE",
    "JIRA_API_KEY": "YOUR_API_KEY_HERE"
  }
}
```

#### Updating transition ids

The contents of the `shared/transitions.js` file may have to be adjusted to match
your own workflow process.  I deliberately named the last 3 to match the name
of the environments I'm checking for deployments to, to save having to do
the extra step of converting between an environment name and a property name.

```js
module.exports = {
    OPEN_TO_IN_PROGRESS: 121,
    IN_PROGRESS_TO_FIXED: 51,
    TEST: 61,
    QA: 81,
    PROD: 101
}
```

The easiest way to determine what the valid values are for this, is to set a breakpoint
on line 25 in `shared/jira.js` and inspect the contents of the `result` variable.
This will show you the transitions which are available, and their corresponding `id` values.

### Running the app locally

I have included the .vscode folder with this repo so it should just be a case of
hitting F5 and visual studio code should take care of the building and running.
