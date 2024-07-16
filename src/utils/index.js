import { openai, supabase } from "./config.js";

const query = "BollyWood Movie";
main(query);

export default async function main(query) {
  const embedding = await createEmbedding(query);
  const match = await findNearestMatch(embedding);
  await getChatCompletion(match, query);
}

// Embedding the Query Text
async function createEmbedding() {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  return embeddingResponse.data[0].embedding;
}

// Getting the Matching data
async function findNearestMatch(embedding) {
  const { data } = await supabase.rpc("match_popchoice", {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: 1,
  });
  return data[0].content;
}

const chatMessages = [
  {
    role: "system",
    content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`,
  },
];

async function getChatCompletion(text, query) {
  chatMessages.push({
    role: "user",
    content: `Context: ${text}, Question: ${query}`,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: chatMessages,
    temperature: 0.5,
    frequency_penalty: 0.5,
  });

  console.log(response.choices[0].message.content);
}
