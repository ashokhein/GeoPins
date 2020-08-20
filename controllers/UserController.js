const user = require("../models/User")
const { OAuth2Client } = require("google-auth-library")
const User = require("../models/User")
const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID)

exports.findOrCreateUser = async (token) => {
    //verify auth token
    const googleUser = await veriyAuthToken(token)

    // check if user exists
    const user = await checkIfUserExists(googleUser.email)

    //if user exists , return them ; otherwise create new one
    return user ? user : createNewUser(googleUser)
}

const veriyAuthToken = async token => {
    try {
        const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.OAUTH_CLIENT_ID })
        return ticket.getPayload()
    } catch(err) {
        console.error(`Unable to verify the auth token`,err)
    }
}

const checkIfUserExists = async email => await User.findOne({email}).exec()

const createNewUser = ({ name, email, picture}) => {
    const userObject = { name, email, picture}
    return new User(userObject).save()
}
