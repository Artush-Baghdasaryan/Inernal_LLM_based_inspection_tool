using InternalLLMBasedInspectionTool.Domain.CodeAttachments;

namespace InternalLLMBasedInspectionTool.Application.CodeAttachments.Requests;

public record SaveCodeAttachmentRequest {
    public required Guid UserId { get; init; }
    public required string Name { get; init; }
    public required string MimeType { get; init; }
    public required CodeLanguage CodeLanguage { get; init; }
    public required string OriginalData { get; init; }
    public required string EditedData { get; init; }
    public required string DiffData { get; init; }
}
