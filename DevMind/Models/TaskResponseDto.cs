namespace DevMind.Models
{
    public sealed class TaskResponseDto
    {
        public PlanResult Plan { get; set; } = new PlanResult();
        public Dictionary<string, string> GeneratedFiles { get; set; } = new();
        public List<string> DeletedFiles { get; set; } = new();
        public string Documentation { get; set; } = string.Empty;
        public string CorrelationId { get; set; } = string.Empty;
    }
}
