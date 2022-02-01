import Joi from "joi";

import { reportersConfigSchema, resultsConfigSchema } from "./shared";

export const scanConfigSchema = Joi.object({
  budgets: Joi.object().pattern(/.+/u, Joi.string()).required(),
  cwd: Joi.string(),
  baselines: Joi.alternatives().try(Joi.string(), resultsConfigSchema),
  reporters: reportersConfigSchema,
}).unknown();
