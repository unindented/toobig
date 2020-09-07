import Joi from "@hapi/joi";

import {
  projectsConfigSchema,
  reportersConfigSchema,
  resultsConfigSchema,
} from "./shared";

export const loadConfigSchema = Joi.object({
  results: Joi.alternatives().try(Joi.string(), resultsConfigSchema).required(),
  baselines: Joi.alternatives().try(Joi.string(), resultsConfigSchema),
  reporters: reportersConfigSchema,
  projects: projectsConfigSchema,
}).unknown();
