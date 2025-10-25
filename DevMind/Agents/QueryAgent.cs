using DevMind.Interfaces;

namespace DevMind.Agents
{
    public class QueryAgent
    {
        private readonly string _agentName = "Query";
        private readonly ILLMClient _llm;

        public QueryAgent(ILLMClient llm) => _llm = llm;

        public async Task<string> AskAsync(string query, string docs, string context, CancellationToken ct = default)
        {
            string prompt = $"QUERY:\n {query} DOCUMENTATION:\n {docs} CONTEXT:\n {context}";
            var resp = await _llm.ExecutePromptAsync(_agentName, prompt, ct);
            return resp;
        }
    }
}
