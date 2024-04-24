import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { BaseLanguageModel } from "langchain/base_language";

// tag::function[]
export default function initTopicExtractionChain(
  llm: BaseLanguageModel
): RunnableSequence<string, string> {
  const topicExtractionPrompt = PromptTemplate.fromTemplate(`
    You need to extract topic or key word on a specific category from the Input string.
    
    Instructions:
    The key word can be related to only category from the next list:
    [Person, Geography, Event, Date, Culture]
    If there is no word that can be extracted related to target category return "No Topic".
    If there are more than one key word can be extracted as Topic - choose any.
    
    Examples:
    1) 
    HUMAN: St. Petersburg
    AI: St. Petersburg
    
    2)
    HUMAN: The table is rectangular
    AI: No Topic
    
    Input:
    {input}`
  );

  return RunnableSequence.from([
    {
      input: new RunnablePassthrough()
    },
    topicExtractionPrompt, 
    llm, 
    new StringOutputParser()
  ]);
}
// end::function[]
