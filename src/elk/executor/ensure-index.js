
module.exports = {
    execute: async (params) => {
        const { index, modelReference, client } = params
        if (modelReference.mappings) {
            const exists = await client.indices.exists({ index })
            if (!exists.body) {
                await client.indices.create({ index })
                await client.indices.putMapping({
                    index,
                    body: {
                        dynamic: false,
                        properties: modelReference.mappings,
                    },
                })
            }
        } else {
            const exists = await client.indices.exists({ index })
            if (!exists.body) {
                try {
                    await client.indices.create({ index })
                } catch (error) {
                    console.log(error.meta.body)
                }
            }
        }
    }
};
