const param = process.argv.slice(2)[0]
const executorProxy = require('./src/index')
const { Client } = require('@elastic/elasticsearch')

const elkClient = new Client({
    node: "https://elk.zapto.org/es",
    auth: {
        username: 'elastic',
        password: 'Xtre@min@tor'
    }
})

const context = {
    admin: require('./configuration/firebase').admin,
    elkClient
}

const run = async (param) => {
    console.log('Executing ' + param)
    const executor = executorProxy[param]
    if (executor) {
        await executor.execute(context)
    } else {
        return Promise.reject("Executor not found! " + param)
    }
}



// Runner
run(param)
    .then(success => console.log('Success: ' + JSON.stringify(success)))
    .catch(err => console.error('Error: ' + JSON.stringify(err)))
