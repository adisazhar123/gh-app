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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubClient = void 0;
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
class GithubClient {
    constructor() {
        this.jwt = '';
        this.accessToken = '';
        this.httpClient = axios_1.default.create({
            baseURL: 'https://api.github.com',
            timeout: 10000
        });
        this.httpClient.interceptors.request.use(function (config) {
            // @ts-ignore
            console.log(`[request] ${(config.method || '').toUpperCase()} ${config.url}`);
            return config;
        }, function (error) {
            return Promise.reject(error);
        });
        this.httpClient.interceptors.response.use(function (response) {
            // @ts-ignore
            console.log(`[response] ${(response.config.method || '').toUpperCase()} ${response.config.url} - ${response.status} - ${response.statusText}`);
            return response;
        }, function (error) {
            return Promise.reject(error);
        });
    }
    generateJwt() {
        const payload = {
            // issued at now
            iat: Math.floor(Date.now() / 1000),
            // expires in 10 mins
            exp: Math.floor(Date.now() / 1000) + 600,
            iss: process.env.GH_CLIENT_ID
        };
        const privateKey = fs_1.default.readFileSync(process.env.GH_PRIVATE_KEY_PATH, 'utf8');
        console.log('privateKey', privateKey);
        return jsonwebtoken_1.default.sign(payload, privateKey, { algorithm: 'RS256' });
    }
    getInstallationId(org, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.httpClient.get(`/repos/${org}/${repo}/installation`, {
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${this.generateJwt()}`,
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            return response.data.id;
        });
    }
    getAccessToken(org, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.accessToken) {
                const installationId = process.env.GH_INSTALLATION_ID;
                const response = yield this.httpClient.post(`/app/installations/${installationId}/access_tokens`, null, {
                    headers: {
                        'Accept': 'application/vnd.github+json',
                        'Authorization': `Bearer ${this.generateJwt()}`,
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                });
                this.accessToken = response.data.token;
            }
            return this.accessToken;
        });
    }
    getRepositoryContributors(owner, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.httpClient.get(`/repos/${owner}/${repo}/contributors`, {
                headers: {
                    "Accept": "application/vnd.github+json",
                    "Authorization": `Bearer ${yield this.getAccessToken(owner, repo)}`,
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            });
            return response.data.map(d => d.login);
        });
    }
    createIssueComment(owner, repo, issueNum, message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.httpClient.post(`/repos/${owner}/${repo}/issues/${issueNum}/comments`, {
                body: message
            }, {
                headers: {
                    "Accept": "application/vnd.github+json",
                    "Authorization": `Bearer ${yield this.getAccessToken(owner, repo)}`,
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            });
        });
    }
    listPullRequests(owner, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.httpClient.get(`/repos/${owner}/${repo}/pulls`, {
                headers: {
                    "Accept": "application/vnd.github+json",
                    "Authorization": `Bearer ${yield this.getAccessToken(owner, repo)}`,
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            });
            // @ts-ignore
            return response.data.map(d => ({
                owner: d.head.repo.owner.login,
                name: d.head.repo.name,
                issueNum: d.number,
                // @ts-ignore
                reviewers: d.requested_reviewers.map(r => r.login)
            }));
        });
    }
}
exports.GithubClient = GithubClient;
