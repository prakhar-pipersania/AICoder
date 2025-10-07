using Newtonsoft.Json;

namespace DevMind.Services
{
    public static class Utility
    {
        public static T Sanitize<T>(this string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return default;
            int first = raw.IndexOf('{');
            int last = raw.LastIndexOf('}');
            if (first == -1 || last == -1 || last <= first) return default;
            var sanitized = raw.Substring(first, last - first + 1);
            try
            {
                var resp = JsonConvert.DeserializeObject<T>(sanitized);
                return resp;
            }
            catch 
            {
                return default;
            }
        }

        public static string ToStr<T>(this T obj)
        {
            return JsonConvert.SerializeObject(obj);
        }
    }
}
