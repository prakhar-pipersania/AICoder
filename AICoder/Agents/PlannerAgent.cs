using AICoder.LLM;
using AICoder.Models;
using AICoder.Services;
using System.Text.Json;

namespace AICoder.Agents
{
    public class PlannerAgent
    {
        private readonly LLMProvider llm;
        public PlannerAgent()
        {
            llm = new LLMProvider("Planner");
        }

        public async Task<PlanResult> PlanTask(string task, string projectDoc)
        {
            string prompt = $@"
                            You are a project planning assistant. A user wants to update their project with the following task:

                            TASK:
                            {task}

                            PROJECT DOCUMENTATION:
                            {projectDoc}

                            Decide which files should be CREATED, UPDATED and DELETED to complete the task.
                            Never consider documentation for any operation (CREATED, UPDATED or DELETED), if documentation is empty operation for all files will be create.
                            Return only valid raw JSON without markdown formatting, without explanations, and without surrounding code fences.
                            Do not wrap the response in ``` or any other formatting.
                            Example of the required format:
                            {{
                              ""update"": [""Controllers/AuthController.cs""],
                              ""create"": [""Services/EmailService.cs""],
                              ""delete"": [""Services/TempService.cs""]
                            }}
                            ";

            string response = await llm.ExecutePrompt(prompt);
            string output = response.ParseOutput();

            try
            {
                var result = JsonSerializer.Deserialize<PlanResult>(output,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                return result ?? new PlanResult();
            }
            catch
            {
                Console.WriteLine("Planner could not parse LLM output. Falling back to empty plan.");
                return new PlanResult();
            }
        }
    }

}
