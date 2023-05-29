const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    port: process.env.PORT,
    MongoURL: process.env.MONGO_URL,
    SecretKey: process.env.SECRET_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
};
