using AICoder.LLM;
using AICoder.Models;
using AICoder.Services;
using Newtonsoft.Json;

namespace AICoder.Agents
{
    public class DocsAgent
    {
        private readonly string workspace = "workspace";
        private readonly string docPath;
        private readonly LLMProvider llm;

        public DocsAgent()
        {
            docPath = Path.Combine(workspace, "README.md");
            llm = new LLMProvider("Docs");
        }

        public async Task<string> LoadDocumentationAsync()
        {
            if (!File.Exists(docPath))
            {
                var codeContext = $"Content of all the files:\n {Utility.GetContext(workspace)}";
                var prompt = $@"
                            You are maintaining project documentation in markdown format.

                            {codeContext}

                            Your task:
                            - Write the documentation in the following format:
                              # Documentation
                              ## Project Structure
                              ## File Descriptions
                              ## Dependencies
                              ## Recent Changes
                              ## TODOs
                            - Update '## Project Structure' to reflect the actual files and folders structure in the directory. Like below:
                                │── Services
                                │   ├── FileOps.cs
                                │   └── Utility.cs
                                │
                                │── appsettings.json
                                │── Program.cs
                            - In '## File Descriptions', keep previously entry intact only add/update/remove entries summarizing each file's by focusing on: 1) The purpose of the file 2) Key classes/functions/configurations 3) How this file fits into the overall project.
                            - In '## Dependencies', list any libraries/frameworks/configs required.
                            - In '## Recent Changes', keep previously entry intact and add a new dated entry summarizing created, updated, and deleted files.
                            - Keep '## TODOs' updated based on implementation or add new relevant items if appropriate.
                            - Return the full updated markdown only.
                            ";

                string newDoc = await llm.ExecutePrompt(prompt);
                File.WriteAllText(docPath, newDoc);
            }
            return File.ReadAllText(docPath);
        }

        public async Task UpdateDocumentationAsync(PlanResult plan, Dictionary<string, string> generatedFiles)
        {
            var planJson = JsonConvert.SerializeObject(plan);
            var oldDocumentation = await LoadDocumentationAsync();
            var fileSnippets = string.Join("\n\n", generatedFiles.Select(kv =>
                $"### {kv.Key}\n```\n{kv.Value}\n```"));

            var prompt = $@"
                            You are maintaining project documentation in markdown format.
                            Here is the current documentation:

                            --- OLD DOCUMENTATION ---
                            {oldDocumentation}
                            --- END OLD DOCUMENTATION ---

                            Here is the plan result describing which files were created, updated, or deleted:
                            {planJson}

                            Here are the full contents of the new/updated files:
                            {fileSnippets}

                            Your task:
                            - Rewrite the documentation in the same format:
                              # Documentation
                              ## Project Structure
                              ## File Descriptions
                              ## Dependencies
                              ## Recent Changes
                              ## TODOs
                            - Update '## Project Structure' to reflect the actual files and folders structure in the directory. Like below:
                                │── Services
                                │   ├── FileOps.cs
                                │   └── Utility.cs
                                │
                                │── appsettings.json
                                │── Program.cs
                            - In '## File Descriptions', keep previously entry intact only add/update/remove entries summarizing each file's by focusing on: 1) The purpose of the file 2) Key classes/functions/configurations 3) How this file fits into the overall project.
                            - In '## Dependencies', list any libraries/frameworks/configs required.
                            - In '## Recent Changes', keep previously entry intact and add a new dated entry summarizing created, updated, and deleted files.
                            - Keep '## TODOs' updated based on implementation or add new relevant items if appropriate.
                            - Return the full updated markdown only.
                            ";

            string newDoc = await llm.ExecutePrompt(prompt);
            File.WriteAllText(docPath, newDoc);
        }
    }
}
