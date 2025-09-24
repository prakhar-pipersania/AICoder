using AICoder.Services;
using Newtonsoft.Json;

namespace AICoder.Agents
{
    public class AiAgent
    {
        private readonly PlannerAgent planner;
        private readonly CodeGenAgent codeGen;
        private readonly EnhancerAgent enhancer;
        private readonly DocsAgent docs;

        public AiAgent()
        {
            planner = new PlannerAgent();
            codeGen = new CodeGenAgent();
            enhancer = new EnhancerAgent();
            docs = new DocsAgent();
        }

        public async Task HandleTask(string task, bool includeContext)
        {
            var context = string.Empty;
            if(includeContext)
            {
                Console.WriteLine("AICoder will work with complete App Context");
                context = $"Content of all the files:\n {Utility.GetContext("workspace")}";
            }

            // Step 1: Enhance the requirement given by user.
            string requirement = await enhancer.Enhance(task);
            Console.WriteLine("Enhanced requirement: "+requirement);

            // Step 2: Load and analyze documentation
            string docContent = await docs.LoadDocumentationAsync();
            var plan = await planner.PlanTask(requirement, docContent, context);
            Console.WriteLine("Planner: " + JsonConvert.SerializeObject(plan));

            // Step 3: Generate/update/delete files
            List<string> contextFiles = new List<string>();
            contextFiles.AddRange(plan.Update);
            contextFiles.AddRange(plan.Create);

            if (contextFiles.Count > 0)
            {
                if (!includeContext)
                {
                    context = $"Content of the selected files: {codeGen.CollectContext(contextFiles)}";
                }
                var generatedFiles = await codeGen.GenerateFiles(requirement, context, plan);

                // Step 4: Update documentation
                if (generatedFiles.Count > 0)
                {
                    await docs.UpdateDocumentationAsync(plan, generatedFiles);
                    Console.WriteLine("Updated Documentation");
                }
                else
                {
                    Console.WriteLine("No Files changes skipping documentation");
                }
            }
        }
    }
}