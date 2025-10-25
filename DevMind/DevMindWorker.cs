using DevMind.Interfaces;
using DevMind.Models;
using Microsoft.Extensions.Logging;
using static DevMind.Models.Constants;

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
                _log.LogInformation("Enter the project folder path: ");
                string? path = Console.ReadLine();
                if (string.IsNullOrWhiteSpace(path))
                {
                    path = Path.Combine(Directory.GetCurrentDirectory(), "workspace");
                }
                string fullPath = Path.GetFullPath(path);
                _log.LogInformation($"Full path: {fullPath}");
                _files.AddWorkspacePath(fullPath);

                while (true)
                {
                    var includeContext = false;
                    var task = string.Empty;

                    _log.LogInformation("Enter ChatType (ask, agent, restore or exit): ");
                    string? type = Console.ReadLine();
                    if (type.ToLower() == "exit") 
                        break;
                    var chatType = Enum.TryParse(type, true, out ChatType parsed) ? parsed : ChatType.ASK;

                    if (chatType != ChatType.RESTORE)
                    {
                        _log.LogInformation("Enter " + (chatType == ChatType.AGENT ? "requirements": "query") + ": ");
                        task = Console.ReadLine();
                        if (string.IsNullOrWhiteSpace(task)) 
                            continue;

                        if (_files.EnumerateWorkspaceFiles().Any())
                        {
                            _log.LogInformation("Include all files context to LLM (Y/N)?: ");
                            string? getAllContext = Console.ReadLine();
                            includeContext = getAllContext.ToLower() != "n";
                        }
                    }

                    var request = new TaskRequestDto()
                    {
                        Type = chatType,
                        IncludeContext = includeContext,
                        Requirements = task
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
