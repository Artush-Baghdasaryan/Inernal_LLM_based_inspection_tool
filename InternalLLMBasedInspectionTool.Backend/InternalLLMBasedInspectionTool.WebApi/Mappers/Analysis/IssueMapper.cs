using InternalLLMBasedInspectionTool.Domain.Analysis;
using InternalLLMBasedInspectionTool.WebApi.Models.Analysis;

namespace InternalLLMBasedInspectionTool.WebApi.Mappers.Analysis;

public static class IssueMapper {
    public static IssueModel Map(Issue issue) {
        return new IssueModel {
            Title = issue.Title,
            Description = issue.Description,
            Level = issue.Level,
            Severity = issue.Severity,
            Category = issue.Category,
            Confidence = issue.Confidence,
            StartLine = issue.StartLine,
            EndLine = issue.EndLine,
            CodeHint = issue.CodeHint,
            IsFixed = issue.IsFixed
        };
    }

    public static List<IssueModel> Map(List<Issue> issues) {
        return issues.Select(Map).ToList();
    }
}

