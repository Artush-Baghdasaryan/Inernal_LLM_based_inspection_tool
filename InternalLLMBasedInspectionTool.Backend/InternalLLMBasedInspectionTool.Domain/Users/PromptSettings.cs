namespace InternalLLMBasedInspectionTool.Domain.Users;

public class PromptSettings {
    public required bool CheckReadability { get; set; }
    public required bool CheckPerformance { get; set; }
    public required bool CheckCorrectness { get; set; }
    public required bool CheckStyle { get; set; }
    public required bool CheckMaintainability { get; set; }
    public required bool CheckSecurity { get; set; }
    public required bool DetectLargeExpressions { get; set; }
    public required bool DetectNestedConditions { get; set; }
    public required bool EvaluateMemoryAllocations { get; set; }
    public required double MinConfidenceThreshold { get; set; } // 0.0 - 1.0
    public required double DeterminismLevel { get; set; } // 0.0 - 1.0

    public static PromptSettings CreateDefault() {
        return new PromptSettings {
            CheckReadability = true,
            CheckPerformance = true,
            CheckCorrectness = true,
            CheckStyle = true,
            CheckMaintainability = true,
            CheckSecurity = true,
            DetectLargeExpressions = true,
            DetectNestedConditions = true,
            EvaluateMemoryAllocations = true,
            MinConfidenceThreshold = 0.5,
            DeterminismLevel = 1.0,
        };
    }
}