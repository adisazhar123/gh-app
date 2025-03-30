import {GithubClient} from './github-client';
import {PullRequestOpened} from './types'
import {logger} from "./logger";

export async function PullRequestOpened(body: PullRequestOpened) {
  await Promise.all([
    welcomeMessageForNewContributors(body),
    suggestReviewers(body)
  ]);
}

async function welcomeMessageForNewContributors(body: PullRequestOpened) {
  const ghClient = new GithubClient();
  const owner = body.repository.owner.login;
  const repo = body.repository.name;

  const contributors = await ghClient.getRepositoryContributors(owner, repo);

  // check if user is first time contributor
  // post welcome message
  if (!contributors.find(c => c.login === body.pull_request.user.login)) {
    console.log('first time contributor', body.pull_request.user.login);
    const message = `Hello @${body.pull_request.user.login}. We have noticed that this is your first contribution to ${repo}. Welcome!
    Here are rules that you should abide to:
    1. Follow the coding guidelines
    2. Be respectful in discussions
    3. Write meaningful commit messages`

    await ghClient.createIssueComment(owner, repo, body.pull_request.number, message);
  }
}

async function suggestReviewers(body: PullRequestOpened) {
  const ghClient = new GithubClient();
  const owner = body.repository.owner.login;
  const repo = body.repository.name;
  const user = body.pull_request.user.login

  let contributors = await ghClient.getRepositoryContributors(owner, repo);

  // get top contributor of the repo
  contributors = contributors
    .filter(c => c.login !== user)
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 1);

  if (!contributors.length) {
    logger.info(`no suggested user found.`);
    return;
  }

  const message = `Hello @${user}. Based on past activities in ${repo}, the user @${contributors[0].login} would be the best person to review your PR.`
  await ghClient.createIssueComment(owner, repo, body.pull_request.number, message);
  logger.info(`suggesting user ${contributors[0].login} to review PR.`)
}

async function pullRequestReminders() {
  if (process.env.GH_PULL_REQUEST_REMINDER_ENABLED !== 'true') {
    logger.info('pull request reminder disabled');
    return;
  }

  logger.info('pull request reminder enabled');
  const ghClient = new GithubClient();
  let repositories = await ghClient.listUserRepositories();

  if (process.env.GH_PULL_REQUEST_REMINDER_REPOSITORY !== 'all') {
    repositories = repositories.filter(repo => repo.name === process.env.GH_PULL_REQUEST_REMINDER_REPOSITORY);
  }

  const reminderPromises: Promise<void>[] = [];
  for (const repository of repositories) {
    let pullRequests = await ghClient.listPullRequests(repository.owner, repository.name);
    const inMinutes = new Date(Date.now() - parseInt(process.env.GH_REMIND_PULL_REQUEST_STALE_DURATION_IN_MINUTES) * 60 * 1000);

    const promises = pullRequests.filter(pr => pr.updatedAt < inMinutes)
      .map(async (pr) => {
          const reviewers = pr.reviewers.map(reviewer => `@${reviewer}`);
          const message = `Gentle reminder to review this PR. ${reviewers.length ? `cc ${reviewers}` : ''}`;
          logger.info(`Sending reminder to repo: ${pr.repo} PR number: ${pr.issueNum} because last update was ${pr.updatedAt}`)
          await ghClient.createIssueComment(pr.owner, pr.repo, pr.issueNum, message)
        }
      );

    reminderPromises.push(...promises);
  }

  await Promise.all(reminderPromises)

}

export function startBackgroundJobs() {
  logger.info(`started background jobs with interval ${process.env.BACKGROUND_JOB_INTERVAL_IN_MINUTES} minutes...`);
  const intervalMinute = parseInt(process.env.BACKGROUND_JOB_INTERVAL_IN_MINUTES) * 60 * 1000;
  setInterval(async () => {
    try {
      logger.info("checking for pending PRs...");
      await pullRequestReminders();
    } catch (error) {
      logger.error("error checking PRs:", error);
    }
  }, intervalMinute);
}