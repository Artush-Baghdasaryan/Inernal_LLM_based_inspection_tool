using InternalLLMBasedInspectionTool.Application.CodeAttachments.Results;
using InternalLLMBasedInspectionTool.WebApi.Models.CodeAttachments;

namespace InternalLLMBasedInspectionTool.WebApi.Mappers.CodeAttachments;

public static class FormPromptResultMapper {
    public static FormPromptResultModel Map(FormPromptResult result) {
        return new FormPromptResultModel {
            SystemPrompt = result.SystemPrompt,
            UserPrompt = result.UserPrompt
        };
    }
}

