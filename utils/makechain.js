const { OpenAI } = require('langchain/llms/openai');
const { ConversationalRetrievalQAChain } = require('langchain/chains');
const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `You are chatbot to provide useful information with given the following context. 
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.
Answer in a concise or elaborate format as per the intent of the question.
If context contains escape characters, they must be included in the response.

====================
{context}
====================
Question: {question}
Answer: `;

const makeChain = (vectorstore) => {
    const model = new OpenAI({
        temperature: 0.1, // increase temepreature to get more creative answers
        modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
    });

    const chain = ConversationalRetrievalQAChain.fromLLM(
        model,
        vectorstore.asRetriever(),
        {
            questionGeneratorTemplate: CONDENSE_PROMPT,
            qaTemplate: QA_PROMPT,
            returnSourceDocuments: true, //The number of source documents returned is 4 by default
        },
    );
    return chain;
};

module.exports = {
    makeChain,
};
