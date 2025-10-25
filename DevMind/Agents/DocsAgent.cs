using DevMind.Interfaces;

namespace DevMind.Agents
{
    public class DocsAgent
    {
        private readonly string _agentName = "Docs";
        private readonly string _docsFileName = "README.md";
        private readonly ILLMClient _llm;
        private readonly IFileService _fileService;

        public DocsAgent(ILLMClient llm, IFileService fileService)
        {
            _llm = llm;
            _fileService = fileService;
        }

        public async Task<string> LoadDocumentationAsync(string fileContext, CancellationToken ct = default)
        {
            string newDoc = string.Empty;
            string doc = _fileService.ReadFile(_docsFileName);
            bool docsExists = !string.IsNullOrWhiteSpace(doc);
            if (docsExists)
            {
                return doc;
            }
            if (!string.IsNullOrWhiteSpace(fileContext))
            {
                newDoc = await _llm.ExecutePromptAsync(_agentName, $"CONTEXT:\n {fileContext}", ct);
                _fileService.SaveFile(_docsFileName, newDoc);
            }
            return newDoc;
        }

        public bool DocumentationExistsAsync()
        {
            return _fileService.FileExists(_docsFileName);
        }

        public async Task<string> GenerateReadmeAsync(string requirements, string docs, string planjson, string fileContext, CancellationToken ct = default)
        {
            string newDoc = await _llm.ExecutePromptAsync(_agentName, $"CONTEXT:\n {fileContext} REQUIREMENTS:\n{requirements} OLD DOCUMENTATION:\n {docs} PLAN JSON:\n {planjson}", ct);
            return newDoc;
        }
    }
}
