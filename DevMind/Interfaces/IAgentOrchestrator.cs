using DevMind.Models;

namespace DevMind.Interfaces
{
    public interface IAgentOrchestrator
    {
        Task<TaskResponseDto> HandleTaskAsync(TaskRequestDto request, CancellationToken ct = default);
    }
}
