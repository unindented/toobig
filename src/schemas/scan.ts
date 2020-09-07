import Joi from "@hapi/joi";

import {
  projectsConfigSchema,
  reportersConfigSchema,
  resultsConfigSchema,
} from "./shared";

export const scanConfigSchema = Joi.object({
  budgets: Joi.object().pattern(/.+/u, Joi.string()).required(),
  cwd: Joi.string(),
  baselines: Joi.alternatives().try(Joi.string(), resultsConfigSchema),
  reporters: reportersConfigSchema,
  projects: projectsConfigSchema,
}).unknown();
