import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { BaseLanguageModel } from "langchain/base_language";

// tag::function[]
export default function initClassificationChain(
  llm: BaseLanguageModel
): RunnableSequence<string, string> {
  const answerQuestionPrompt = PromptTemplate.fromTemplate(`
    You need to classify player's question and respond with the Category only.

    Question:
    {question}

    Only the categories from the next list are supported now:
    [Person, Place, Event, Date, Culture]
    If category is not contained in the provided list, just answer: "Category is not supported yet!", don't try to make up an answer.
    If category is a good fit for more than one of supported, choose any.`
  );

  return RunnableSequence.from([
    {
      question: new RunnablePassthrough()
    },
    answerQuestionPrompt, 
    llm, 
    new StringOutputParser()
  ]);
}
// end::function[]
