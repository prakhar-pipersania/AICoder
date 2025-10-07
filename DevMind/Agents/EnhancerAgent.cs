using DevMind.Interfaces;

namespace DevMind.Agents
{
    /// <summary>
    /// Enhance the requirement given by user.
    /// </summary>
    public class EnhancerAgent
    {
        private readonly string _agentName = "Enhancer";
        private readonly ILLMClient _llm;
        public EnhancerAgent(ILLMClient llm) => _llm = llm;

        public Task<string> EnhanceAsync(string requirement, CancellationToken ct = default)
            => _llm.ExecutePromptAsync(_agentName, $"Requirements:\n{requirement}", ct);
    }
}
