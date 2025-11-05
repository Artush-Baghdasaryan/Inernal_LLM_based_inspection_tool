using System.Text;

namespace InternalLLMBasedInspectionTool.Application.Utils;

public class PromptBuilder {
    private readonly StringBuilder _prompt = new();

    public PromptBuilder() {
        WithSystemPrompt();
    }

    private PromptBuilder WithSystemPrompt() {
        _prompt.AppendLine("Analyze the provided code changes and evaluate their impact on clarity, maintainability, performance, and correctness.");
        _prompt.AppendLine("Focus on the intent behind each modification and identify meaningful improvements or potential issues.");
        _prompt.AppendLine("Provide only actionable insights that enhance quality or prevent regressions - avoid stylistic or trivial suggestions.");
        _prompt.AppendLine("Be objective and consistent so that identical inputs produce identical results.");

        return this;
    }

    public PromptBuilder WithLanguage(string language) {
        _prompt.AppendLine($"\nCode language: {language}");
        _prompt.AppendLine("\nRules: ");

        return this;
    }

    public PromptBuilder WithCheckReadability(bool enabled) {
        if (enabled) {
            _prompt.AppendLine("Evaluate readability, naming clarity, and expression simplicity.");
        }
        return this;
    }

    public PromptBuilder WithCheckPerformance(bool enabled) {
        if (enabled) {
            _prompt.AppendLine("Detect performance issues, iterator overhead, and avoidable allocations.");
        }
        return this;
    }

    public PromptBuilder WithCheckCorrectness(bool enabled) {
        if (enabled) {
            _prompt.AppendLine("Detect potential logical or semantic correctness risks.");
        }
        return this;
    }

    public PromptBuilder WithCheckStyle(bool enabled) {
        if (enabled) {
            _prompt.AppendLine("Check style and conventions when they impact clarity and consistency.");
        }
        return this;
    }

    public PromptBuilder WithCheckMaintainability(bool enabled) {
        if (enabled) {
            _prompt.AppendLine("Flag duplication and hard-to-maintain constructs; prefer clear, cohesive code.");
        }
        return this;
    }

    public PromptBuilder WithCheckSecurity(bool enabled) {
        if (enabled) {
            _prompt.AppendLine("Flag potential security vulnerabilities or best practices violations.");
        }
        return this;
    }

    public PromptBuilder WithDetectLargeExpressions(bool enabled) {
        if (enabled) {
            _prompt.AppendLine("Flag overly large or deeply chained expressions that harm debuggability.");
        }
        return this;
    }

    public PromptBuilder WithDetectNestedConditions(bool enabled) {
        if (enabled) {
            _prompt.AppendLine("Flag nested conditionals or ternary chains when they reduce clarity.");
        }
        return this;
    }

    public PromptBuilder WithEvaluateMemoryAllocations(bool enabled) {
        if (enabled) {
            _prompt.AppendLine("Estimate allocation pressure and flag avoidable materialization (e.g., ToList(), new objects in loops, string concatenation in loops).");
        }
        return this;
    }

    public PromptBuilder WithMinConfidenceThreshold(double threshold) {
        _prompt.AppendLine($"Include only issues with confidence ≥ {threshold:F2}; lower confidence instead of guessing if unsure.");
        return this;
    }

    public PromptBuilder WithDeterminismLevel(double temperature) {
        _prompt.AppendLine($"Target deterministic behavior (temperature ≈ {temperature:F2}). Prefer consistent, reproducible judgments.");
        return this;
    }

    public string Build() {
        return _prompt.ToString();
    }
}