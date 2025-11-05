using InternalLLMBasedInspectionTool.Application.Analysis;
using InternalLLMBasedInspectionTool.WebApi.Mappers.Analysis;
using InternalLLMBasedInspectionTool.WebApi.Models.Analysis;
using Microsoft.AspNetCore.Mvc;

namespace InternalLLMBasedInspectionTool.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalysisController(
    IAnalysisService analysisService
) : ControllerBase {
    [HttpGet("attachment/{attachmentId}")]
    public async Task<AnalysisModel?> GetByAttachmentId(Guid attachmentId) {
        var analyse = await analysisService.GetByAttachmentIdAsync(attachmentId);
        return analyse != null ? AnalysisMapper.Map(analyse) : null;
    }

    [HttpDelete("attachment/{attachmentId}")]
    public Task DeleteByAttachmentId(Guid attachmentId) {
        return analysisService.DeleteByAttachmentIdAsync(attachmentId);
    }
}

