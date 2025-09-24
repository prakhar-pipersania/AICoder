using AICoder.LLM;
using AICoder.Models;
using AICoder.Services;
using Newtonsoft.Json;

namespace AICoder.Agents
{
    public class CodeGenAgent
    {
        private readonly LLMProvider llm;
        private readonly FileOps fileOps;

        public CodeGenAgent()
        {
            llm = new LLMProvider("CodeGen");
            fileOps = new FileOps();
        }

        public string CollectContext(List<string> files)
        {
            string context = "";
            foreach (string f in files)
            {
                var data = fileOps.ReadFile(f);
                context += $"\n# FILE: {f}\n" + data;
            }

            return context;
        }

        public async Task<Dictionary<string, string>> GenerateFiles(string task, string context, PlanResult plan)
        {
            string prompt = @$"
                                Task: {task}
                                {context}
                                Return only a flat JSON object in the following format, without markdown formatting, without code blocks, without explanations:

                                {{
                                  ""filepath/fileName.ext"": ""file content without formatting or code block"",
                                  ""filepath/fileName2.ext"": ""file2 content without formatting or code block""
                                }}
                                ";

            string response = await llm.ExecutePrompt(prompt);
            string output = response.ParseOutput();

            // Parse JSON response into dictionary
            Dictionary<string, string> result;
            try
            {
                result = JsonConvert.DeserializeObject<Dictionary<string, string>>(output)
                         ?? new Dictionary<string, string>();

                // Save files & update documentation
                foreach (var kv in result)
                {
                    fileOps.SaveFile(kv.Key, kv.Value);
                    Console.WriteLine($"Saved: {kv.Key}");
                }

                // Delete files from plan
                foreach (var file in plan.Delete)
                {
                    fileOps.DeleteFile(file);
                    Console.WriteLine($"Deleted: {file}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing JSON: {ex.Message}");
                result = new Dictionary<string, string>();
            }

            return result;
        }
    }
}
