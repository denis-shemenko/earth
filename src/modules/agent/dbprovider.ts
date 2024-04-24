import { GeneratedCategories } from ".";
import { initGraph } from "../graph";
import { GeneratedQuestion } from "./chains/quiz-generation.chain";

// tag::save[]
export async function saveQuestion(
  sessionId: string,
  topic: string,
  category: string,
  generatedQuestion: GeneratedQuestion,
  generatedCategories: GeneratedCategories,
): Promise<string> {
  const graph = await initGraph()
  const res = await graph.query(
    `
    MERGE (session:Session { id: $sessionId, name: 'Denis' }) // <1>

// <2> Create new Question
CREATE (question:Question {
  id: randomUuid(),
  name: $question
})
CREATE (session)-[:GOT_QUESTION {at: datetime()}]->(question)

// <3> Create new Topic
CREATE (topic:Topic {
  name: $topic,
  category: $category
})
CREATE (question)-[:ABOUT]->(topic)

// TODO: HANDLE NOT_SUPPORTED categories
// <4> Create answers to the question
CREATE (a0topic:Topic {
  name: $answer0,
  category: $category0
})
CREATE (a1topic:Topic {
  name: $answer1,
  category: $category1
})
CREATE (a2topic:Topic {
  name: $answer2,
  category: $category2
})
CREATE (a3topic:Topic {
  name: $answer3,
  category: $category3
})

// <5> Create Q&A relationship
CREATE (question)-[:HAS_ANSWER]->(a0topic)
CREATE (question)-[:HAS_ANSWER]->(a1topic)
CREATE (question)-[:HAS_ANSWER]->(a2topic)
CREATE (question)-[:HAS_ANSWER]->(a3topic)
// TODO: mb use dynamic string building - CREATE (question)-[:CORRECT_ANSWER]->(a$correct)
    `,
    {
      sessionId,
      topic,
      category,
      question: generatedQuestion.question,
      answer0: generatedQuestion.answers[0],
      answer1: generatedQuestion.answers[1],
      answer2: generatedQuestion.answers[2],
      answer3: generatedQuestion.answers[3],
      correct: generatedQuestion.correct,
      category0: generatedCategories.category0,
      category1: generatedCategories.category1,
      category2: generatedCategories.category2,
      category3: generatedCategories.category3,
    }, 
    "WRITE");

  return "";
}
// end::save[]
