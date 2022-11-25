const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

// static signup method
userSchema.statics.signup = async function(name, email, phone, password) {

    //validation
    if (!email || !password || !name || !phone) {
        throw Error('All fields must be filled')
    }

    if (!validator.isEmail(email)) {
        throw Error('Email is not valid')
    }

    if (!validator.isMobilePhone(phone))
    {
        throw Error('Invalid Phone Number');
    }

    if(!validator.isStrongPassword(password)) {
        throw Error('Password not strong enough')
    }

    
    const existsEmail = await this.findOne({ email })
    const existsPhone = await this.findOne({phone})

    if (existsEmail) {
        throw Error('Email already in use')
    }

    if (existsPhone) {
        throw Error('Phone number already in use')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({name, email, phone, password: hash })

    return user
}

//static login method
userSchema.statics.login = async function(email, password) {
    //validation
    if (!email || !password) {
        throw Error('All fields must be filled')
    }

    const user = await this.findOne({ email })
    if (!user)
    {
        throw Error("Incorrect Email")
    }
    const match = await bcrypt.compare(password, user.password)
    
    if (!match)
    {
        throw Error("Incorrect Password")
    }

    return user
}

module.exports = mongoose.model('User', userSchema)