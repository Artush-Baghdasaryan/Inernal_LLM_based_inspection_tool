using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using InternalLLMBasedInspectionTool.Application.Integrations.AI.Models;
using InternalLLMBasedInspectionTool.Application.Integrations.AI.Models.Requests;
using InternalLLMBasedInspectionTool.Application.Integrations.AI.Models.Results;
using Microsoft.Extensions.Options;

namespace InternalLLMBasedInspectionTool.Application.Integrations.AI;

public class LowerCaseJsonStringEnumConverter : JsonConverterFactory {
    public override bool CanConvert(Type typeToConvert) {
        return typeToConvert.IsEnum;
    }

    public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options) {
        var converterType = typeof(LowerCaseJsonStringEnumConverter<>).MakeGenericType(typeToConvert);
        return (JsonConverter)Activator.CreateInstance(converterType)!;
    }
}

public class LowerCaseJsonStringEnumConverter<T> : JsonConverter<T> where T : struct, Enum {
    public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
        var value = reader.GetString();
        if (string.IsNullOrEmpty(value)) {
            throw new JsonException($"Cannot convert empty string to {typeof(T).Name}");
        }
        
        // Try to parse as lowercase
        if (Enum.TryParse<T>(value, true, out var result)) {
            return result;
        }
        
        throw new JsonException($"Cannot convert '{value}' to {typeof(T).Name}");
    }

    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options) {
        // Convert enum to lowercase string
        var enumName = value.ToString();
        var lowerCaseName = enumName.ToLowerInvariant();
        writer.WriteStringValue(lowerCaseName);
    }
}

public class AiClient(IOptions<AiServiceOptions> aiServiceOptions) : IAiClient {
    private readonly string aiServiceBaseUrl = aiServiceOptions.Value.BaseUrl;

    public async Task<AnalyseCodeResult> AnalyseCodeAsync(AnalyseCodeRequest request) {
        using var httpClient = new HttpClient();

        var url = $"{aiServiceBaseUrl}/analyse-code";
        var message = new HttpRequestMessage(HttpMethod.Post, url);
        message.Content = GetStringContent(request);

        var response = await httpClient.SendAsync(message);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        if (string.IsNullOrEmpty(json)) {
            throw new Exception("Failed to analyse code");
        }

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false) }
        };

        var result = JsonSerializer.Deserialize<AnalyseCodeResult>(json, jsonOptions);

        return result ?? throw new Exception("Faild to deserialize analyse code result");
    }

    public async Task<FixCodeResult> FixCodeAsync(Models.Requests.AiServiceFixCodeRequest request) {
        using var httpClient = new HttpClient();

        var url = $"{aiServiceBaseUrl}/fix-code";
        var message = new HttpRequestMessage(HttpMethod.Post, url);
        message.Content = GetStringContent(request);

        var response = await httpClient.SendAsync(message);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        if (string.IsNullOrEmpty(json)) {
            throw new Exception("Failed to fix code");
        }

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false) }
        };

        var result = JsonSerializer.Deserialize<FixCodeResult>(json, jsonOptions);

        return result ?? throw new Exception("Failed to deserialize fix code result");
    }

    private StringContent GetStringContent(object obj) {
        var jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = false,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            PropertyNamingPolicy = null,
            Converters = { new LowerCaseJsonStringEnumConverter() }
        };

        return new StringContent(
            JsonSerializer.Serialize(obj, jsonOptions),
            Encoding.UTF8,
            "application/json"
        );
    }
}