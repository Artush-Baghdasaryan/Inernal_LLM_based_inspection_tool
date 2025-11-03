using InternalLLMBasedInspectionTool.Domain.Common.Repositories;

namespace InternalLLMBasedInspectionTool.Domain.Users;

public interface IUsersRepository : IRepository<User> {
    Task<User?> GetUserByNicknameAsync(string nickname);
}