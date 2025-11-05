using InternalLLMBasedInspectionTool.WebApi.Models.Analysis;

namespace InternalLLMBasedInspectionTool.WebApi.Mappers.Analysis;

public static class MarkIssuesAsFixedRequestMapper {
    public static (Guid attachmentId, List<int> issueIndices) Map(MarkIssuesAsFixedRequestModel requestModel) {
        return (requestModel.AttachmentId, requestModel.IssueIndices);
    }
}

