import { config } from "dotenv";
import { BaseChatModel } from "langchain/chat_models/base";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import initClassificationChain from "./classification.chain";

describe("Classification Answer Generation Chain", () => {
  let llm: BaseChatModel;
  let chain: RunnableSequence;

  beforeAll(async () => {
    config({ path: ".env.local" });

    llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0.5,
      verbose: true,
    });

    chain = await initClassificationChain(llm);
  });

  describe("Classification", () => {
    it("should be the Person", async () => {
      const question = "Mozart";

      // tag::eval[]
      const response = await chain.invoke({
        question,
      });

      expect(`${response}`).toBe("Person");
      // end::eval[]
    });

    it("should be the Place", async () => {
      const question = "Yerevan";

      // tag::eval[]
      const response = await chain.invoke({
        question,
      });

      expect(`${response}`).toBe("Place");
      // end::eval[]
    });

    it("should be the Event", async () => {
      const question = "Olympic Games 2014";

      // tag::eval[]
      const response = await chain.invoke({
        question,
      });

      expect(`${response}`).toBe("Event");
      // end::eval[]
    });

    it("should be the Date", async () => {
      const question = "17 April 2024";

      // tag::eval[]
      const response = await chain.invoke({
        question,
      });

      expect(`${response}`).toBe("Date");
      // end::eval[]
    });

    it("should be the Culture", async () => {
      const question = "mona lisa picture";

      // tag::eval[]
      const response = await chain.invoke({
        question,
      });

      expect(`${response}`).toBe("Culture");
      // end::eval[]
    });

    it("should be not supported", async () => {
      const question = "Pencil";

      // tag::eval[]
      const response = await chain.invoke({
        question,
      });

      expect(`${response}`).toBe("Category is not supported yet!");
      // end::eval[]
    });
  });
});
