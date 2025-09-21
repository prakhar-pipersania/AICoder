using AICoder.LLM;
using AICoder.Models;
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

            if (!File.Exists(docPath))
            {
                File.WriteAllText(docPath, "# Documentation\n## Project Structure\n## File Descriptions\n## Dependencies\n## Recent Changes\n## TODOs\n");
            }
        }

        public string LoadDocumentation()
        {
            return File.Exists(docPath) ? File.ReadAllText(docPath): "";
        }

        public async Task UpdateDocumentationAsync(PlanResult plan, Dictionary<string, string> generatedFiles)
        {
            var planJson = JsonConvert.SerializeObject(plan);

            var fileSnippets = string.Join("\n\n", generatedFiles.Select(kv =>
                $"### {kv.Key}\n```\n{kv.Value}\n```"));

            var prompt = $@"
                            You are maintaining project documentation in markdown format.
                            Here is the current documentation:

                            --- OLD DOCUMENTATION ---
                            {LoadDocumentation()}
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
                            - Update '## Project Structure' to reflect the actual files and folders structure in the directory.
                            - In '## File Descriptions', keep previously entry intact only add/update/remove entries summarizing each file's purpose.
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
