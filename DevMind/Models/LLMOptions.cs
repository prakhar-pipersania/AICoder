namespace DevMind.Models
{
    public class LLMOptions
    {
        public string DefaultProvider { get; set; } = "mock";
        public Dictionary<string, LLMAgentOptions> Agents { get; set; } = new();
    }

    public class LLMAgentOptions
    {
        public string Provider { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string ApiKeyEnv { get; set; } = string.Empty; // name of environment variable where the key lives
        public string SystemPrompt { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
    }
}
