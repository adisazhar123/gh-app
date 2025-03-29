import {GithubClient} from './github-client';
import {PullRequestOpened} from './types'
import {log} from "./logger";

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

async function pullRequestReminders() {
  if (process.env.GH_PULL_REQUEST_REMINDER_ENABLED === 'true') {
    log.info('pull request reminder enabled');
    const ghClient = new GithubClient();
    let repositories = await ghClient.listUserRepositories();
    log.info(repositories)
    if (process.env.GH_PULL_REQUEST_REMINDER_REPOSITORY !== 'all') {
      repositories = repositories.filter(repo => repo.name === process.env.GH_PULL_REQUEST_REMINDER_REPOSITORY);
    }

    log.info(repositories)

    const reminderPromises: Promise<void>[] = [];
    for (const repository of repositories) {
      let pullRequests = await ghClient.listPullRequests(repository.owner, repository.name);
      const inMinutes = new Date(Date.now() - 2 * 60 * 1000);

      const promises = pullRequests.filter(pr => pr.updatedAt < inMinutes)
        .map(async (pr) => {
            const reviewers = pr.reviewers.map(reviewer => `@${reviewer}`);
            const message = `Gentle reminder to review this PR. ${reviewers.length ? `cc ${reviewers}` : ''}`;
            console.log(`Sending reminder to repo: ${pr.repo} PR number: ${pr.issueNum} because last update was ${pr.updatedAt}`)
            await ghClient.createIssueComment(pr.owner, pr.repo, pr.issueNum, message)
          }
        );

      reminderPromises.push(...promises);
    }

    await Promise.all(reminderPromises)
  } else {
    log.info('pull request reminder disabled');
  }
}

export function startBackgroundJobs() {
  log.info('started background jobs...')
  // const intervalMinute = parseInt(process.env.BACKGROUND_JOB_INTERNAL_IN_MINUTES) * 60 * 1000;
  const intervalMinute = 1000;
  setInterval(async () => {
    try {
      log.info("checking for pending PRs...");
      await pullRequestReminders();
    } catch (error) {
      log.error("error checking PRs:", error);
    }
  }, intervalMinute);
}