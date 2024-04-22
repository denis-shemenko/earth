import { parse } from "marked";
import * as chat from "@/hooks/chat";

function fixMarkdown(message: chat.Message): string {
  return parse(message.content).replace(
    '<a href="',
    '<a target="_blank" href="'
  );
}

export default function Message({ message }: { message: chat.Message }) {
  const align = message.role == "ai" ? "justify-start" : "justify-end";
  const no_rounding =
    message.role == "ai" ? "rounded-bl-none" : "rounded-br-none";
  const background = message.role == "ai" ? "blue" : "slate";

  return (
    <div className={`w-full flex flex-row ${align}`}>
      <span className="bg-blue-100"></span>
      <div className="flex flex-col space-y-2 text-sm mx-2 max-w-[60%] order-2 items-start">
        <div className={`bg-${background}-100 p-4 rounded-xl ${no_rounding}`}>
          {/* <div className={`text-${background}-400`}>{message.role}</div> */}

          <div
            dangerouslySetInnerHTML={{
              __html: fixMarkdown(message),
            }}
          />
          {message.options.length > 0 
            ? <div className="flex flex-wrap mt-4">
                {message.options.map((answer, index) => 
                  <button 
                  key={index} 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold m-1 py-2 px-4 rounded-full"
                  data-isCorrect={index == Number(message.correct)}>
                      {answer}
                  </button>)}
              </div>
            : null}
            
          {/* <time className={`text-xs font-bold text-${background}-400`}>
            12:32
          </time> */}
        </div>
      </div>
    </div>
  );
}
