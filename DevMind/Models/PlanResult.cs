namespace DevMind.Models
{
    /// <summary>
    /// Domain model representing the planner decision. Plain DTO used across layers.
    /// </summary>
    public sealed class PlanResult
    {
        public List<string> Update { get; init; } = new();
        public List<string> Create { get; init; } = new();
        public List<string> Delete { get; init; } = new();
    }
}
