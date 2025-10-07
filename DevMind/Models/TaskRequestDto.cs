namespace DevMind.Models
{
    public sealed class TaskRequestDto
    {
        public string Requirements { get; set; } = string.Empty;
        public bool IncludeContext { get; set; } = false;
        public bool EnhanceRequirements { get; set; } = false;
    }
}
