using InternalLLMBasedInspectionTool.Application.Users.Requests;
using InternalLLMBasedInspectionTool.Domain.Users;

namespace InternalLLMBasedInspectionTool.Application.Users;

public interface IUsersService {
    Task<User> CreateAsync(string nickname);
    Task<User> RequireByIdAsync(Guid id);
    Task<User?> GetByNicknameAsync(string nickname);
    Task<User> UpdateAsync(Guid id, SaveUserRequest request);
}