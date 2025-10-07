namespace DevMind.Interfaces
{
    /// <summary>
    /// Abstraction for LLM clients chat.
    /// </summary>
    public interface ILLMChat
    {
        /// <summary>
        /// Execute a prompt and return the textual reply from the LLM.
        /// </summary>
        Task<string> ChatAsync(string userInput, string url, string model, string systemPrompt, string apiKey);
    }
}
