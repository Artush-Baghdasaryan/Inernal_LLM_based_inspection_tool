using InternalLLMBasedInspectionTool.Domain.Common.Models;

namespace InternalLLMBasedInspectionTool.Domain.CodeAttachments;

public class CodeAttachment : AuditableEntity {
    public CodeAttachment() {
        GenerateId();
    }
    
    public required Guid UserId { get; set; }
    public required string Name { get; set; }
    public required string MimeType { get; set; }
    public required CodeLanguage CodeLanguage { get; set; }
    public required string OriginalDataHashed { get; set; }
    public required string EditedDataHashed { get; set; }
    public required string DiffDataHashed { get; set; }
}