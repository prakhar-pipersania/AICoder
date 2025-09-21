using Microsoft.Extensions.Logging; // Assuming standard .NET logging

namespace WebApi.Utilities
{
    public static class Logger
    {
        private static ILogger? _logger;

        public static void Configure(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger("WebApiLogger");
        }

        public static void LogInformation(string message, params object[] args)
        {
            _logger?.LogInformation(message, args);
        }

        public static void LogWarning(string message, params object[] args)
        {
            _logger?.LogWarning(message, args);
        }

        public static void LogError(string message, params object[] args)
        {
            _logger?.LogError(message, args);
        }

        public static void LogCritical(string message, params object[] args)
        {
            _logger?.LogCritical(message, args);
        }

        public static void LogDebug(string message, params object[] args)
        {
            _logger?.LogDebug(message, args);
        }

        public static void LogTrace(string message, params object[] args)
        {
            _logger?.LogTrace(message, args);
        }

        public static void LogError(System.Exception ex, string message, params object[] args)
        {
            _logger?.LogError(ex, message, args);
        }
    }
}