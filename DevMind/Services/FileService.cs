using DevMind.Interfaces;
using DevMind.Models;
using Microsoft.Extensions.Logging;
using System.Text;

namespace DevMind.Services
{
    /// <summary>
    /// Secure file service that enforces a workspace sandbox and validates paths to prevent traversal.
    /// </summary>
    public class FileService : IFileService
    {
        private readonly string _workspaceRoot;
        private readonly ILogger<FileService> _log;

        public string WorkspaceRoot => _workspaceRoot;

        public FileService(ILogger<FileService> log)
        {
            _log = log;
            _workspaceRoot = Path.Combine(Directory.GetCurrentDirectory(), "workspace");
            Directory.CreateDirectory(_workspaceRoot);
        }

        public List<string> EnumerateWorkspaceFiles()
        {
            var files = Directory.EnumerateFiles(_workspaceRoot, "*.*", SearchOption.AllDirectories)
                        .Where(f =>
                        {
                            var ext = Path.GetExtension(f).ToLower();
                            var fileName = Path.GetFileName(f).ToLower();
                            return Constants.AllowedExtensions.Contains(ext) || Constants.AllowedExtensions.Contains(fileName);
                        })
                        .Where(f =>
                        {
                            var ext = Path.GetExtension(f).ToLower();
                            return !Constants.ExcludedExtensions.Contains(ext);
                        })
                        .Where(f =>
                        {
                            var parts = Path.GetRelativePath(_workspaceRoot, f)
                                            .Split(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
                            return !Constants.ExcludedDirs.Any(d => parts.Contains(d));
                        })
                        .ToList();

            return files;
        }

        private string Resolve(string inputPath)
        {
            if (string.IsNullOrWhiteSpace(inputPath))
                throw new ArgumentException("Path is empty");

            // Normalize path separators
            var normalized = inputPath.Replace('/', Path.DirectorySeparatorChar)
                                      .Replace('\\', Path.DirectorySeparatorChar);

            // If relative, combine with workspace root
            string combinedPath = Path.IsPathRooted(normalized)
                ? Path.GetFullPath(normalized)
                : Path.GetFullPath(Path.Combine(_workspaceRoot, normalized));

            // Ensure the final resolved path is inside the workspace root
            var workspaceFullPath = Path.GetFullPath(_workspaceRoot + Path.DirectorySeparatorChar);

            if (!combinedPath.StartsWith(workspaceFullPath, StringComparison.OrdinalIgnoreCase))
                throw new UnauthorizedAccessException("Path is outside the workspace");

            return combinedPath;
        }

        public string GetFileContext(List<string> files = null)
        {
            files ??= EnumerateWorkspaceFiles();
            var sb = new StringBuilder();
            foreach (var f in files)
            {
                sb.AppendLine($"# FILE: {f}");
                sb.AppendLine(ReadFile(f));
            }
            return sb.ToString();
        }

        public string ReadFile(string relativePath)
        {
            var full = Resolve(relativePath);
            if (!File.Exists(full)) return string.Empty;
            return File.ReadAllText(full);
        }

        public void SaveFile(string relativePath, string content)
        {
            var full = Resolve(relativePath);
            Directory.CreateDirectory(Path.GetDirectoryName(full)!);
            File.WriteAllText(full, content);
            _log.LogInformation("Saved file {File}", Path.GetRelativePath(_workspaceRoot, relativePath));
        }

        public void DeleteFile(string relativePath)
        {
            var full = Resolve(relativePath);
            if (File.Exists(full)) File.Delete(full);
            _log.LogInformation("Deleted file {File}", Path.GetRelativePath(_workspaceRoot, relativePath));
        }
    }
}
