using System.Diagnostics.CodeAnalysis;
using InternalLLMBasedInspectionTool.Domain.Users;
using InternalLLMBasedInspectionTool.WebApi.Models.Users;

namespace InternalLLMBasedInspectionTool.WebApi.Mappers.Users;

public static class UserMapper {
    [return: NotNullIfNotNull("user")]
    public static UserModel? Map(User? user) {
        if (user == null) {
            return null;
        }

        return new UserModel {
            Id = user.Id.ToString(),
            Nickname = user.Nickname,
            PromptSettings = PromptSettingsMapper.Map(user.PromptSettings),
        };
    }
}