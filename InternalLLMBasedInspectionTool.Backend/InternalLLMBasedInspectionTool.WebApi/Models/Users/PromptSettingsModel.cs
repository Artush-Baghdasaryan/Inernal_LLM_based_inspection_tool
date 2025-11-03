namespace InternalLLMBasedInspectionTool.WebApi.Models.Users;

public record PromptSettingsModel {
    public required bool CheckReadability { get; init; }
    public required bool CheckPerformance { get; init; }
    public required bool CheckCorrectness { get; init; }
    public required bool CheckStyle { get; init; }
    public required bool CheckMaintainability { get; init; }
    public required bool CheckSecurity { get; init; }
    public required bool DetectLargeExpressions { get; init; }
    public required bool DetectNestedConditions { get; init; }
    public required bool EvaluateMemoryAllocations { get; init; }
    public required double MinConfidenceThreshold { get; init; }
    public required double DeterminismLevel { get; init; }
}