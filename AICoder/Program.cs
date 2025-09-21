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

                await agent.HandleTask(task);
            }
        }
    }
}
