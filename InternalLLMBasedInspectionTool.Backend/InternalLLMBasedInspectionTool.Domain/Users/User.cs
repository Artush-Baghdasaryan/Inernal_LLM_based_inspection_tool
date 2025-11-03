using System.Runtime.InteropServices;
using InternalLLMBasedInspectionTool.Domain.Common.Models;

namespace InternalLLMBasedInspectionTool.Domain.Users;

public class User : AuditableEntity {
    public required string Nickname { get; set; }
    public required PromptSettings PromptSettings { get; set; }

    public User() {
        GenerateId();
    }

    public static User Create(string nickname) {
        var user = new User {
            Nickname = nickname,
            PromptSettings = PromptSettings.CreateDefault(),
        };

        return user;
    }
}
