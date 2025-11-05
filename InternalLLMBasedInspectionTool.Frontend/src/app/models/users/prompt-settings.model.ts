export interface PromptSettings {
    checkReadability: boolean;
    checkPerformance: boolean;
    checkCorrectness: boolean;
    checkStyle: boolean;
    checkMaintainability: boolean;
    checkSecurity: boolean;
    detectLargeExpressions: boolean;
    detectNestedConditions: boolean;
    evaluateMemoryAllocations: boolean;
    minConfidenceThreshold: number;
    determinismLevel: number;
}
