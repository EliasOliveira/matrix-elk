const param = process.argv.slice(2)[1]

const executorProxy = {
    'widgets-catalog': require('./widgets/executor'),
    'overlay-catalog': {
        execute: async (context) => Promise.reject('Not Implemented')
    }
}

module.exports = {
    execute: async (context) => {
        if (!param || !executorProxy[param]) {
            return Promise.reject('Execution Type Is Required ' + (param || ''))
        }
        const executor = executorProxy[param]
        await executor.execute(context)
    }
}
