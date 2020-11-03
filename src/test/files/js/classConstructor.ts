class GitHubClient {
  private token: string = "";
  constructor(options: { token: string }) {
    if (options) {
      this.token = options.token;
    }
  }
}
