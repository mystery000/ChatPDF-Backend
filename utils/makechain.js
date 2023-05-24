const { OpenAI } = require('langchain/llms/openai');
const { ConversationalRetrievalQAChain } = require('langchain/chains');
const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History: {chat_history}

Follow Up Input: {question}

Standalone question:`;

const QA_PROMPT = `Act as a helpful PDF file. Given the following pages of the PDF as information source, answer any questions the user asks. If the given pages contain the answer, generate a concise answer from these pages of the PDF as information source. Otherwise, mention that the source does not contain relevant information, but still answer the question to the best of your knowledge. Act as if you are the PDF file and chat with the human, imitate the linguistic style of the PDF.

Context: {context}

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
