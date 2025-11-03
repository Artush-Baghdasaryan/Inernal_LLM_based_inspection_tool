namespace InternalLLMBasedInspectionTool.WebApi.Models.Users;

public record UserModel {
    public required string Id { get; init; }
    public required string Nickname { get; init; }
    public required PromptSettingsModel PromptSettings { get; init; }
}