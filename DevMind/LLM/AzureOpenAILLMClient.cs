using DevMind.Interfaces;
using System.Text;
using System.Text.Json;

namespace DevMind.LLM
{
    public class AzureOpenAILLMClient : HttpBaseClient, ILLMChat
    {
        public async Task<string> ChatAsync(string userInput, string url, string model, string systemPrompt, string apiKey)
        {
            var request = new 
            { 
                model = model, 
                input = new[] 
                { 
                    new { role = "system", content = systemPrompt }, 
                    new { role = "user", content = userInput } 
                } 
            };
            string bodyContent = JsonSerializer.Serialize(request);
            StringContent content = new StringContent(bodyContent, Encoding.UTF8, "application/json");
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
            HttpResponseMessage response = await retryPolicy.ExecuteAsync(async () =>
            {
                return await client.PostAsync(url, content);
            });
            response.EnsureSuccessStatusCode();
            string respStr = await response.Content.ReadAsStringAsync();
            using JsonDocument doc = JsonDocument.Parse(respStr);
            var reply = doc.RootElement
                .GetProperty("output")[1]
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString();

            return reply;
        }
    }
}
