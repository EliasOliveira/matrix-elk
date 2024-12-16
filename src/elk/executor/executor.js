const { Client } = require('@elastic/elasticsearch')
const admin = require('firebase-admin')

const client = new Client({
    node: "https://elk.zapto.org/es",
    auth: {
        username: 'elastic',
        password: 'Xtre@min@tor'
    }
})

const references = require('../config/references').references

const handleSnapshot = require('./handle-snapshot')

const moduleList = ['musics'];

const filter = (reference, data) => {
    let shouldInsert = true
    if (reference.filter) {
        shouldInsert = reference.filter.call(null, data)
    }
    if (!shouldInsert) {
        return null
    }
    if (reference.include) {
        for (const key of Object.keys(data)) {
            if (reference.include.indexOf(key) === -1) {
                delete data[key]
            }
        }
    }
    if (reference.exclude) {
        for (const key of reference.exclude) {
            if (data[key]) {
                delete data[key]
            }
        }
    }
    if (!data.status) {
        data.status = 'AUTHORIZED'
    }
    return data
}

module.exports = {
    run: (params) => {
        console.log('Initializing executor');
        references.forEach(reference => {
            const ref = admin.firestore().collection(reference.collection)
            // TODO fill parameters
            const params = {
                fbReference: ref,
                modelReference: reference,
                admin: admin,
                client: client,
                filter: filter
            }
            handleSnapshot.execute(params);
            client.indices.get({
                index: 'logs'
            } ).then(res => {
                console.log(res);
            }).catch(err => {
                console.log(err);
            });
        })
    }
};
