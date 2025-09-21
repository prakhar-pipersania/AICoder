namespace AICoder.Models
{
    public class PlanResult
    {
        public List<string> Update { get; set; } = new();
        public List<string> Create { get; set; } = new();
        public List<string> Delete { get; set; } = new();
    }
}
