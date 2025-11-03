using System.Diagnostics.CodeAnalysis;
using InternalLLMBasedInspectionTool.Domain.CodeAttachments;
using InternalLLMBasedInspectionTool.WebApi.Models.CodeAttachments;

namespace InternalLLMBasedInspectionTool.WebApi.Mappers.CodeAttachments;

public static class CodeAttachmentMetadataMapper {
    [return: NotNullIfNotNull("codeAttachment")]
    public static CodeAttachmentMetadataModel? Map(CodeAttachment? codeAttachment) {
        if (codeAttachment == null) {
            return null;
        }

        return new CodeAttachmentMetadataModel {
            Id = codeAttachment.Id.ToString(),
            UserId = codeAttachment.UserId,
            Name = codeAttachment.Name,
            MimeType = codeAttachment.MimeType,
            CodeLanguage = codeAttachment.CodeLanguage
        };
    }
}

