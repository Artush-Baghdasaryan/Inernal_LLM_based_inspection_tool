namespace InternalLLMBasedInspectionTool.Domain.Common.Models;

public class AuditableEntity : Entity {
    public Audit Audit { get; set; } = new();
}
