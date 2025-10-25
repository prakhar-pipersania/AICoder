namespace DevMind.Interfaces
{
    /// <summary>
    /// Abstraction for file system operations inside a workspace sandbox.
    /// </summary>
    public interface IFileService
    {
        void AddWorkspacePath(string path);
        bool FileExists(string relativePath);
        string ReadFile(string relativePath);
        void SaveFile(string relativePath, string content);
        void DeleteFile(string relativePath);
        string GetFileContext(List<string> files = null);
        Task<string> CreateCheckpointAsync();
        Task<string> RestoreLatestCheckpointAsync();
        List<string> EnumerateWorkspaceFiles();
    }
}
