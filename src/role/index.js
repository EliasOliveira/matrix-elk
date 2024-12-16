const params = {
    email: 'marsh.moods@gmail.com',
    // role: 'premium',
    role: 'free',
    type: "print",
    // type: "change",
}

const getAuthUser = async (context) => {
    const { admin } = context
    try {
        return admin.auth().getUserByEmail(params.email)
    } catch (e) {
        console.error(e)
        return Promise.reject(e)
    }
}

const printRole = async (context) => {
    try {
        const user = await getAuthUser(context)
        const claims = user.customClaims || {};
        console.log(`User: ${JSON.stringify(user)}`)
        console.log(`CustomClaims: ${JSON.stringify(claims)}`)
        return Promise.resolve({
            role: claims.stripeRole
        })
    } catch (e) {
        console.error(e)
        return Promise.reject(e)
    }
}

const changeRole = async (context) => {
    try {
        const { admin } = context
        const user = await getAuthUser(context)
        const claims = user.customClaims || {};
        claims.stripeRole = params.role;
        return admin.auth().setCustomUserClaims(user.uid, claims)
    } catch (e) {
        console.error(e)
        return Promise.reject(e)
    }
}


const execute = async (context) => {
    console.log("Executing Role: ", JSON.stringify(params))
    if (params.type === 'print') {
        return printRole(context)
    } else if (params.type === 'change') {
        return changeRole(context)
    }
    return Promise.reject("Not Implemented " + params.type)
}

module.exports = {
    execute
}
