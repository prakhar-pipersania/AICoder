using DevMind.Interfaces;
using DevMind.LLM;
using DevMind.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AICoder.Infrastructure.LLM
{
    /// <summary>
    /// Basic LLM client implements a 'mock' provider if no real keys are provided (safe default for local dev).
    /// </summary>
    public class LLMProvider : ILLMClient
    {
        private readonly LLMOptions _options;
        private readonly ILogger<LLMProvider> _log;

        public LLMProvider(IOptions<LLMOptions> options, ILogger<LLMProvider> log)
        {
            _options = options.Value;
            _log = log;
        }

        public async Task<string> ExecutePromptAsync(string agentName, string prompt, CancellationToken ct = default)
        {
            // Resolve agent config
            if (!_options.Agents.TryGetValue(agentName, out var agentCfg))
            {
                agentCfg = new LLMAgentOptions { Provider = _options.DefaultProvider };
            }

            if(string.IsNullOrWhiteSpace(agentCfg.Provider))
            {
                agentCfg.Provider = _options.DefaultProvider;
            }

            // If provider is 'mock' or there is no API key set, return a deterministic safe response for local development
            string apiKey = null;
            if (!string.IsNullOrWhiteSpace(agentCfg.ApiKeyEnv))
            {
                apiKey = Environment.GetEnvironmentVariable(agentCfg.ApiKeyEnv);
            }

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _log.LogError("Using mock or set a API Key for agent {Agent}", agentName);
                return $"{{ 'message': 'Set a API Key for agent {agentName}' }}";
            }

            _log.LogInformation("Calling provider {Provider} for agent {Agent} (model={Model})", agentCfg.Provider, agentName, agentCfg.Model);
            return await ChatAsync(agentCfg, prompt);
        }

        private async Task<string> ChatAsync(LLMAgentOptions options, string userInput)
        {
            var response = string.Empty;
            ILLMChat llmChat = options?.Provider switch
            {
                "azopenai" => new AzureOpenAILLMClient(),
                "gemini" => new GeminiLLMClient(),
                _ => new MockLLMClient(),
            };

            try
            {
                response = await llmChat.ChatAsync(userInput, options.Url, options.Model, options.SystemPrompt, Environment.GetEnvironmentVariable(options.ApiKeyEnv));
                _log.LogInformation("Fetched response from LLM.");
            }
            catch (Exception ex)
            {
                response = "Failed to get response from LLM";
                _log.LogError($"Failed to get response from LLM {ex.GetBaseException()}");
            }
            return response;
        }
    }
}
