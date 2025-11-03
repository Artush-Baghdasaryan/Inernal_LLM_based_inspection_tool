using InternalLLMBasedInspectionTool.Application.CodeAttachments;
using InternalLLMBasedInspectionTool.Domain.Common.Security;
using InternalLLMBasedInspectionTool.WebApi.Mappers.CodeAttachments;
using InternalLLMBasedInspectionTool.WebApi.Models.CodeAttachments;
using Microsoft.AspNetCore.Mvc;

namespace InternalLLMBasedInspectionTool.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CodeAttachmentsController(
    ICodeAttachmentsService codeAttachmentsService,
    IDataEncryptionService encryptionService
) : ControllerBase {
    [HttpGet("metadata/{userId}")]
    public async Task<List<CodeAttachmentMetadataModel>> GetMetadataByUserId(Guid userId) {
        var codeAttachments = await codeAttachmentsService.GetMetadataByUserIdAsync(userId);
        return codeAttachments.Select(x => CodeAttachmentMetadataMapper.Map(x)).ToList();
    }

    [HttpGet("{id}")]
    public async Task<CodeAttachmentModel> GetById(Guid id) {
        var codeAttachment = await codeAttachmentsService.GetByIdAsync(id);
        return CodeAttachmentMapper.Map(codeAttachment, encryptionService);
    }

    [HttpPost]
    public async Task<CodeAttachmentModel> Create([FromBody] SaveCodeAttachmentRequestModel requestModel) {
        var request = SaveCodeAttachmentRequestMapper.Map(requestModel);
        var codeAttachment = await codeAttachmentsService.CreateAsync(request);
        return CodeAttachmentMapper.Map(codeAttachment, encryptionService);
    }

    [HttpPut("{id}")]
    public async Task<CodeAttachmentModel> Update(Guid id, [FromBody] SaveCodeAttachmentRequestModel requestModel) {
        var request = SaveCodeAttachmentRequestMapper.Map(requestModel);
        var codeAttachment = await codeAttachmentsService.UpdateAsync(id, request);
        return CodeAttachmentMapper.Map(codeAttachment, encryptionService);
    }

    [HttpDelete("{id}")]
    public Task Delete(Guid id) {
        return codeAttachmentsService.DeleteAsync(id);
    }
}