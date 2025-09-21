namespace AICoder.Services
{
    public static class Utility
    {
        public static string ParseOutput(this string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            int first = input.IndexOf('{');
            int last = input.LastIndexOf('}');

            if (first == -1 || last == -1 || last <= first)
                return string.Empty;

            return input.Substring(first, last - first + 1);
        }
    }
}
