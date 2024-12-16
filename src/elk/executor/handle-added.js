const queuer = require("./queuer")

module.exports = {
    execute: async (params) => {
        const { doc, index, modelReference, filter, client } = params
        let body = filter(modelReference, doc.data())
        if (!body) return
        try {
            const exists = await queuer.process(client.exists.bind(client, { id: doc.id, index }))
            if (exists) {
                // retryOnConflict added in reference to https://github.com/acupofjose/elasticstore/issues/2
                await queuer.process(
                    client.update.bind(client, {
                        id: doc.id,
                        index,
                        body: { doc: body, doc_as_upsert: true },
                        retry_on_conflict: 2,
                    })
                )

                if (modelReference.onItemUpserted) {
                    await modelReference.onItemUpserted.call(this, body, doc, client)
                }
            } else {
                await queuer.process(client.index.bind(client, { id: doc.id, index, body: body }))

                if (modelReference.onItemUpserted) {
                    await modelReference.onItemUpserted.call(this, body, doc, client)
                }
            }
            console.log(`Added [doc@${doc.id}]`)
        } catch (e) {
            console.error(`Error in \`FS_ADDED\` handler [doc@${doc.id}]: ${e.message}`)
            console.error(e)
        }
    }
};
