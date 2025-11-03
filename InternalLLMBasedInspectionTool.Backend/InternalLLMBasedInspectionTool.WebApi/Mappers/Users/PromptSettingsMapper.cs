using InternalLLMBasedInspectionTool.Domain.Users;
using InternalLLMBasedInspectionTool.WebApi.Models.Users;

namespace InternalLLMBasedInspectionTool.WebApi.Mappers.Users;

public static class PromptSettingsMapper {
    public static PromptSettingsModel Map(PromptSettings promptSettings) {
        return new PromptSettingsModel {
            CheckReadability = promptSettings.CheckReadability,
            CheckPerformance = promptSettings.CheckPerformance,
            CheckCorrectness = promptSettings.CheckCorrectness,
            CheckStyle = promptSettings.CheckStyle,
            CheckMaintainability = promptSettings.CheckMaintainability,
            CheckSecurity = promptSettings.CheckSecurity,
            DetectLargeExpressions = promptSettings.DetectLargeExpressions,
            DetectNestedConditions = promptSettings.DetectNestedConditions,
            EvaluateMemoryAllocations = promptSettings.EvaluateMemoryAllocations,
            MinConfidenceThreshold = promptSettings.MinConfidenceThreshold,
            DeterminismLevel = promptSettings.DeterminismLevel,
        };
    }

    public static PromptSettings Map(PromptSettingsModel model) {
        return new PromptSettings {
            CheckReadability = model.CheckReadability,
            CheckPerformance = model.CheckPerformance,
            CheckCorrectness = model.CheckCorrectness,
            CheckStyle = model.CheckStyle,
            CheckMaintainability = model.CheckMaintainability,
            CheckSecurity = model.CheckSecurity,
            DetectLargeExpressions = model.DetectLargeExpressions,
            DetectNestedConditions = model.DetectNestedConditions,
            EvaluateMemoryAllocations = model.EvaluateMemoryAllocations,
            MinConfidenceThreshold = model.MinConfidenceThreshold,
            DeterminismLevel = model.DeterminismLevel,
        };
    }
}