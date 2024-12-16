const admin = require('firebase-admin')
const serviceAccount = {
// Add service account here
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = {
    admin
}