namespace DevMind.Interfaces
{
    /// <summary>
    /// Abstraction for LLM clients. Implementations should be resilient and respect provider contracts.
    /// </summary>
    public interface ILLMClient
    {
        /// <summary>
        /// Execute a prompt and return the textual reply from the LLM.
        /// Implementations should not throw on transient network errors but surface them appropriately.
        /// </summary>
        Task<string> ExecutePromptAsync(string agentName, string prompt, CancellationToken ct = default);
    }
}
