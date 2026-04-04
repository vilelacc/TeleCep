import Joi from "joi";

const dataSchema = Joi.object({
  city: Joi.string().required().min(3).max(32),
  street: Joi.string().required().min(3).max(60),
  federativeUnit: Joi.string().required().min(2).max(2),
});

export default dataSchema;
