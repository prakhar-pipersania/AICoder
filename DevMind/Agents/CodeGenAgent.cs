using DevMind.Interfaces;
using DevMind.Services;

namespace DevMind.Agents
{
    public class CodeGenAgent
    {
        private readonly string _agentName = "CodeGen";
        private readonly ILLMClient _llm;

        public CodeGenAgent(ILLMClient llm) => _llm = llm;

        public async Task<Dictionary<string, string>> GenerateAsync(string task, string context, CancellationToken ct = default)
        {
            string prompt = $"TASK: {task}\n CONTEXT: {context}";
            var resp = await _llm.ExecutePromptAsync(_agentName, prompt, ct);
            var dict = resp.Sanitize<Dictionary<string, string>>();
            return dict;
        }
    }
}
