
const Joi= require("joi");

const employeeSchema = Joi.object({
    Employee: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().lowercase().required(),
        mobile: Joi.number().min(10).required(),
        designation: Joi.string().required(),
        gender: Joi.string().valid('Male', 'Female').required(),
        course: Joi.string().required(),
        image: Joi.string().allow('', null)
    }).required()
});

module.exports = {Joi, employeeSchema};