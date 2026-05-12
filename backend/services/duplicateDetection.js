const Tesseract = require('tesseract.js');
const pdf = require('pdf-parse');
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const axios = require('axios');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

/**
 * Extracts text from a file (S3 URL)
 */
async function extractText(fileUrl, mimeType) {
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data);

  if (mimeType === 'application/pdf') {
    const data = await pdf(buffer);
    return data.text;
  } else if (mimeType.startsWith('image/')) {
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
    return text;
  }
  return buffer.toString('utf8'); // Fallback for simple text/docs
}

/**
 * Generates embedding for text
 */
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.substring(0, 8192), // Limit to token max
  });
  return response.data[0].embedding;
}

/**
 * Checks for duplicates in Pinecone and returns similarity score
 */
async function checkDuplicate(assignmentId, text) {
  const embedding = await getEmbedding(text);
  const index = pc.index(process.env.PINECONE_INDEX);

  const queryResponse = await index.query({
    vector: embedding,
    topK: 1,
    filter: { assignmentId: { "$eq": assignmentId } },
    includeMetadata: true
  });

  // Return the score of the most similar submission
  if (queryResponse.matches && queryResponse.matches.length > 0) {
    return queryResponse.matches[0].score;
  }
  return 0;
}

/**
 * Stores embedding in Pinecone
 */
async function storeEmbedding(submissionId, assignmentId, text) {
  const embedding = await getEmbedding(text);
  const index = pc.index(process.env.PINECONE_INDEX);

  await index.upsert([{
    id: submissionId.toString(),
    values: embedding,
    metadata: { assignmentId: assignmentId.toString() }
  }]);
}

module.exports = { extractText, checkDuplicate, storeEmbedding };
