import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import initAgent from "./agent";
import { initGraph } from "../graph";
import initClassificationChain from "./chains/classification.chain";
import initWolframTool from "./tools/wolfram.tool";
import { RunnablePassthrough, RunnableSequence } from "langchain/runnables";
import initQuizGenerationChain from "./chains/quiz-generation.chain";

// tag::throughput[]
type QuizGenerationChainThroughput = {
  question: string;
  category: string;
  output: string;
};
// end::throughput[]

// tag::call[]
export async function call(input: string, sessionId: string): Promise<string> {
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

  // const embeddings = new OpenAIEmbeddings({
  //   openAIApiKey: process.env.OPENAI_API_KEY,
  // });

  // Get Graph Singleton
  const graph = await initGraph();

  //const agent = await initAgent(llm, embeddings, graph);
  //const res = await agent.invoke({ input }, { configurable: { sessionId } });
  
  // Classification chain should be used only when the session started
  // so just for the first Question in session
  // After that all the following Responses will be the base for the Next question

  // We can have 3 Game Modes:
  // - Default: Ask if a player wants go back 1 topic or continue
  // - Wide: All questions generated only on 1 Initial topic
  // - Deep: All questions just follow one by one (like a chain) without confirmation
  
  const classificationChain = initClassificationChain(llmFactual);
  const quizGenerationChain = initQuizGenerationChain(llmCreative);
  //const response = await classificationChain.invoke(input);

  const classifyAndSaveChain = RunnablePassthrough.assign<{question: string}, any>({
    question: (input) => input.question,
    category: (input) => classificationChain.invoke(input.question)
  }).assign({
    output: (input: QuizGenerationChainThroughput) => quizGenerationChain.invoke(input.question)
  }).assign({
    // TODO: Save IN DB
    // responseId: async (input: RetrievalChainThroughput, options) =>
    //   saveHistory(
    //     options?.config.configurable.sessionId,
    //     "vector",
    //     input.input,
    //     input.rephrasedQuestion,
    //     input.output,
    //     input.ids
    //   )
    _: (input: QuizGenerationChainThroughput) => console.log(input.category)
  }).pick("output");

  const response = classifyAndSaveChain.invoke({question: input});
  return response;
}
// end::call[]
