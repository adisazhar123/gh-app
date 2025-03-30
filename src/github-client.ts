import axios, {AxiosInstance} from 'axios'
import jwt from 'jsonwebtoken';
import fs from 'fs'
import {GetContributorsResponse, ListPullRequestResponse, ListUserRepositoriesResponse} from "./types";
import {logger} from "./logger";

export class GithubClient {
  httpClient: AxiosInstance;
  jwt: string = '';
  accessToken: string = '';

  constructor() {
    this.httpClient = axios.create({
      baseURL: 'https://api.github.com',
      timeout: 10000
    });

    this.httpClient.interceptors.request.use(function (config) {
      logger.info(`[request] ${(config.method || '').toUpperCase()} ${config.url}`);
      return config;
    }, function (error) {
      return Promise.reject(error)
    });

    this.httpClient.interceptors.response.use(function (response) {
      logger.info(`[response] ${(response.config.method || '').toUpperCase()} ${response.config.url} - ${response.status} - ${response.statusText}`);
      return response;
    }, function (error) {
      return Promise.reject(error);
    });
  }

  generateJwt(): string {
    const payload = {
      // issued at now
      iat: Math.floor(Date.now() / 1000),
      // expires in 10 mins
      exp: Math.floor(Date.now() / 1000) + 600,
      iss: process.env.GH_CLIENT_ID
    };
    const privateKey = fs.readFileSync(process.env.GH_PRIVATE_KEY_PATH as string, 'utf8');
    return jwt.sign(payload, privateKey, {algorithm: 'RS256'});
  }

  async getAccessToken(): Promise<string> {
    if (!this.accessToken) {
      const installationId = process.env.GH_INSTALLATION_ID;
      const response = await this.httpClient.post(
        `/app/installations/${installationId}/access_tokens`,
        null,
        {
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${this.generateJwt()}`,
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      );

      this.accessToken = response.data.token;
    }
    return this.accessToken;
  }

  async getRepositoryContributors(owner: string, repo: string): Promise<{login: string; contributions: number}[]> {
    const response = await this.httpClient.get<GetContributorsResponse[]>(`/repos/${owner}/${repo}/contributors`, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${await this.getAccessToken()}`,
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });

    return response.data.map(d => ({ login: d.login, contributions: d.contributions }));
  }

  async createIssueComment(owner: string, repo: string, issueNum: number, message: string) {
    await this.httpClient.post(`/repos/${owner}/${repo}/issues/${issueNum}/comments`, {
      body: message
    }, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${await this.getAccessToken()}`,
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
  }

  async listPullRequests(owner: string, repo: string): Promise<{owner: string; repo: string; issueNum: number; reviewers: string[]; updatedAt: Date;}[]> {
    const response = await this.httpClient.get<ListPullRequestResponse[]>(`/repos/${owner}/${repo}/pulls`, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${await this.getAccessToken()}`,
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });

    return response.data.map(d => ({
      owner: d.head.repo.owner.login,
      repo: d.head.repo.name,
      issueNum: d.number,
      reviewers: d.requested_reviewers.map(r => r.login),
      updatedAt: new Date(d.updated_at)
    }));
  }

  async listUserRepositories(): Promise<{owner: string; name: string;}[]> {
    const username = process.env.GH_USERNAME;
    const response = await this.httpClient.get<ListUserRepositoriesResponse[]>(`/users/${username}/repos`, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${await this.getAccessToken()}`,
        "X-GitHub-Api-Version": "2022-11-28"
      },
    });

    return response.data.map(d => ({owner: d.owner.login, name: d.name}));
  }
}