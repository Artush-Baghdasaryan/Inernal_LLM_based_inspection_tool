using InternalLLMBasedInspectionTool.Domain.Common.Models;

namespace InternalLLMBasedInspectionTool.Domain.Analysis;

public class Analyse : AuditableEntity {
    public Analyse() {
        GenerateId();
    }

    public Guid AttachmentId { get; set; }
    public List<Issue> Issues { get; set; } = [];
}