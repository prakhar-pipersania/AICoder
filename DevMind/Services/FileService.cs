using DevMind.Interfaces;
using DevMind.Models;
using Microsoft.Extensions.Logging;
using System.IO.Compression;
using System.Text;

namespace DevMind.Services
{
    /// <summary>
    /// Secure file service that enforces a workspace sandbox and validates paths to prevent traversal.
    /// </summary>
    public class FileService : IFileService
    {
        private string _workspaceRoot;
        private string _checkpointsDir;
        private readonly ILogger<FileService> _log;

        public FileService(ILogger<FileService> log)
        {
            _log = log;
        }

        public void AddWorkspacePath(string path)
        {
            _workspaceRoot = path;
            Directory.CreateDirectory(_workspaceRoot);
            _checkpointsDir = Path.Combine(_workspaceRoot, Constants.Checkpoints);
            Directory.CreateDirectory(_checkpointsDir);
        }

        /// <summary>
        /// Creates a zip archive of the workspace and stores it in the Checkpoints folder.
        /// </summary>
        public async Task<string> CreateCheckpointAsync()
        {
            if(!this.EnumerateWorkspaceFiles().Any())
            {
                return null;
            }
            try
            {
                // Use Unix epoch timestamp for file name
                long epoch = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                string zipFilePath = Path.Combine(_checkpointsDir, $"{epoch}.zip");

                // Create zip of the workspace
                if (File.Exists(zipFilePath))
                {
                    File.Delete(zipFilePath);
                }

                var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
                Directory.CreateDirectory(tempDir);

                // Copy all files except .checkpoints
                foreach (var file in EnumerateWorkspaceFiles())
                {
                    if (file.StartsWith(Path.Combine(_workspaceRoot, Constants.Checkpoints)))
                        continue; // skip checkpoints folder

                    var relativePath = Path.GetRelativePath(_workspaceRoot, file);
                    var destPath = Path.Combine(tempDir, relativePath);
                    Directory.CreateDirectory(Path.GetDirectoryName(destPath)!);
                    File.Copy(file, destPath, overwrite: true);
                }

                // Create zip from tempDir
                ZipFile.CreateFromDirectory(tempDir, zipFilePath, CompressionLevel.Optimal, includeBaseDirectory: false);

                // Clean up
                Directory.Delete(tempDir, recursive: true);

                _log.LogInformation($"Checkpoint created: {Path.GetRelativePath(_workspaceRoot, zipFilePath)}");
                return zipFilePath;
            }
            catch (Exception ex)
            {
                _log.LogError($"Failed to create checkpoint.");
                throw;
            }
        }

        /// <summary>
        /// Restores the most recent checkpoint zip into the workspace and deletes it afterward.
        /// </summary>
        public async Task<string> RestoreLatestCheckpointAsync()
        {
            try
            {
                // Find latest checkpoint file
                var latestZip = Directory.GetFiles(_checkpointsDir, "*.zip")
                                         .OrderByDescending(File.GetCreationTimeUtc)
                                         .FirstOrDefault();

                if (latestZip == null)
                {
                    _log.LogWarning("No checkpoints found to restore.");
                    return "No checkpoints found to restore.";
                }

                _log.LogInformation($"Restoring checkpoint: {Path.GetRelativePath(_workspaceRoot, latestZip)}");

                // Clean up workspace before restore (optional)
                foreach (var file in EnumerateWorkspaceFiles())
                {
                    File.Delete(file);
                }

                // Extract checkpoint into workspace
                await Task.Run(() =>
                {
                    ZipFile.ExtractToDirectory(latestZip, _workspaceRoot, overwriteFiles: true);
                });

                // Delete the used zip
                File.Delete(latestZip);

                _log.LogInformation("Workspace restored from latest checkpoint and zip deleted.");
                return $"Workspace restored from latest checkpoint and zip deleted.";
            }
            catch (Exception ex)
            {
                _log.LogError("Failed to restore checkpoint.");
                return "Failed to restore checkpoint.";
            }
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

        public bool FileExists(string relativePath)
        {
            var full = Resolve(relativePath);
            return File.Exists(full);
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
            _log.LogInformation("Saved file {File}", Path.GetRelativePath(_workspaceRoot, full));
        }

        public void DeleteFile(string relativePath)
        {
            var full = Resolve(relativePath);
            if (File.Exists(full)) File.Delete(full);
            _log.LogInformation("Deleted file {File}", Path.GetRelativePath(_workspaceRoot, full));
        }
    }
}
