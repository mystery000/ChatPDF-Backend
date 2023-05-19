const { PINECONE_ENVIRONMENT, PINECONE_API_KEY } = require('../config');
const { PineconeClient } = require('@pinecone-database/pinecone');

if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
    throw new Error('Pinecone environment or api key vars missing');
}

async function initPinecone() {
    try {
        const pinecone = new PineconeClient();

        await pinecone.init({
            environment: PINECONE_ENVIRONMENT ?? '', //this is in the dashboard
            apiKey: PINECONE_API_KEY ?? '',
        });
        console.log('Pinecone initialized!');
        return pinecone;
    } catch (error) {
        console.log('error', error);
        throw new Error('Failed to initialize Pinecone Client');
    }
}

module.exports = {
    initPinecone,
};
