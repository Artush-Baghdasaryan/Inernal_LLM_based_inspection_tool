using InternalLLMBasedInspectionTool.Application.CodeAttachments.Results;
using InternalLLMBasedInspectionTool.WebApi.Models.CodeAttachments;

namespace InternalLLMBasedInspectionTool.WebApi.Mappers.CodeAttachments;

public static class FixCodeResultMapper {
    public static FixCodeResultModel Map(FixCodeResult result) {
        return new FixCodeResultModel {
            FixedCode = result.FixedCode
        };
    }
}

