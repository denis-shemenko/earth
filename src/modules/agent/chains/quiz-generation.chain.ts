import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { BaseLanguageModel } from "langchain/base_language";

export interface GeneratedQuestion {
  question: string;
  answers: string[];
  correct: string;
}

// tag::function[]
export default function initQuizGenerationChain(
  llm: BaseLanguageModel
): RunnableSequence<string, GeneratedQuestion> {
  const generateQuizPrompt = PromptTemplate.fromTemplate(`
    Generate exactly one interesting question for the curious player on specific Topic with Category.

    Topic: {topic}
    Category: for now use any relevant to the Topic

    For example the Category for questions about famous persons can be Date of Birth, City of death and so on.
    But be creative and use your pretrained data to construct the question.
    
    Rules:
    - Use 4 available options for answers to the question
    - Always include Correct answer to the available options
    - Randomize the position of Correct Answer, so it is not always (A)
    - Do NOT Include ordering with letters (A, B, C) or numbers (1,2,3) to the options text
    - Output JSON as {{"question": "put generated question here", "answers":["Option A", "Option B", "Option C", "Option D"], "correct": "just put the correct answer zero-based index here"}}`
  );

  return RunnableSequence.from([
    {
      topic: new RunnablePassthrough()
    },
    generateQuizPrompt, 
    llm, 
    new JsonOutputParser<GeneratedQuestion>()
  ]);
}
// end::function[]
