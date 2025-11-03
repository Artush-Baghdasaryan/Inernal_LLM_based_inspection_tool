using InternalLLMBasedInspectionTool.Domain.Users;

namespace InternalLLMBasedInspectionTool.Application.Users.Requests;

public record SaveUserRequest {
    public required string Nickname { get; init; }
    public required PromptSettings PromptSettings { get; init; }
}