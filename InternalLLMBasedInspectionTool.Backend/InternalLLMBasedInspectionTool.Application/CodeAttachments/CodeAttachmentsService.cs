using InternalLLMBasedInspectionTool.Application.Analysis;
using InternalLLMBasedInspectionTool.Application.CodeAttachments.Requests;
using InternalLLMBasedInspectionTool.Domain.CodeAttachments;
using InternalLLMBasedInspectionTool.Domain.Common.Security;

namespace InternalLLMBasedInspectionTool.Application.CodeAttachments;

public class CodeAttachmentsService(
    ICodeAttachmentsRepository codeAttachmentsRepository,
    IAnalysisService analysisService,
    IDataEncryptionService encryptionService
) : ICodeAttachmentsService {
    public async Task<CodeAttachment> CreateAsync(SaveCodeAttachmentRequest request) {
        var codeAttachment = new CodeAttachment {
            UserId = request.UserId,
            Name = request.Name,
            MimeType = request.MimeType,
            CodeLanguage = request.CodeLanguage,
            OriginalDataHashed = encryptionService.Encrypt(request.OriginalData),
            EditedDataHashed = encryptionService.Encrypt(request.EditedData),
            DiffDataHashed = encryptionService.Encrypt(request.DiffData)
        };

        await codeAttachmentsRepository.InsertAsync(codeAttachment);
        return codeAttachment;
    }

    public async Task DeleteAsync(Guid id) {
        await analysisService.DeleteByAttachmentIdAsync(id);
        await codeAttachmentsRepository.DeleteAsync(id);
    }

    public async Task<List<CodeAttachment>> GetMetadataByUserIdAsync(Guid userId) {
        var attachments = await codeAttachmentsRepository.GetByUserIdAsync(userId);
        var metadata = new List<CodeAttachment>();
        foreach (var attachment in attachments) {
            var meta = new CodeAttachment {
                UserId = attachment.UserId,
                Name = attachment.Name,
                MimeType = attachment.MimeType,
                CodeLanguage = attachment.CodeLanguage,
                OriginalDataHashed = string.Empty,
                EditedDataHashed = string.Empty,
                DiffDataHashed = string.Empty
            };
            meta.SetId(attachment.Id);
            metadata.Add(meta);
        }
        return metadata;
    }

    public async Task<CodeAttachment> GetByIdAsync(Guid id) {
        var attachment = await codeAttachmentsRepository.GetByIdAsync(id);
        if (attachment == null) {
            throw new Exception($"Code attachment with id {id} not found");
        }
        return attachment;
    }

    public async Task<CodeAttachment> UpdateAsync(Guid id, SaveCodeAttachmentRequest request) {
        var codeAttachment = await codeAttachmentsRepository.GetByIdAsync(id);
        if (codeAttachment == null) {
            throw new Exception($"Code attachment with id {id} not found");
        }

        codeAttachment.Name = request.Name;
        codeAttachment.MimeType = request.MimeType;
        codeAttachment.CodeLanguage = request.CodeLanguage;
        codeAttachment.OriginalDataHashed = encryptionService.Encrypt(request.OriginalData);
        codeAttachment.EditedDataHashed = encryptionService.Encrypt(request.EditedData);
        codeAttachment.DiffDataHashed = encryptionService.Encrypt(request.DiffData);

        await codeAttachmentsRepository.UpdateAsync(codeAttachment);
        return codeAttachment;
    }
}
