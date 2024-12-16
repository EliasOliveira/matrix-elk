// On smaller elasticsearch clusters with large firebase datasets,
// the initial load for inserting data will potentially call thousands
// of requests to elasticsearch.
//
// Depending on the hardware of the elasticsearch server, this will cause
// 429 errors, meaning documents will be missed.
//
// To remedy this, a queue system for elasticsearch requests will allow for
// requests to be made with a delay in promise style format so as to not
// overwhelm the server.

const queue = []
const processing = []
const concurrent = 5
const delay = 125
const loop = async () => {
    if (processing.length >= concurrent || !queue.length) return
    const item = queue.shift()
    processing.push(item)
    setTimeout(async () => {
        try {
            const value = await item.func()
            item.resolver(value)
        } catch (err) {
            item.rejector(err)
        }
        const index = processing.indexOf(item)
        processing.splice(index, 1)
        if (queue.length) {
            loop()
        }
    }, delay)
}

module.exports = {

    process: async (func) => {
        let resolver = null
        let rejector = null
        const promise = new Promise((resolve, reject) => {
            resolver = resolve
            rejector = reject
        })
        queue.push({resolver, rejector, func})
        if (processing.length <= concurrent) {
            loop()
        }
        return promise
    }

}
