namespace AICoder.Services
{
    public class FileOps
    {
        private readonly string workspace = "workspace";

        public FileOps()
        {
            Directory.CreateDirectory(workspace);
        }

        public void SaveFile(string path, string content)
        {
            string fullPath = path.StartsWith(workspace) ? path : Path.Combine(workspace, path);
            Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
            File.WriteAllText(fullPath, content);
        }

        public string ReadFile(string path)
        {
            string fullPath = path.StartsWith(workspace)? path : Path.Combine(workspace, path);
            return File.Exists(fullPath) ? File.ReadAllText(fullPath) : "";
        }

        public void DeleteFile(string path)
        {
            string fullPath = path.StartsWith(workspace) ? path : Path.Combine(workspace, path);
            if(File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
    }
}
