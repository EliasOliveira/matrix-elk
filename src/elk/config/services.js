const queuer = require("../executor/queuer")

module.exports = {

    createIndex: async (client, index) => {
        const exists = await client.indices.exists({ index })
        if (!exists.body) {
            try {
                await client.indices.create({ index })
            } catch (error) {
                console.log(error.meta.body)
            }
        }
    },

    createEntityEs: async (uid, body, index, client) => {
        try {
            const exists = await queuer.process(client.exists.bind(client, { id: uid, index }))
            if (exists) {
                await queuer.process(
                    client.update.bind(client, {
                        id: uid,
                        index,
                        body: { doc: body, doc_as_upsert: true },
                        retry_on_conflict: 2,
                    })
                )

            } else {
                await queuer.process(client.index.bind(client, { id: uid, index, body: body }))

            }
            console.log(`Added [doc@${uid}]`)
        } catch (e) {
            console.error(`Error in \`FS_ADDED\` handler [doc@${uid}]: ${e.message}`)
            console.error(e)
        }
    }


};
