const elkService = require("../config/services")
const { v4 } = require('uuid');
const index = 'widgets-catalog'
const data = require('./data.json')


module.exports = {
    execute: async (context) => {
        console.log('Initializing executor');
        const { elkClient } = context
        try {
            await elkService.createIndex(elkClient, index)
            for (const reg of data) {
                const uid = reg.uid || v4()
                reg.uid = uid
                await elkService.createEntityEs(uid, reg, index, elkClient)
            }
        } catch (e) {
            return Promise.reject(e)
        }

    }
};
