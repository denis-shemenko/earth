import { WolframAlphaTool } from "@langchain/community/tools/wolframalpha";

export default function initWolframTool(): WolframAlphaTool {
    const tool = new WolframAlphaTool({
        appid: process.env.WOLFRAM_ALPHA_APPID || "not provided",
    });

    return tool;
}

/* USAGE
  const wfTool = initWolframTool();
  const response = await wfTool.invoke(input);
*/