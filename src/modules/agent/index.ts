import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import initAgent from "./agent";
import { initGraph } from "../graph";
import initClassificationChain from "./chains/classification.chain";
import initWolframTool from "./tools/wolfram.tool";
import { RunnableMap, RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import initQuizGenerationChain, { GeneratedQuestion } from "./chains/quiz-generation.chain";
import { saveQuestion } from "./dbprovider";
import initTopicExtractionChain from "./chains/topic-extraction.chain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

export type GeneratedCategories = {
  category0: string;
  category1: string; 
  category2: string;
  category3: string;
}

// tag::throughput[]
type QuizGenerationChainThroughput = {
  topic: string;
  category: string;
  generatedQuestion: GeneratedQuestion;
  categories: GeneratedCategories;
};
// end::throughput[]

// tag::call[]
export async function call(input: string, sessionId: string): Promise<GeneratedQuestion> {
  // TODO: Replace this code with an agent
  const llmFactual = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo",
    temperature: 0,
  });

  const llmCreative = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo",
    temperature: 0.9,
  });

  const llmGemini = new ChatGoogleGenerativeAI ({
    model: "gemini-pro",
    maxOutputTokens: 2048,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
  });

  // const embeddings = new OpenAIEmbeddings({
  //   openAIApiKey: process.env.OPENAI_API_KEY,
  // });

  // Get Graph Singleton
  //const graph = await initGraph();

  //const agent = await initAgent(llm, embeddings, graph);
  //const res = await agent.invoke({ input }, { configurable: { sessionId } });
  
  // Classification chain should be used only when the session started
  // so just for the first Question in session
  // After that all the following Responses will be the base for the Next question

  // We can have 3 Game Modes:
  // - Default: Ask if a player wants go back 1 topic or continue
  // - Wide: All questions generated only on 1 Initial topic
  // - Deep: All questions just follow one by one (like a chain) without confirmation
  
  // const classificationChain = initClassificationChain(llmFactual);
  // const quizGenerationChain = initQuizGenerationChain(llmCreative);
  const classificationChain = initClassificationChain(llmGemini);
  const quizGenerationChain = initQuizGenerationChain(llmGemini);
  //const topicExtractionChain = initTopicExtractionChain(llmFactual);
  //const response = await classificationChain.invoke(input);

  const classifyAndSaveChain = RunnablePassthrough.assign<{topic: string}, any>({
    topic: (input) => input.topic,
    category: (input) => classificationChain.invoke(input.topic)
  }).assign({
    generatedQuestion: (input: QuizGenerationChainThroughput) => quizGenerationChain.invoke(input.topic)
  }).assign({
    categories: (input: QuizGenerationChainThroughput) => 
      RunnableMap.from<QuizGenerationChainThroughput, Record<string, string>>({
        category0: () => classificationChain.invoke(input.generatedQuestion.answers[0]),
        category1: () => classificationChain.invoke(input.generatedQuestion.answers[1]),
        category2: () => classificationChain.invoke(input.generatedQuestion.answers[2]),
        category3: () => classificationChain.invoke(input.generatedQuestion.answers[3]),
    })
  }).assign({
    _: (input: QuizGenerationChainThroughput) => console.log(input.categories)
  }).assign({
    responseId: async (input: QuizGenerationChainThroughput) =>
      saveQuestion(
        sessionId,
        input.topic,
        input.category,
        input.generatedQuestion,
        input.categories
      )
  }).pick("generatedQuestion");

  const response = await classifyAndSaveChain.invoke({topic: input});

  return response;
}
// end::call[]
