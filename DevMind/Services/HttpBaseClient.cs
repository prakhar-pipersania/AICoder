using Polly;
using Polly.Retry;

public abstract class HttpBaseClient
{
    protected static readonly HttpClient client = new HttpClient() { Timeout = Timeout.InfiniteTimeSpan };
    protected static readonly AsyncRetryPolicy<HttpResponseMessage> retryPolicy = Policy
                        .Handle<Exception>() // Handles all exceptions
                        .OrResult<HttpResponseMessage>(response => !response.IsSuccessStatusCode) // Handles any non-2xx response
                        .WaitAndRetryAsync(
                            retryCount: 3,
                            sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(5, retryAttempt)), // 5s, 25s, 125s
                            onRetryAsync: async (outcome, timespan, retryAttempt, context) =>
                            {
                                Console.WriteLine($"Retry {retryAttempt} in {timespan.TotalSeconds} seconds due to " +
                                    (outcome.Exception != null
                                        ? $"exception: {outcome.Exception.Message}"
                                        : $"status code: {(int)outcome.Result.StatusCode}"));
                            });
}
