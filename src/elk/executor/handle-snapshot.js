const handleAdded = require('./handle-added')
const handleModified = require('./handle-modified')
const handleRemoved = require('./handle-removed')
const ensureIndex = require('./ensure-index')

module.exports = {
    execute: async (params) => {
        const { fbReference, modelReference } = params;
        fbReference.onSnapshot(async snap => {
            for (const change of snap.docChanges()) {
                const changeType = change.type

                const index =
                    typeof modelReference.index === "function"
                        ? modelReference.index.call(this, change.doc, parentSnap)
                        : modelReference.index
                params.doc = change.doc
                params.index = index
                await ensureIndex.execute(params)

                switch (changeType) {
                    case "added":
                        await handleAdded.execute(params)
                        break
                    case "modified":
                        await handleModified.execute(params)
                        break
                    case "removed":
                        await handleRemoved.execute(params)
                        break
                }
            }
        })
    }
};
