using System.Diagnostics.CodeAnalysis;
using InternalLLMBasedInspectionTool.Domain.CodeAttachments;
using InternalLLMBasedInspectionTool.Domain.Common.Security;
using InternalLLMBasedInspectionTool.WebApi.Models.CodeAttachments;

namespace InternalLLMBasedInspectionTool.WebApi.Mappers.CodeAttachments;

public static class CodeAttachmentMapper {
    [return: NotNullIfNotNull("codeAttachment")]
    public static CodeAttachmentModel? Map(CodeAttachment? codeAttachment, IDataEncryptionService encryptionService) {
        if (codeAttachment == null) {
            return null;
        }

        return new CodeAttachmentModel {
            Id = codeAttachment.Id.ToString(),
            UserId = codeAttachment.UserId,
            Name = codeAttachment.Name,
            MimeType = codeAttachment.MimeType,
            CodeLanguage = codeAttachment.CodeLanguage,
            OriginalData = encryptionService.Decrypt(codeAttachment.OriginalDataHashed),
            EditedData = encryptionService.Decrypt(codeAttachment.EditedDataHashed)
        };
    }
}