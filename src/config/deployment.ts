export type DeploymentMode = "saas" | "self-hosted";

export const DEPLOYMENT_MODE: DeploymentMode =
  (process.env.DEPLOYMENT_MODE as DeploymentMode) ?? "saas";

export const isSaaS = DEPLOYMENT_MODE === "saas";
export const isSelfHosted = DEPLOYMENT_MODE === "self-hosted";
