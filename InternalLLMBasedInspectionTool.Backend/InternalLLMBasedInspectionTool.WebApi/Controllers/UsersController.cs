using InternalLLMBasedInspectionTool.Application.Users;
using InternalLLMBasedInspectionTool.Domain.Users;
using InternalLLMBasedInspectionTool.WebApi.Mappers.Users;
using InternalLLMBasedInspectionTool.WebApi.Models.Users;
using InternalLLMBasedInspectionTool.WebApi.Models.Users.Requests;
using Microsoft.AspNetCore.Mvc;

namespace InternalLLMBasedInspectionTool.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUsersService usersService) : ControllerBase {
    [HttpPost("{nickname}")]
    public async Task<UserModel> Create([FromRoute] string nickname) {
        var user = await usersService.CreateAsync(nickname);
        return UserMapper.Map(user);
    }

    [HttpGet("{nickname}")]
    public async Task<UserModel?> GetByNickname(string nickname) {
        var user = await usersService.GetByNicknameAsync(nickname);
        return UserMapper.Map(user);
    }

    [HttpPut("{id}")]
    public async Task<UserModel> Update(Guid id, [FromBody] SaveUserRequestModel request) {
        var user = await usersService.UpdateAsync(id, SaveUserRequestMapper.Map(request));
        return UserMapper.Map(user);
    }
}
