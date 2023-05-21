const { Document } = require('langchain/document');
const { BaseDocumentLoader } = require('langchain/document_loaders');
const path = require('path');
const pdf_extract = require('pdf-extract');
/**
 *
 * @class customPDFLoader
 */

class CustomPDFLoader extends BaseDocumentLoader {
    constructor(filePathOrBlob) {
        super();
        this.filePathOrBlob = filePathOrBlob;
    }
    load() {
        const options = {
            type: 'ocr', // perform ocr to get the text within the scanned image
            ocr_flags: ['--psm 1'], // automatically detect page orientation
        };
        const processor = pdf_extract(this.filePathOrBlob, options, () =>
            console.log('Starting...'),
        );
        processor.on('complete', (data) => callback(null, data));
        processor.on('error', callback);
        function callback(error, data) {
            if (error) console.log(error);
            else {
                console.log(data.text_pages[0]);
                return [new Document({ pageContent: data.text_pages[0] })];
            }
        }
    }
}

module.exports = CustomPDFLoader;
