using InternalLLMBasedInspectionTool.Application.CodeAttachments.Requests;
using InternalLLMBasedInspectionTool.WebApi.Models.CodeAttachments;

namespace InternalLLMBasedInspectionTool.WebApi.Mappers.CodeAttachments;

public static class SaveCodeAttachmentRequestMapper {
    public static SaveCodeAttachmentRequest Map(SaveCodeAttachmentRequestModel requestModel) {
        return new SaveCodeAttachmentRequest {
            UserId = requestModel.UserId,
            Name = requestModel.Name,
            MimeType = requestModel.MimeType,
            CodeLanguage = requestModel.CodeLanguage,
            OriginalData = requestModel.OriginalData,
            EditedData = requestModel.EditedData,
            DiffHunks = requestModel.DiffHunks
        };
    }
}