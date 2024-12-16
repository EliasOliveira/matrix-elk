const queuer = require("./queuer")

module.exports = {
    execute: async (params) => {
        const { doc, index, client } = params
        try {
            await queuer.process(client.delete.bind(client, { id: doc.id, index }))
            console.log(`Removed [doc@${doc.id}]`)
        } catch (e) {
            console.error(`Error in \`FS_REMOVE\` handler [doc@${doc.id}]: ${e.message}`)
            console.error(e)
        }
    }
};
