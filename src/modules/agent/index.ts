import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import initAgent from "./agent";
import { initGraph } from "../graph";
import { sleep } from "@/utils";
import initClassificationChain from "./chains/classification.chain";

// tag::call[]
export async function call(input: string, sessionId: string): Promise<string> {
  // TODO: Replace this code with an agent
  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo",
    temperature: 0.5,
  });

  // const embeddings = new OpenAIEmbeddings({
  //   openAIApiKey: process.env.OPENAI_API_KEY,
  // });

  // Get Graph Singleton
  const graph = await initGraph();

  //const agent = await initAgent(llm, embeddings, graph);
  //const res = await agent.invoke({ input }, { configurable: { sessionId } });
  
  const classificationChain = initClassificationChain(llm);
  const response = await classificationChain.invoke({ question: input });

  return response;
}
// end::call[]
