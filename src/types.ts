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
  sender: {
    login: string;
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
  }[];
  updated_at: string;
}

export interface GetContributorsResponse {
  login: string;
  contributions: number;
}

export interface ListUserRepositoriesResponse {
  name: string;
  owner: {
    login: string;
  }
}