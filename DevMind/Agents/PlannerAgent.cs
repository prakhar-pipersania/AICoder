using DevMind.Interfaces;
using DevMind.Models;
using DevMind.Services;

namespace DevMind.Agents
{
    public class PlannerAgent
    {
        private readonly string _agentName = "Planner";
        private readonly ILLMClient _llm;

        public PlannerAgent(ILLMClient llm) => _llm = llm;

        public async Task<PlanResult> PlanAsync(string requirement, string docs, string context, CancellationToken ct = default)
        {
            string prompt = $"TASK:\n {requirement} CONTEXT:\n {context} DOCUMENTATION:\n {docs}";
            var resp = await _llm.ExecutePromptAsync(_agentName, prompt, ct);
            var plan = resp.Sanitize<PlanResult>();
            return plan;
        }
    }
}
