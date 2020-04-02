import Joi from "@hapi/joi";

import { reportersConfigSchema, resultsConfigSchema } from "./shared";

export const loadConfigSchema = Joi.object({
  input: Joi.alternatives().try(Joi.string(), resultsConfigSchema).required(),
  reporters: reportersConfigSchema,
}).unknown();
