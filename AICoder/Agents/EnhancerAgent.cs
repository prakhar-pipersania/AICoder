using AICoder.LLM;

namespace AICoder.Agents
{
    public class EnhancerAgent
    {
        private readonly LLMProvider llm;
        public EnhancerAgent()
        {
            llm = new LLMProvider("Enhancer");
        }

        public async Task<string> Enhance(string requirements)
        {
            string prompt = $@"
                            Enhance the requirements given below and return only the enhanced requirement without markdown or any other formatting.
                            Requirements:
                            {requirements}
                            ";

            return await llm.ExecutePrompt(prompt);
        }
    }
}
