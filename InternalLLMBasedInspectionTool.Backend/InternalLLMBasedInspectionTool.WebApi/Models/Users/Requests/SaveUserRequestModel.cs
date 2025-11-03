namespace InternalLLMBasedInspectionTool.WebApi.Models.Users.Requests;

public record SaveUserRequestModel {
    public required string Nickname { get; init; }
    public required PromptSettingsModel PromptSettings { get; init; }
}