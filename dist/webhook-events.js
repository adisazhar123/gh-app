"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestOpened = PullRequestOpened;
const github_client_1 = require("./github-client");
function PullRequestOpened(body) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([welcomeMessageForNewContributors(body)]);
    });
}
function welcomeMessageForNewContributors(body) {
    return __awaiter(this, void 0, void 0, function* () {
        const ghClient = new github_client_1.GithubClient();
        const owner = body.repository.owner.login;
        const repo = body.repository.name;
        const contributors = yield ghClient.getRepositoryContributors(owner, repo);
        // check if user is first time contributor
        // post welcome message
        if (!contributors.includes(body.pull_request.user.login)) {
            console.log('first time contributor', body.pull_request.user.login);
            const message = `Hello @${body.pull_request.user.login}. We have noticed that this is your first contribution to ${repo}. Welcome!
    Here are rules that you should abide to:
    1. Follow the coding guidelines
    2. Be respectful in discussions
    3. Write meaningful commit messages`;
            yield ghClient.createIssueComment(owner, repo, body.pull_request.number, message);
        }
    });
}
function pullRequestReminders() {
    const ghClient = new github_client_1.GithubClient();
    ghClient.listPullRequests();
}
