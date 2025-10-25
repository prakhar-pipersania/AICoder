namespace DevMind.Models
{
    public class Constants
    {
        public static readonly int RetryCount = 3;

        public static readonly string Checkpoints = ".checkpoints";

        public enum ChatType
        {
            ASK,
            AGENT,
            RESTORE
        }

        public static string[] AllowedExtensions = new[]
        {
            // General
            ".md", ".txt",

            // Config / Data
            ".json", ".xml", ".yml", ".yaml", ".ini", ".toml", ".config",

            // C#
            ".cs", ".csproj", ".sln",

            // C / C++
            ".c", ".cpp", ".h", ".hpp", ".cc",

            // Java
            ".java", ".gradle", ".groovy", ".properties", ".pom",

            // JavaScript / TypeScript
            ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",

            // Web
            ".html", ".css", ".scss", ".less",

            // Python
            ".py", "requirements.txt", "pyproject.toml", "setup.py",

            // Go
            ".go", "go.mod", "go.sum",

            // Rust
            ".rs", "Cargo.toml", "Cargo.lock",

            // PHP
            ".php", ".blade.php", "composer.json", "composer.lock",

            // Other build configs
            "Makefile", "Dockerfile", ".dockerignore"
        };

        public static string[] ExcludedExtensions = new[]
        {
            // Binaries
            ".dll", ".exe", ".pdb", ".so", ".dylib", ".o", ".a",

            // Java
            ".class", ".jar", ".war", ".ear",

            // Python
            ".pyc", ".pyo",

            // Archives
            ".zip", ".tar", ".gz", ".7z", ".rar",

            // Logs
            ".log"
        };

        public static string[] ExcludedDirs = new[]
        {
            // Common
            ".git", ".svn", ".hg", ".idea", ".vs", ".vscode",

            // .NET
            "bin", "obj",

            // Java
            "target", "out",

            // JavaScript / Web
            "node_modules", "dist", "build",

            // Python
            "__pycache__", ".pytest_cache", ".mypy_cache",

            // Rust / Go
            "target", "pkg",

            // General cache
            ".cache"
        };
    }
}
