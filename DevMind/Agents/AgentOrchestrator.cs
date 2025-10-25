using DevMind.Interfaces;
using DevMind.Models;
using DevMind.Services;
using Microsoft.Extensions.Logging;

namespace DevMind.Agents
{
    /// <summary>
    /// Orchestrates the query-agent and multi-agent pipeline: Plan -> CodeGen -> Docs
    /// Depends on ILLMClient and IFileService abstractions.
    /// </summary>
    public class AgentOrchestrator : IAgentOrchestrator
    {
        private readonly QueryAgent _queryAgent;
        private readonly PlannerAgent _planner;
        private readonly CodeGenAgent _codeGen;
        private readonly DocsAgent _docs;
        private readonly IFileService _files;
        private readonly ILogger<AgentOrchestrator> _log;

        public AgentOrchestrator(ILLMClient llm, IFileService files, ILogger<AgentOrchestrator> log)
        {
            _queryAgent = new QueryAgent(llm);
            _planner = new PlannerAgent(llm);
            _codeGen = new CodeGenAgent(llm);
            _docs = new DocsAgent(llm, files);
            _files = files;
            _log = log;
        }

        public async Task<TaskResponseDto> HandleTaskAsync(TaskRequestDto request, CancellationToken ct = default)
        {
            if(request.Type == Constants.ChatType.ASK)
            {
                return await this.AskQuery(request, ct);
            }
            else if(request.Type == Constants.ChatType.RESTORE)
            {
                var result = new TaskResponseDto();
                result.Response = await _files.RestoreLatestCheckpointAsync();
                return result;
            }
            return await this.StartAgent(request, ct);
        }

        private async Task<string> GetDocumentation(string context)
        {
            string docs = null;
            if (_docs.DocumentationExistsAsync())
            {
                _log.LogInformation("Loading project documentation...");
            }
            else if (_files.EnumerateWorkspaceFiles().Any())
            {
                _log.LogInformation("Creating documentation based on project files...");
            }
            else
            {
                docs = "Workspace does not contain any files.";
            }
            docs ??= await _docs.LoadDocumentationAsync(context);
            return docs;
        }

        private async Task<TaskResponseDto> AskQuery(TaskRequestDto request, CancellationToken ct = default)
        {
            var result = new TaskResponseDto();

            // 1. Optionally collect project context
            string context = string.Empty;
            if (request.IncludeContext)
            {
                context = _files.GetFileContext();
            }

            // 2. User query execution 
            var docs = await GetDocumentation(context);
            int retryCount = Constants.RetryCount;
            string response = null;
            while (response == null && retryCount > 0)
            {
                response = await _queryAgent.AskAsync(request.Requirements, docs, context, ct);
                --retryCount;
                if (!string.IsNullOrWhiteSpace(response))
                {
                    result.Response = response;
                    _log.LogInformation("Query Result:\n {response}", response);
                    break;
                }
                _log.LogWarning("Query execution failed" + (retryCount == 0 ? "- terminating request." : ". Retrying Query..."));
            }

            return result;
        }

        private async Task<TaskResponseDto> StartAgent(TaskRequestDto request, CancellationToken ct = default)
        {
            var correlationId = Guid.NewGuid().ToString();
            _log.LogInformation("Starting Development. CorrelationId={CorrelationId}", correlationId);

            var result = new TaskResponseDto { CorrelationId = correlationId };

            // 1. Optionally collect project context
            string context = string.Empty;
            if (request.IncludeContext)
            {
                _log.LogInformation("Adding all files to context based on user input.");
                context = _files.GetFileContext();
            }

            string enhancedRequirement = request.Requirements;

            // 2. Plan
            var docs = await GetDocumentation(context);
            int retryCount = Constants.RetryCount;
            PlanResult planResponse = null;
            while (planResponse == null && retryCount > 0)
            {
                planResponse = await _planner.PlanAsync(enhancedRequirement, docs, context, ct);
                --retryCount;
                if (planResponse != null)
                {
                    _log.LogInformation("Planner Response: {planResponse}", planResponse.ToStr());
                    break;
                }
                _log.LogWarning("Plan Generation failed." + (retryCount == 0 ? "Further processing will be terminated." : "Regenerating code..."));
            }

            if (planResponse != null)
            {
                result.Plan = planResponse;

                // Collect files to include for code generation if not already included.
                var contextFiles = planResponse.Update.Concat(planResponse.Create).Distinct().ToList();
                if (!request.IncludeContext && contextFiles.Any())
                {
                    _log.LogInformation("Creating context based on planner response.");
                    context = _files.GetFileContext(contextFiles);
                }
                else
                {
                    _log.LogWarning("Planner response may be ignore based on prior decisions.");
                }

                // 3. Generate files
                Dictionary<string, string> genResponse = null;
                if (contextFiles.Count > 0)
                {
                    retryCount = Constants.RetryCount;
                    while (genResponse == null && retryCount > 0)
                    {
                        genResponse = await _codeGen.GenerateAsync(enhancedRequirement, context, ct);
                        --retryCount;
                        if (genResponse != null)
                        {
                            _log.LogInformation("Code Generation was successful.");
                            break;
                        }
                        _log.LogWarning("Code Generation failed." + (retryCount == 0 ? "No files will be created/updated." : "Regenerating code..."));
                    }

                    if (genResponse != null)
                    {
                        result.GeneratedFiles = genResponse;
                        result.DeletedFiles = planResponse.Delete;

                        await _files.CreateCheckpointAsync();
                        _log.LogInformation("Applying new changes...");

                        foreach (var kv in genResponse)
                        {
                            _files.SaveFile(kv.Key, kv.Value);
                        }

                        foreach (var del in planResponse.Delete)
                        {
                            _files.DeleteFile(del);
                        }

                        // 4. Update docs
                        try
                        {
                            var docsResp = await _docs.GenerateReadmeAsync(enhancedRequirement, docs, planResponse.ToStr(), genResponse.ToStr(), ct);

                            result.Documentation = docsResp;
                            _log.LogInformation("Updating documentation...");
                            if (result.Plan != null && result.GeneratedFiles != null && !string.IsNullOrWhiteSpace(docsResp))
                            {
                                _files.SaveFile("README.md", docsResp);
                            }
                        }
                        catch (Exception ex)
                        {
                            _log.LogWarning(ex, "Documentation update failed.");
                        }
                    }
                }
            }

            _log.LogInformation($"Development {(result.GeneratedFiles == null ? "failed" : "complete")}. CorrelationId={correlationId}");
            return result;
        }
    }
}
