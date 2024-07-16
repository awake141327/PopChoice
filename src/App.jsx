import { useEffect, useRef, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import { openai, supabase } from "./utils/config.js";

function App() {
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [answer3, setAnswer3] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [click, setClick] = useState(false);
  const isMounted = useRef(false);

  function handleSubmit(e) {
    e.preventDefault();
    setQuery((prev) => prev + answer1 + answer2 + answer3);
    setClick((prev) => !prev);
  }

  function handleReset() {
    isMounted.current = false;
    setQuery("");
    setAnswer1("");
    setAnswer2("");
    setAnswer3("");
    setResponse("");
    setClick((prev) => !prev);
  }

  useEffect(() => {
    if (isMounted.current) {
      main(query);
    } else {
      isMounted.current = true;
    }

    async function main(query) {
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
        match_threshold: 0.2,
        match_count: 1,
      });
      return data[0]?.content;
    }

    const chatMessages = [
      {
        role: "system",
        content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. Answer like you are answering to a friend and mention the release year and rating as well. The answer must contain minimum 100 words. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`,
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

      setResponse(response.choices[0].message.content);
    }
  }, [query]);

  return (
    <div className="flex items-center justify-center bg-[url('/src/assets/Background.jpg')] bg-bottom bg-no-repeat bg-cover w-full">
      <div className="flex items-center flex-col px-10 py-8 bg-[#000b36] gap-10 lg:w-5/12 font-paragraph tracking-wide">
        <Header />
        {query && click ? (
          <div className="flex flex-col h-inherit gap-10 h-[80vh]">
            <p className="text-white">
              {response ? response : "Loading Response..."}
            </p>
            <button
              onClick={handleReset}
              className="bg-[#51e08a] py-3 rounded-[10px] font-bold text-[20px]"
            >
              Go Again!
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div>
              <p className="text-white text-[16px] mb-3 font-extralight">
                What&apos;s your favourite movie and why?
              </p>
              <textarea
                onChange={(e) => {
                  setAnswer1(e.target.value);
                }}
                value={answer1}
                className="rounded-[10px] font-light bg-[#3B4877] resize-none px-5 py-2 outline-none text-white w-full h-[90px]"
                placeholder="The Shawshank Redemption. Because it taught me to never give up hope no matter how hard life gets."
                required
              ></textarea>
            </div>
            <div>
              <p className="text-white text-[16px] mb-3 font-extralight">
                Are you in the mood for something new or a classic?
              </p>
              <textarea
                onChange={(e) => {
                  setAnswer2(e.target.value);
                }}
                value={answer2}
                className="rounded-[10px] font-light bg-[#3B4877] resize-none px-5 py-2 outline-none text-white w-full h-[90px]"
                placeholder="Would prefer something new today."
                required
              ></textarea>
            </div>
            <div>
              <p className="text-white text-[16px] mb-3 font-extralight">
                Do you wanna have fun or do you want something serious?
              </p>
              <textarea
                onChange={(e) => {
                  setAnswer3(e.target.value);
                }}
                value={answer3}
                className="rounded-[10px] font-light bg-[#3B4877] resize-none px-5 py-2 outline-none text-white w-full h-[90px]"
                placeholder="I want to watch something stupid and fun."
                required
              ></textarea>
            </div>
            <button className="bg-[#51e08a] py-3 rounded-[10px] font-bold text-[20px]">
              Let&apos;s Go
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
