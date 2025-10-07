namespace DevMind.Interfaces
{
    /// <summary>
    /// Abstraction for file system operations inside a workspace sandbox.
    /// </summary>
    public interface IFileService
    {
        string ReadFile(string relativePath);
        void SaveFile(string relativePath, string content);
        void DeleteFile(string relativePath);
        string GetFileContext(List<string> files = null);
        List<string> EnumerateWorkspaceFiles();
        string WorkspaceRoot { get; }
    }
}
