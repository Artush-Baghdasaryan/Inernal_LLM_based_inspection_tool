using InternalLLMBasedInspectionTool.Domain.Common.Repositories;
using InternalLLMBasedInspectionTool.Domain.Users;
using InternalLLMBasedInspectionTool.Infrastructure.Common;
using InternalLLMBasedInspectionTool.Infrastructure.MongoDb;

namespace InternalLLMBasedInspectionTool.Infrastructure.Repositories;

public class UsersRepository : DataRepository<User>, IUsersRepository {
    public UsersRepository(MongoDbDataContext context) : base(context, "users") {
    }

    public Task<User?> GetUserByNicknameAsync(string nickname) {
        return FindOneAsync(u => u.Nickname == nickname);
    }
}

