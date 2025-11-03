using InternalLLMBasedInspectionTool.Application.Users.Requests;
using InternalLLMBasedInspectionTool.WebApi.Models.Users.Requests;

namespace InternalLLMBasedInspectionTool.WebApi.Mappers.Users;

public static class SaveUserRequestMapper {
    public static SaveUserRequest Map(SaveUserRequestModel request) {
        return new SaveUserRequest {
            Nickname = request.Nickname,
            PromptSettings = PromptSettingsMapper.Map(request.PromptSettings),
        };
    }
}