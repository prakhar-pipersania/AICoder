using static DevMind.Models.Constants;

namespace DevMind.Models
{
    public sealed class TaskRequestDto
    {
        public ChatType Type { get; set; } = Constants.ChatType.ASK;
        public string Requirements { get; set; } = string.Empty;
        public bool IncludeContext { get; set; } = false;
    }
}
