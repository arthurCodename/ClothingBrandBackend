const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const passwordComplexity = require('joi-password-complexity')

const UserSchema = new mongoose.Schema({
    userEmail: String,
    userFirstName: String,
    userLastName: String,
    userCountry: String,
    userZip: String,
    userPassword: String,
    
})

UserSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({_id: this._id, userEmail: this.userEmail, userFirstName: this.userFirstName}, process.env.JWTPRIVATEKEY, {expiresIn: '7d'});
    return token;
}
const UserModel = mongoose.model("users", UserSchema);

const validateReg = (data) => {
    const schema = Joi.object({
        userEmail: Joi.string().email().required().label("Email"),
        userFirstName: Joi.string().required().label("First Name"),
        userLastName: Joi.string().required().label("Last Name"),
        userCountry: Joi.string().required().label("Country"),
        userZip: Joi.string().required().label("Zip Code"),
        userPassword: passwordComplexity().required().label("Password"),
    });
    return schema.validate(data)
}

const validateLog = (data) => {
    const schema = Joi.object({
        userEmail: Joi.string().email().required().label("Email"),
        userPassword: Joi.string().required().label("Password"),
    });
    return schema.validate(data)
}

const validateEmail = (data) => {
    const schema = Joi.object({
        userEmail: Joi.string().email().required().label("Email")
    });
    return schema.validate(data)
}


module.exports = {UserModel, validateReg, validateLog, validateEmail};