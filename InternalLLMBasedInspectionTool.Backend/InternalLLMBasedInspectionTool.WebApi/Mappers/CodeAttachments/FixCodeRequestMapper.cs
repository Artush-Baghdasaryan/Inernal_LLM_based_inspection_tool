using InternalLLMBasedInspectionTool.Application.CodeAttachments.Requests;
using InternalLLMBasedInspectionTool.WebApi.Models.CodeAttachments;

namespace InternalLLMBasedInspectionTool.WebApi.Mappers.CodeAttachments;

public static class FixCodeRequestMapper {
    public static FixCodeRequest Map(FixCodeRequestModel requestModel) {
        return new FixCodeRequest {
            AttachmentId = requestModel.AttachmentId,
            IssueIndices = requestModel.IssueIndices
        };
    }
}

