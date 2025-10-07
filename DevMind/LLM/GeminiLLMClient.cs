using DevMind.Interfaces;
using System.Text;
using System.Text.Json;

namespace DevMind.LLM
{
    public class GeminiLLMClient : HttpBaseClient, ILLMChat
    {
        public async Task<string> ChatAsync(string userInput, string url, string model, string systemPrompt, string apiKey)
        {
            List<Dictionary<string, object>> _messages = new List<Dictionary<string, object>>();
            _messages.Add(new Dictionary<string, object>
            {
                { "role", "user" },
                { "parts", new[] { new { text = userInput } } }
            });
            var body = new 
            { 
                systemInstruction = new Dictionary<string, object> { { "parts", new[] { new { text = systemPrompt } } } }, 
                contents = _messages 
            };
            string bodyContent = JsonSerializer.Serialize(body);
            StringContent content = new StringContent(bodyContent, Encoding.UTF8, "application/json");
            content.Headers.Add("X-goog-api-key", apiKey);
            url = url.Replace("{model}", model);
            HttpResponseMessage response = await retryPolicy.ExecuteAsync(async () =>
            {
                return await client.PostAsync(url, content);
            });
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
