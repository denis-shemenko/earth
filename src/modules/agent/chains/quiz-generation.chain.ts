import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { BaseLanguageModel } from "langchain/base_language";

// tag::function[]
export default function initQuizGenerationChain(
  llm: BaseLanguageModel
): RunnableSequence<string, string> {
  const generateQuizPrompt = PromptTemplate.fromTemplate(`
    Generate exactly one interesting question for the curious player on specific Topic with Category.

    Topic: {topic}
    Category: for now use any relevant to the Topic

    For example the Category for questions about famous persons can be Date of Birth, City of death and so on.
    But be creative and use your pretrained data to construct the question.
    
    Rules:
    - Use 4 available options for answers to the question
    - Include proper answer and mark it with the label: [Correct Answer]
    - Randomize the position of Correct Answer, so it is not always (A)`
  );

  return RunnableSequence.from([
    {
      topic: new RunnablePassthrough()
    },
    generateQuizPrompt, 
    llm, 
    new StringOutputParser()
  ]);
}
// end::function[]
