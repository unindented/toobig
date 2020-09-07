import Joi from "@hapi/joi";

export const reportersConfigSchema = Joi.array().items(
  Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string().required(), Joi.object().required())
  )
);

export const resultsConfigSchema = Joi.object().pattern(
  /.+/u,
  Joi.object({
    path: Joi.string().required(),
    size: Joi.number().required(),
    maxSize: Joi.number().required(),
  }).required()
);

export const projectsConfigSchema = Joi.array().items(Joi.string().required());
