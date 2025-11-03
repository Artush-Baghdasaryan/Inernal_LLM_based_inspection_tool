using InternalLLMBasedInspectionTool.Domain.CodeAttachments;

namespace InternalLLMBasedInspectionTool.WebApi.Models.CodeAttachments;

public record SaveCodeAttachmentRequestModel {
    public required Guid UserId { get; init; }
    public required string Name { get; init; }
    public required string MimeType { get; init; }
    public required CodeLanguage CodeLanguage { get; init; }
    public required string OriginalData { get; init; }
    public required string EditedData { get; init; }
    public required string DiffData { get; init; }
}