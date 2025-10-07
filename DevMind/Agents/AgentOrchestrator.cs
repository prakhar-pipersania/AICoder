using DevMind.Interfaces;
using DevMind.Models;
using DevMind.Services;
using Microsoft.Extensions.Logging;

namespace DevMind.Agents
{
    /// <summary>
    /// Orchestrates the multi-agent pipeline: Enhance -> Plan -> CodeGen -> Docs
    /// Depends on ILLMClient and IFileService abstractions.
    /// </summary>
    public class AgentOrchestrator : IAgentOrchestrator
    {
        private readonly EnhancerAgent _enhancer;
        private readonly PlannerAgent _planner;
        private readonly CodeGenAgent _codeGen;
        private readonly DocsAgent _docs;
        private readonly IFileService _files;
        private readonly ILogger<AgentOrchestrator> _log;

        public AgentOrchestrator(ILLMClient llm, IFileService files, ILogger<AgentOrchestrator> log)
        {
            _enhancer = new EnhancerAgent(llm);
            _planner = new PlannerAgent(llm);
            _codeGen = new CodeGenAgent(llm);
            _docs = new DocsAgent(llm, files);
            _files = files;
            _log = log;
        }

        public async Task<TaskResponseDto> HandleTaskAsync(TaskRequestDto request, CancellationToken ct = default)
        {
            var correlationId = Guid.NewGuid().ToString();
            _log.LogInformation("Starting Development. CorrelationId={CorrelationId}", correlationId);

            var result = new TaskResponseDto { CorrelationId = correlationId };

            // 1. Optionally collect project context
            string context = string.Empty;
            if (request.IncludeContext)
            {
                context = _files.GetFileContext();
            }

            // 2. Enhance requirement
            string enhancedRequirement = request.Requirements;
            if (request.EnhanceRequirements)
            {
                enhancedRequirement = await _enhancer.EnhanceAsync(request.Requirements);
                _log.LogInformation("Enhanced requirement: {Enhanced}", enhancedRequirement);
            }

            // 3. Plan
            string docs = await _docs.LoadDocumentationAsync(context);
            var planResponse = new PlanResult();
            planResponse = await _planner.PlanAsync(enhancedRequirement, docs, context, ct);
             _log.LogInformation("Planner Response: {planResponse}", planResponse.ToStr());
            result.Plan = planResponse;

            // Collect files to include for code generation if not already included.
            var contextFiles = planResponse.Update.Concat(planResponse.Create).Distinct().ToList();
            if (!request.IncludeContext && contextFiles.Any())
            {
                context = _files.GetFileContext(contextFiles);
            }

            // 4. Generate files
            if (contextFiles.Count > 0)
            {
                var genResponse = await _codeGen.GenerateAsync(enhancedRequirement, context, ct);
                if(genResponse == null)
                {
                    _log.LogWarning("CodeGen output is null. No files were created/updated.");
                }

                result.GeneratedFiles = genResponse;
                result.DeletedFiles = planResponse.Delete;

                if (genResponse != null)
                {
                    foreach (var kv in genResponse)
                    {
                        _files.SaveFile(kv.Key, kv.Value);
                    }

                    foreach (var del in planResponse.Delete)
                    {
                        _files.DeleteFile(del);
                    }

                    // 5. Update docs
                    try
                    {
                        var docsResp = await _docs.GenerateReadmeAsync(enhancedRequirement, docs, planResponse.ToStr(), genResponse.ToStr(), ct);

                        result.Documentation = docsResp;

                        if (result.Plan != null && result.GeneratedFiles != null && !string.IsNullOrWhiteSpace(docsResp))
                        {
                            _files.SaveFile("README.md", docsResp);
                        }
                    }
                    catch (Exception ex)
                    {
                        _log.LogWarning(ex, "Docs update failed, continuing.");
                    }
                }
            }

            _log.LogInformation($"Development {(result.GeneratedFiles == null ? "failed" : "complete")}. CorrelationId={correlationId}");
            return result;
        }
    }
}
