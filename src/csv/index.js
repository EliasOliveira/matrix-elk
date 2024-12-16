const fs = require('fs')

const configuration = {
    logVerbose: true,
    // filePath: 'executor/csv/files/firebase/widgets/templatesTypes.csv',
    // collection: 'widgets-template-type',
    filePath: 'executor/csv/files/firebase/widgets/templates.csv',
    collection: 'widgets-template',

}



const headersSkip = [];
const reader = (csvFile) => {
    const arr = csvFile.split('\n');
    const jsonObj = [];
    const headers = arr[0].split(';');
    for(let i = 1; i < arr.length; i++) {
        if (arr[i] !== '') {
            const data = arr[i].split(';');
            const obj = {};
            for(let j = 0; j < data.length; j++) {
                const currentHeader = headers[j].trim();
                if (headersSkip.indexOf(currentHeader) === -1) {
                    obj[currentHeader] = data[j].trim();
                }
            }
            jsonObj.push(obj);
        }
    }
    return jsonObj;
}

const saveFirebase = async (context, entityList) => {
    const { admin } = context
    const db = admin.firestore();
    for(let entity of entityList) {
        console.log('Saving Entity: ' + entity.uid)
        if (configuration.logVerbose) {
            console.log(JSON.stringify(entity))
        }
       await db.collection(configuration.collection).doc(entity.uid).set(entity);
    }
}

const execute = async (context) => {
    return new Promise((resolve, reject) => {
        fs.readFile(configuration.filePath, (error, data) => {
            if (!error) {
                const entityList = reader(data.toString())
                saveFirebase(context, entityList).then(resolve).catch(resolve)
            } else {
                reject(error)
            }
        });
    })
}

module.exports = {
    execute
}
