using InternalLLMBasedInspectionTool.Domain.CodeAttachments;

namespace InternalLLMBasedInspectionTool.WebApi.Models.CodeAttachments;

public record CodeAttachmentMetadataModel {
    public required string Id { get; init; }
    public required Guid UserId { get; init; }
    public required string Name { get; init; }
    public required string MimeType { get; init; }
    public required CodeLanguage CodeLanguage { get; init; }
}

