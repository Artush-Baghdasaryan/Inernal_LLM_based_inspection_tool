using InternalLLMBasedInspectionTool.Application.Analysis;
using InternalLLMBasedInspectionTool.Application.Analysis.Requests;
using InternalLLMBasedInspectionTool.Application.CodeAttachments.Requests;
using InternalLLMBasedInspectionTool.Application.CodeAttachments.Results;
using InternalLLMBasedInspectionTool.Application.Integrations.AI;
using InternalLLMBasedInspectionTool.Application.Integrations.AI.Mappers;
using InternalLLMBasedInspectionTool.Application.Integrations.AI.Models;
using AiServiceRequests = InternalLLMBasedInspectionTool.Application.Integrations.AI.Models.Requests;
using InternalLLMBasedInspectionTool.Application.Users;
using InternalLLMBasedInspectionTool.Application.Utils;
using InternalLLMBasedInspectionTool.Domain.Analysis;
using InternalLLMBasedInspectionTool.Domain.CodeAttachments;
using InternalLLMBasedInspectionTool.Domain.Common.Security;
using InternalLLMBasedInspectionTool.Application.Integrations.AI.Models.Requests;

namespace InternalLLMBasedInspectionTool.Application.CodeAttachments;

public class CodeAttachmentsService(
    ICodeAttachmentsRepository codeAttachmentsRepository,
    IAnalysisService analysisService,
    IDataEncryptionService encryptionService,
    IUsersService usersService,
    IAiClient aiClient
) : ICodeAttachmentsService {
    public async Task<CodeAttachment> CreateAsync(SaveCodeAttachmentRequest request) {
        var codeAttachment = new CodeAttachment {
            UserId = request.UserId,
            Name = request.Name,
            MimeType = request.MimeType,
            CodeLanguage = request.CodeLanguage,
            OriginalDataHashed = encryptionService.Encrypt(request.OriginalData),
            EditedDataHashed = encryptionService.Encrypt(request.EditedData),
            DiffHunks = new List<string>()
        };

        await codeAttachmentsRepository.InsertAsync(codeAttachment);
        return codeAttachment;
    }

    public async Task DeleteAsync(Guid id) {
        var analyse = await analysisService.GetByAttachmentIdAsync(id);
        if (analyse != null) {
            await analysisService.DeleteAsync(analyse.Id);
        }
        await codeAttachmentsRepository.DeleteAsync(id);
    }

    public async Task<List<CodeAttachment>> GetMetadataByUserIdAsync(Guid userId) {
        var attachments = await codeAttachmentsRepository.GetByUserIdAsync(userId);
        var metadata = new List<CodeAttachment>();
        foreach (var attachment in attachments) {
            var meta = new CodeAttachment {
                UserId = attachment.UserId,
                Name = attachment.Name,
                MimeType = attachment.MimeType,
                CodeLanguage = attachment.CodeLanguage,
                OriginalDataHashed = string.Empty,
                EditedDataHashed = string.Empty,
                DiffHunks = new List<string>()
            };
            meta.SetId(attachment.Id);
            metadata.Add(meta);
        }
        return metadata;
    }

    public async Task<CodeAttachment> GetByIdAsync(Guid id) {
        var attachment = await codeAttachmentsRepository.GetByIdAsync(id);
        if (attachment == null) {
            throw new Exception($"Code attachment with id {id} not found");
        }
        return attachment;
    }

    public async Task<CodeAttachment> UpdateAsync(Guid id, SaveCodeAttachmentRequest request) {
        var codeAttachment = await codeAttachmentsRepository.GetByIdAsync(id);
        if (codeAttachment == null) {
            throw new Exception($"Code attachment with id {id} not found");
        }

        codeAttachment.Name = request.Name;
        codeAttachment.MimeType = request.MimeType;
        codeAttachment.CodeLanguage = request.CodeLanguage;
        codeAttachment.EditedDataHashed = encryptionService.Encrypt(request.EditedData);
        codeAttachment.DiffHunks = request.DiffHunks;

        await codeAttachmentsRepository.UpdateAsync(codeAttachment);
        return codeAttachment;
    }

    public async Task<FormPromptResult> FormPromptAsync(Guid id, Guid userId) {
        var user = await usersService.RequireByIdAsync(userId);
        var attachment = await GetByIdAsync(id);

        var systemPrompt = new PromptBuilder()
            .WithLanguage(attachment.CodeLanguage.ToString())
            .WithCheckReadability(user.PromptSettings.CheckReadability)
            .WithCheckPerformance(user.PromptSettings.CheckPerformance)
            .WithCheckCorrectness(user.PromptSettings.CheckCorrectness)
            .WithCheckStyle(user.PromptSettings.CheckStyle)
            .WithCheckMaintainability(user.PromptSettings.CheckMaintainability)
            .WithCheckSecurity(user.PromptSettings.CheckSecurity)
            .WithDetectLargeExpressions(user.PromptSettings.DetectLargeExpressions)
            .WithDetectNestedConditions(user.PromptSettings.DetectNestedConditions)
            .WithEvaluateMemoryAllocations(user.PromptSettings.EvaluateMemoryAllocations)
            .WithMinConfidenceThreshold(user.PromptSettings.MinConfidenceThreshold)
            .WithDeterminismLevel(user.PromptSettings.Temperature)
            .Build();

        var userPrompt = string.Join("\n", attachment.DiffHunks);

        return new FormPromptResult {
            SystemPrompt = systemPrompt,
            UserPrompt = userPrompt
        };
    }

    public async Task<Analyse> AnalyseAsync(Guid userId, Guid attachmentId, string systemPrompt) {
        var user = await usersService.RequireByIdAsync(userId);
        var attachment = await GetByIdAsync(attachmentId);

        var request = new AiServiceRequests.AnalyseCodeRequest {
            SystemPrompt = systemPrompt,
            DiffHunks = attachment.DiffHunks,
            Temperature = user.PromptSettings.Temperature
        };

        var result = await aiClient.AnalyseCodeAsync(request);
        var saveAnalyseRequest = new SaveAnalyseRequest {
            AttachmentId = attachmentId,
            Issues = result.Issues.Select(a => AiIssueModelMapper.Map(a)).ToList(),
        };

        var analyse = new Analyse {
            AttachmentId = attachmentId,
            Issues = saveAnalyseRequest.Issues
        };

        await analysisService.DeleteByAttachmentIdAsync(attachmentId);
        await analysisService.CreateAsync(saveAnalyseRequest);

        return analyse;
    }

    public async Task<FixCodeResult> FixCodeAsync(FixCodeRequest request) {
        var attachment = await codeAttachmentsRepository.GetByIdAsync(request.AttachmentId);
        if (attachment == null) {
            throw new Exception($"Code attachment with id {request.AttachmentId} not found");
        }

        var analysis = await analysisService.GetByAttachmentIdAsync(request.AttachmentId);
        if (analysis == null) {
            throw new Exception($"Analysis for attachment {request.AttachmentId} not found");
        }

        var selectedIssues = new List<Issue>();
        foreach (var index in request.IssueIndices) {
            if (index >= 0 && index < analysis.Issues.Count) {
                selectedIssues.Add(analysis.Issues[index]);
            }
        }

        if (selectedIssues.Count == 0) {
            throw new Exception("No valid issues selected for fixing");
        }

        var aiIssues = selectedIssues.Select(issue => new AiServiceIssueModel {
            Title = issue.Title,
            Description = issue.Description,
            Level = issue.Level,
            Severity = issue.Severity,
            Category = issue.Category,
            Confidence = issue.Confidence,
            StartLine = issue.StartLine,
            EndLine = issue.EndLine,
            CodeHint = issue.CodeHint
        }).ToList();

        var aiServiceFixCodeRequest = new AiServiceFixCodeRequest {
            EditedDataHashed = attachment.EditedDataHashed,
            Issues = aiIssues,
            CodeLanguage = attachment.CodeLanguage.ToString()
        };

        var fixCodeResult = await aiClient.FixCodeAsync(aiServiceFixCodeRequest);
        return new FixCodeResult {
            FixedCode = fixCodeResult.FixedCode
        };
    }

    public async Task MarkIssuesAsFixedAsync(Guid attachmentId, List<int> issueIndices) {
        await analysisService.MarkIssuesAsFixedAsync(attachmentId, issueIndices);
    }
}
