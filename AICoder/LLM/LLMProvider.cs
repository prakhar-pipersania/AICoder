using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;

namespace AICoder.LLM
{
    public class LLMProvider
    {
        private readonly string agentName;
        private readonly string model;
        private readonly string provider;
        private readonly string apiKey;
        private readonly HttpClient client;

        public LLMProvider(string agent)
        {
            agentName = agent;
            IConfigurationRoot config = new ConfigurationBuilder()
                         .SetBasePath(Directory.GetCurrentDirectory())
                         .AddJsonFile("appsettings.json", optional: false)
                         .Build();

            client = new HttpClient();
            provider = config[$"Agents:{agentName}:Provider"];
            model = config[$"Agents:{agentName}:Model"];
            apiKey = config[$"Agents:{agentName}:API_KEY"];

            if(string.IsNullOrWhiteSpace(provider))
            {
                provider = config["DefaultProvider"];
            }

            if (string.IsNullOrEmpty(apiKey))
            {
                Console.WriteLine($"API Key for {provider} not set.");
            }
        }

        public async Task<string> ExecutePrompt(string prompt)
        {
            string response = string.Empty;
            response = provider == "azf-openai" ? await GetAzureFoundryOpenAIResponseAsync(prompt) : await GetGeminiResponseAsync(prompt);
            return response;
        }

        public async Task<string> GetAzureFoundryOpenAIResponseAsync(string userInput)
        {
            var request = new { model, input = new[] { new { role = "user", content = userInput } } };
            string json = JsonSerializer.Serialize(request);
            HttpRequestMessage httpReq = new HttpRequestMessage(HttpMethod.Post, "https://c9h9gf-test-resource.cognitiveservices.azure.com/openai/responses?api-version=2025-04-01-preview");
            httpReq.Headers.Add("Authorization", $"Bearer {apiKey}");
            httpReq.Content = new StringContent(json, Encoding.UTF8, "application/json");
            HttpResponseMessage resp = await client.SendAsync(httpReq);
            string respStr = await resp.Content.ReadAsStringAsync();
            using JsonDocument doc = JsonDocument.Parse(respStr);
            var reply = doc.RootElement
                .GetProperty("output")[1]
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString();

            return reply;
        }

        public async Task<string> GetGeminiResponseAsync(string userInput)
        {
            string systemMessage = string.Empty;
            List<Dictionary<string, object>> _messages = new List<Dictionary<string, object>>();
            _messages.Add(new Dictionary<string, object>
            {
                { "role", "user" },
                { "parts", new[] { new { text = userInput } } }
            });
            var body = new { systemInstruction = new Dictionary<string, object> { { "parts", new[] { new { text = systemMessage } } } }, contents = _messages };
            string bodyContent = JsonSerializer.Serialize(body);
            StringContent content = new StringContent(bodyContent, Encoding.UTF8, "application/json");
            content.Headers.Add("X-goog-api-key", apiKey);
            string url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";
            HttpResponseMessage response = await client.PostAsync(url, content);
            response.EnsureSuccessStatusCode();

            string responseString = await response.Content.ReadAsStringAsync();
            using JsonDocument doc = JsonDocument.Parse(responseString);

            string reply = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return reply;
        }
    }
}
