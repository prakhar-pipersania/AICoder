using AICoder.Agents;

namespace AICoder
{
    internal class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("AI Coding Assistant Ready!");

            AiAgent agent = new AiAgent();
            while (true)
            {
                Console.Write("\nEnter requirements (or 'exit'): ");
                string? task = Console.ReadLine();
                if (task == null || task.ToLower() == "exit") break;

                Console.Write("\nSend all files to LLM (Y/N)?: ");
                string? getAllContext = Console.ReadLine();
                bool includeContext = getAllContext.ToLower() == "y";

                await agent.HandleTask(task, includeContext);
            }
        }
    }
}
