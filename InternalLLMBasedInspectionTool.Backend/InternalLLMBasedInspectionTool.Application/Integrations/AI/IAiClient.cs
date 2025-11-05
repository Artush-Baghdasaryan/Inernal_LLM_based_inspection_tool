using InternalLLMBasedInspectionTool.Application.Integrations.AI.Models.Requests;
using InternalLLMBasedInspectionTool.Application.Integrations.AI.Models.Results;

namespace InternalLLMBasedInspectionTool.Application.Integrations.AI;

public interface IAiClient {
    Task<AnalyseCodeResult> AnalyseCodeAsync(AnalyseCodeRequest request);
    Task<FixCodeResult> FixCodeAsync(AiServiceFixCodeRequest request);
}