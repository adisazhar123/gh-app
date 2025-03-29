import {GithubClient} from './github-client';
import {PullRequestOpened} from './types'

export async function PullRequestOpened(body: PullRequestOpened) {
  await Promise.all([welcomeMessageForNewContributors(body)]);
}

async function welcomeMessageForNewContributors(body: PullRequestOpened) {
  const ghClient = new GithubClient();
  const owner = body.repository.owner.login;
  const repo = body.repository.name;

  const contributors = await ghClient.getRepositoryContributors(owner, repo);

  // check if user is first time contributor
  // post welcome message
  if (!contributors.includes(body.pull_request.user.login)) {
    console.log('first time contributor', body.pull_request.user.login);
    const message = `Hello @${body.pull_request.user.login}. We have noticed that this is your first contribution to ${repo}. Welcome!
    Here are rules that you should abide to:
    1. Follow the coding guidelines
    2. Be respectful in discussions
    3. Write meaningful commit messages`

    await ghClient.createIssueComment(owner, repo, body.pull_request.number, message);
  }
}

function pullRequestReminders() {
  const ghClient = new GithubClient();

  // ghClient.listPullRequests()
}