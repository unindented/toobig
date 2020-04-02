import Joi from "@hapi/joi";

import { reportersConfigSchema } from "./shared";

export const scanConfigSchema = Joi.object({
  budgets: Joi.object().pattern(/.+/, Joi.string()).required(),
  cwd: Joi.string(),
  reporters: reportersConfigSchema,
}).unknown();
