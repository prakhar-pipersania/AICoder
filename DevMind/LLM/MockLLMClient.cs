using DevMind.Interfaces;

namespace DevMind.LLM
{
    public class MockLLMClient : ILLMChat
    {
        public async Task<string> ChatAsync(string userInput, string url, string model, string systemPrompt, string apiKey)
        {
            return model switch
            {
                "enhancer" => userInput + "\n[ENHANCED]",
                "planner" => "{\"update\":[],\"create\":[\"src/MockFile.cs\"],\"delete\":[]}",
                "codegen" => "{\"src/MockFile.cs\": \"// Generated file by DevMind\nnamespace Example { public class Generated {} }\"}",
                "docs" => "# Documentation\n\nAuto-generated README summary.",
                _ => ""
            };
        }
    }
}
