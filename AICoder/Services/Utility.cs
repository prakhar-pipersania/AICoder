namespace AICoder.Services
{
    public static class Utility
    {
        private static string[] allowedExtensions = new[]
        {
            ".cs", ".csproj", ".html", ".css", ".c", ".cpp", ".h", ".js",
            ".ts", ".json", ".xml", ".yml", ".yaml", ".config", ".md"
        };
        private static string[] excludedDirs = { "bin", "obj", "node_modules", ".git" };
        private static string[] excludedExtensions = { ".dll", ".exe", ".pdb", ".log" };

        public static string ParseOutput(this string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            int first = input.IndexOf('{');
            int last = input.LastIndexOf('}');

            if (first == -1 || last == -1 || last <= first)
                return "{}";

            return input.Substring(first, last - first + 1);
        }

        public static string GetContext(this string dirPath)
        {
            var codeContext = string.Empty;
            var files = Directory.EnumerateFiles(dirPath, "*.*", SearchOption.AllDirectories)
                        .Where(f => allowedExtensions.Contains(Path.GetExtension(f).ToLower()))
                        .Where(f => !excludedExtensions.Contains(Path.GetExtension(f).ToLower()))
                        .Where(f => !excludedDirs.Any(d =>
                            f.Split(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                             .Contains(d)))
                        .ToArray();

            foreach (string file in files)
            {
                string content = File.ReadAllText(file);
                codeContext += $"-{file}:{content}\n";
            }
            return codeContext;
        }
    }
}
