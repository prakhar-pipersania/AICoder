using DevMind.Interfaces;
using DevMind.Models;
using Microsoft.Extensions.Logging;

namespace DevMind
{
    /// <summary>
    /// Global exception handler that returns ProblemDetails and logs exceptions.
    /// </summary>
    public class DevMindWorker
    {
        private readonly IAgentOrchestrator _orchestrator;
        private readonly IFileService _files;
        private readonly ILogger<DevMindWorker> _log;

        public DevMindWorker(IAgentOrchestrator orchestrator, IFileService files, ILogger<DevMindWorker> log)
        {
            _orchestrator = orchestrator;
            _files = files;
            _log = log;
        }

        public async Task<TaskResponseDto> Start()
        {
            var response = new TaskResponseDto();
            try
            {
                while (true)
                {
                    _log.LogInformation("Enter requirements (or 'exit'): ");
                    string? task = Console.ReadLine();
                    if (task == null || task.ToLower() == "exit") break;

                    _log.LogInformation("Enhance the given requirements (Y/N)?: ");
                    string? shouldEnhance = Console.ReadLine();
                    var enhance = shouldEnhance.ToLower() == "y";

                    var includeContext = false;
                    if (_files.EnumerateWorkspaceFiles().Any())
                    {
                        _log.LogInformation("Include all files context to LLM (Y/N)?: ");
                        string? getAllContext = Console.ReadLine();
                        includeContext = getAllContext.ToLower() != "n";
                    }

                    var request = new TaskRequestDto()
                    {
                        IncludeContext = includeContext,
                        Requirements = task,
                        EnhanceRequirements = enhance
                    };
                    response = await _orchestrator.HandleTaskAsync(request);
                }
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Unhandled exception");
            }
            return response;
        }
    }
}
