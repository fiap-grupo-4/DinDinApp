export class TotpChallengeRequiredError extends Error {
  constructor() {
    super("A verificação em duas etapas é necessária.");
    this.name = "TotpChallengeRequiredError";
  }
}
