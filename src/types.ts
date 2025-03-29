export interface PullRequestOpened {
  repository: {
    name: string;
    owner: {
      login: string;
    }
  };
  pull_request: {
    user: {
      login: string;
    };
    number: number;
  }
}

export interface ListPullRequestResponse {
  number: number;
  head: {
    repo: {
      owner: {
        login: string;
      };
      name: string;
    }
  }
  requested_reviewers:{
    login: string;
  }[]
}

export interface GetContributorsResponse {
  login: string;
  contributions: number;
}