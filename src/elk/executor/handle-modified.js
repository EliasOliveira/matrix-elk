const queuer = require("./queuer")

module.exports = {
    execute: async (params) => {
        const { doc, index, modelReference, filter, client } = params
        let body = filter(modelReference, doc.data())
        if (!body) return
        if (modelReference.transform) {
            body = modelReference.transform.call(this, body, doc)
        }
        try {
            await queuer.process(
                client.update.bind(client, {
                    id: doc.id,
                    index,
                    body: { doc: body },
                    retry_on_conflict: 2,
                })
            )
            if (modelReference.onItemUpserted) {
                await modelReference.onItemUpserted.call(this, body, doc, client)
            }
            console.log(`Updated [doc@${doc.id}]`)
        } catch (e) {
            console.error(`Error in \`FS_MODIFIED\` handler [doc@${doc.id}]: ${e.message}`)
            console.error(e)
        }
    }
};
