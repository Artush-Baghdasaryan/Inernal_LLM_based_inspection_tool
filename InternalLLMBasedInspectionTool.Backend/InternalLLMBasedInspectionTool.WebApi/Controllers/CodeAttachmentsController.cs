using InternalLLMBasedInspectionTool.Application.CodeAttachments;
using InternalLLMBasedInspectionTool.Application.CodeAttachments.Requests;
using InternalLLMBasedInspectionTool.Domain.Common.Security;
using InternalLLMBasedInspectionTool.WebApi.Mappers.Analysis;
using InternalLLMBasedInspectionTool.WebApi.Mappers.CodeAttachments;
using InternalLLMBasedInspectionTool.WebApi.Models.Analysis;
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

    [HttpGet("{id}/form-prompt")]
    public async Task<FormPromptResultModel> FormPrompt(Guid id, [FromQuery] Guid userId) {
        var result = await codeAttachmentsService.FormPromptAsync(id, userId);
        return FormPromptResultMapper.Map(result);
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

    [HttpPost("{id}/analyse")]
    public async Task<AnalysisModel> Analyse(
        Guid id,
        [FromQuery] Guid userId,
        [FromBody] AnalyseCodeRequestModel requestModel
    ) {
        var analyse = await codeAttachmentsService.AnalyseAsync(userId, id, requestModel.SystemPrompt);
        return AnalysisMapper.Map(analyse);
    }

    [HttpPost("fix-code")]
    public async Task<FixCodeResultModel> FixCode([FromBody] FixCodeRequestModel requestModel) {
        var request = FixCodeRequestMapper.Map(requestModel);
        var result = await codeAttachmentsService.FixCodeAsync(request);
        return FixCodeResultMapper.Map(result);
    }

    [HttpPost("mark-issues-as-fixed")]
    public async Task MarkIssuesAsFixed([FromBody] MarkIssuesAsFixedRequestModel requestModel) {
        await codeAttachmentsService.MarkIssuesAsFixedAsync(requestModel.AttachmentId, requestModel.IssueIndices);
    }
}
