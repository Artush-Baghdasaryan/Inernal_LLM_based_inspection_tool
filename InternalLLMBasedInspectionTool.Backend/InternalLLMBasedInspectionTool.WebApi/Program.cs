using InternalLLMBasedInspectionTool.Application.Analysis;
using InternalLLMBasedInspectionTool.Application.CodeAttachments;
using InternalLLMBasedInspectionTool.Application.Users;
using InternalLLMBasedInspectionTool.Domain.Analysis;
using InternalLLMBasedInspectionTool.Domain.CodeAttachments;
using InternalLLMBasedInspectionTool.Domain.Common.Security;
using InternalLLMBasedInspectionTool.Domain.Users;
using InternalLLMBasedInspectionTool.Infrastructure.Common;
using InternalLLMBasedInspectionTool.Infrastructure.MongoDb;
using InternalLLMBasedInspectionTool.Infrastructure.Repositories;
using InternalLLMBasedInspectionTool.Infrastructure.Security;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

#region Infrastructure
builder.Services.Configure<DatabaseOptions>(
    builder.Configuration.GetSection("DatabaseOptions"));

builder.Services.AddScoped<MongoDbDataContext>();

builder.Services.AddScoped<IDataEncryptionService, DataEncryptionService>();

builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<IAnalysisRepository, AnalysisRepository>();
builder.Services.AddScoped<ICodeAttachmentsRepository, CodeAttachmentsRepository>();

MongoDbDataContext.ConfigureData();
#endregion

#region Application
builder.Services.AddScoped<IUsersService, UsersService>();
builder.Services.AddScoped<IAnalysisService, AnalysisService>();
builder.Services.AddScoped<ICodeAttachmentsService, CodeAttachmentsService>();
#endregion

var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
