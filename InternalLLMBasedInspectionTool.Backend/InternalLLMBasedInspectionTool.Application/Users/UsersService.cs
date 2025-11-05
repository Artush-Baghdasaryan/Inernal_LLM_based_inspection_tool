using InternalLLMBasedInspectionTool.Application.Users.Requests;
using InternalLLMBasedInspectionTool.Domain.Users;

namespace InternalLLMBasedInspectionTool.Application.Users;

public class UsersService(IUsersRepository usersRepository) : IUsersService {
    public async Task<User> CreateAsync(string nickname) {
        var existingUser = await usersRepository.GetUserByNicknameAsync(nickname);
        if (existingUser != null) {
            return existingUser;
        }

        var user = User.Create(nickname);
        await usersRepository.InsertAsync(user);
        return user;
    }

    public Task<User?> GetByNicknameAsync(string nickname) {
        return usersRepository.GetUserByNicknameAsync(nickname);
    }

    public async Task<User> RequireByIdAsync(Guid id) {
        return await usersRepository.GetByIdAsync(id) ??
            throw new Exception($"User with id {id} not found");
    }

    public async Task<User> UpdateAsync(Guid id, SaveUserRequest request) {
        var user = await RequireByIdAsync(id);

        user.Nickname = request.Nickname;
        user.PromptSettings = request.PromptSettings;
        await usersRepository.UpdateAsync(user);

        return user;
    }
}
