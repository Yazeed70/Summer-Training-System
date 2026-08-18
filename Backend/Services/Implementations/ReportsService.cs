using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using summer_training_app.Common.Constants;
using summer_training_app.Common.Results;
using summer_training_app.Data;
using summer_training_app.DTOs.Reports;
using summer_training_app.Entities.Enums;
using summer_training_app.Entities.Reports;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Services.Implementations
{
    public class ReportsService : IReportsService
    {
        private readonly SummerTrainingDBContext _context;

        public ReportsService(SummerTrainingDBContext context)
        {
            _context = context;
        }

        public async Task<Result<Guid>> CreateReportTemplateAsync(SaveTemplateDto reportDto, int userId)
        {
            var collegeRep = await _context.CollegeRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            var companyRep = await _context.CompanyRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (collegeRep == null && companyRep == null)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You are not authorized as a college or company representative.");
            }
            if(companyRep != null && companyRep.CompanyId != null)
            {
                var company = await _context.Companies.Where(c => c.Id == companyRep.CompanyId && c.IsApproved == true).FirstOrDefaultAsync();
                if(company == null)
                {
                    return Error.Forbidden(ErrorCodes.CompanyIsNotApproved, "The company you represent is not approved.");
                }
            }

            var templateTitle = !string.IsNullOrWhiteSpace(reportDto.TemplateTitle)
                ? reportDto.TemplateTitle
                : (reportDto.Title ?? string.Empty);

            if (string.IsNullOrWhiteSpace(templateTitle))
            {
                return Error.Validation(ErrorCodes.TemplateTitleMissing, "Template title is required.");
            }

            if (reportDto.Questions == null || !reportDto.Questions.Any())
            {
                return Error.Validation(ErrorCodes.TemplateQuestionsMissing, "At least one question is required.");
            }

            var reportTemplate = new ReportTemplate
            {
                Title = templateTitle,
                Description = reportDto.Description,
                IsAvailable = reportDto.IsAvailable,
                RequiresCompanyEvaluation = reportDto.RequiresCompanyEvaluation,
                RequiresCollegeEvaluation = reportDto.RequiresCollegeEvaluation,
                CollegeId = collegeRep?.CollegeId,
                CompanyId = companyRep?.CompanyId,
                CreatedBy = userId,
                DueDate = reportDto.DueDate ?? DateTime.UtcNow.AddDays(7)
            };

            var questions = reportDto.Questions.Select((q, idx) => new ReportQuestion
            {
                QuestionText = q.QuestionText,
                QuestionType = q.QuestionType,
                OptionsPayload = !string.IsNullOrWhiteSpace(q.OptionsPayload)
                    ? q.OptionsPayload
                    : (q.Options != null && q.Options.Any() ? System.Text.Json.JsonSerializer.Serialize(q.Options) : null),
                IsRequired = q.IsRequired,
                OrderPosition = q.Order > 0 ? q.Order : idx + 1,
                ReportTemplate = reportTemplate
            }).ToList();

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    _context.ReportTemplates.Add(reportTemplate);
                    _context.ReportQuestions.AddRange(questions);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });

            return reportTemplate.PublicId;
        }

        public async Task<Result<List<StudentReportSummaryDto>>> GetMyReportsAsync(int userId)
        {
            var student = await _context.StudentProfiles
                .FirstOrDefaultAsync(sp => sp.UserId == userId);

            if (student == null)
            {
                return Error.NotFound(ErrorCodes.UserNotFound, "Student profile not found for this user.");
            }

            var activeTraining = await _context.TrainingRecords
                .Where(tr => tr.StudentId == userId && tr.Status == enTrainingStatus.Active)
                .OrderByDescending(tr => tr.CreatedAt)
                .FirstOrDefaultAsync();

            var availableTemplates = await _context.ReportTemplates
                .Where(t => t.IsAvailable && (t.CollegeId == student.CollegeId || (activeTraining != null && t.CompanyId == activeTraining.CompanyId)))
                .ToListAsync();

            var submittedReports = await _context.StudentReports
                .Include(sr => sr.ReportTemplate)
                .Include(sr => sr.ReportTemplate.Questions)
                .Include(sr => sr.Evaluations)
                .Where(sr => sr.StudentId == student.UserId)
                .ToListAsync();

            var submittedTemplateIds = submittedReports.Select(sr => sr.TemplateId).ToHashSet();

            var pendingTemplates = await _context.ReportTemplates
                .Include(t => t.Questions)
                .Where(t => t.IsAvailable &&
                           !submittedTemplateIds.Contains(t.Id) &&
                           (t.CollegeId == student.CollegeId || (activeTraining != null && t.CompanyId == activeTraining.CompanyId)))
                .ToListAsync();

            var result = new List<StudentReportSummaryDto>();

            foreach (var submission in submittedReports)
            {
                var companyEval = submission.Evaluations.FirstOrDefault(e => e.Phase == enEvaluationPhase.CompanyEvaluation);
                var collegeEval = submission.Evaluations.FirstOrDefault(e => e.Phase == enEvaluationPhase.CollegeEvaluation);

                result.Add(new StudentReportSummaryDto
                {
                    TemplatePublicId = submission.ReportTemplate.PublicId,
                    StudentReportPublicId = submission.PublicId,
                    TemplateTitle = submission.ReportTemplate.Title,
                    Description = submission.ReportTemplate.Description,
                    DueDate = submission.ReportTemplate.DueDate,
                    QuestionsCount = submission.ReportTemplate.Questions.Count,
                    SubmittedAt = submission.SubmissionDate,
                    Status = submission.Status,
                    CompanyScore = companyEval != null ? (enEvaluationScore?)companyEval.Score : null,
                    CompanyFeedback = companyEval?.Comments,
                    CollegeScore = collegeEval != null ? (enEvaluationScore?)collegeEval.Score : null,
                    CollegeFeedback = collegeEval?.Comments
                });
            }

            foreach (var template in pendingTemplates)
            {
                result.Add(new StudentReportSummaryDto
                {
                    TemplatePublicId = template.PublicId,
                    StudentReportPublicId = null,
                    TemplateTitle = template.Title,
                    Description = template.Description,
                    DueDate = template.DueDate,
                    QuestionsCount = template.Questions.Count,
                    SubmittedAt = null,
                    Status = enReportStatus.Draft,
                    CompanyScore = null,
                    CompanyFeedback = null,
                    CollegeScore = null,
                    CollegeFeedback = null
                });
            }

            result = result.OrderBy(r => r.Status != enReportStatus.Draft) 
                           .ThenByDescending(r => r.SubmittedAt)
                           .ToList();

            return result;
        }

        public async Task<Result<Guid>> SubmitReportAsync(SubmitReportDto submissionDto, int userId)
        {
            var student = await _context.StudentProfiles
                .FirstOrDefaultAsync(sp => sp.UserId == userId);

            if (student == null)
            {
                return Error.NotFound(ErrorCodes.UserNotFound, "Student profile not found for this user.");
            }

            var activeTraining = await _context.TrainingRecords
                .Where(tr => tr.StudentId == userId && tr.Status == enTrainingStatus.Active)
                .OrderByDescending(tr => tr.CreatedAt)
                .FirstOrDefaultAsync();

            if (activeTraining == null)
            {
                return Error.Validation(ErrorCodes.TrainingRequestNotFound, "No active training record found for the student.");
            }

            var template = await _context.ReportTemplates
                .FirstOrDefaultAsync(t => t.PublicId == submissionDto.TemplatePublicId && t.IsAvailable &&
                    (t.CollegeId == student.CollegeId || t.CompanyId == activeTraining.CompanyId));

            if (template == null)
            {
                return Error.NotFound(ErrorCodes.TemplateNotFound, "The specified report template does not exist or is not available for you.");
            }

            var alreadySubmitted = await _context.StudentReports
                .AnyAsync(sr => sr.TemplateId == template.Id && sr.StudentId == userId);

            if (alreadySubmitted)
            {
                return Error.Conflict(ErrorCodes.ReportAlreadySubmitted, "You have already submitted a report for this template.");
            }

            enReportStatus initialStatus;
            if (template.RequiresCompanyEvaluation)
            {
                initialStatus = enReportStatus.PendingCompanyReview;
            }
            else if (template.RequiresCollegeEvaluation)
            {
                initialStatus = enReportStatus.PendingCollegeReview;
            }
            else
            {
                initialStatus = enReportStatus.Completed;
            }

            var studentReport = new StudentReport
            {
                StudentId = userId,
                TrainingRecordId = activeTraining.Id,
                TemplateId = template.Id,
                SubmissionDate = DateTime.UtcNow,
                Status = initialStatus
            };

            var answers = submissionDto.Answers.Select(a => new ReportAnswer
            {
                QuestionId = a.QuestionId,
                AnswerValue = !string.IsNullOrWhiteSpace(a.AnswerValue)
                    ? a.AnswerValue
                    : (!string.IsNullOrWhiteSpace(a.AttachmentPath) ? a.AttachmentPath : string.Empty),
                StudentReport = studentReport
            }).ToList();

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    _context.StudentReports.Add(studentReport);
                    _context.ReportAnswers.AddRange(answers);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });

            return studentReport.PublicId;
        }

        public async Task<Result<List<CompanyStudentReportDto>>> GetCompanyReportsAsync(int userId)
        {
            var companyRep = await _context.CompanyRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (companyRep == null)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You are not authorized as a company representative.");
            }

            var reports = await _context.StudentReports
                .Include(sr => sr.StudentProfile)
                .Include(sr => sr.StudentProfile.User)
                .Include(sr => sr.ReportTemplate)
                .Include(sr => sr.TrainingRecord)
                .Include(sr => sr.Evaluations)
                .Where(sr => sr.TrainingRecord.CompanyId == companyRep.CompanyId && sr.SubmissionDate != null)
                .Select(sr => new CompanyStudentReportDto
                {
                    StudentReportPublicId = sr.PublicId,
                    StudentName = sr.StudentProfile.User.Name,
                    ReportTitle = sr.ReportTemplate.Title,
                    SubmissionDate = sr.SubmissionDate,
                    Status = sr.Status,
                    EvaluationScore = sr.Evaluations.Where(e => e.Phase == enEvaluationPhase.CompanyEvaluation).Select(e => (enEvaluationScore?)e.Score).FirstOrDefault(),
                    EvaluationComments = sr.Evaluations.Where(e => e.Phase == enEvaluationPhase.CompanyEvaluation).Select(e => e.Comments).FirstOrDefault(),
                    EvaluatedAt = sr.Evaluations.Where(e => e.Phase == enEvaluationPhase.CompanyEvaluation).Select(e => (DateTime?)e.EvaluationDate).FirstOrDefault()
                })
                .ToListAsync();

            return reports;
        }

        public async Task<Result<List<CollegeReportTemplateDto>>> GetCollegeTemplatesAsync(int userId)
        {
            var rep = await _context.CollegeRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (rep == null)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You are not authorized as a college representative.");
            }

            var reportTemplates = await _context.ReportTemplates
                .Where(t => t.CollegeId == rep.CollegeId)
                .Select(rt => new CollegeReportTemplateDto
                {
                    TemplatePublicId = rt.PublicId,
                    Title = rt.Title,
                    Description = string.IsNullOrEmpty(rt.Description) ? "" : rt.Description,
                    IsAvailable = rt.IsAvailable,
                    RequiresCompanyEvaluation = rt.RequiresCompanyEvaluation,
                    RequiresCollegeEvaluation = rt.RequiresCollegeEvaluation,
                    CreatedAt = rt.CreatedAt,
                    DueDate = rt.DueDate,
                    QuestionsCount = rt.Questions.Count,
                    SubmissionsCount = rt.StudentReports.Count
                })
                .ToListAsync();

            return reportTemplates;
        }

        public async Task<Result<List<CollegeReportTemplateDto>>> GetCompanyTemplatesAsync(int userId)
        {
            var rep = await _context.CompanyRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (rep == null)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You are not authorized as a company representative.");
            }

            var reportTemplates = await _context.ReportTemplates
                .Where(t => t.CompanyId == rep.CompanyId)
                .Select(rt => new CollegeReportTemplateDto
                {
                    TemplatePublicId = rt.PublicId,
                    Title = rt.Title,
                    Description = string.IsNullOrEmpty(rt.Description) ? "" : rt.Description,
                    IsAvailable = rt.IsAvailable,
                    RequiresCompanyEvaluation = rt.RequiresCompanyEvaluation,
                    RequiresCollegeEvaluation = rt.RequiresCollegeEvaluation,
                    CreatedAt = rt.CreatedAt,
                    DueDate = rt.DueDate,
                    QuestionsCount = rt.Questions.Count,
                    SubmissionsCount = rt.StudentReports.Count
                })
                .ToListAsync();

            return reportTemplates;
        }

        public async Task<Result> EvaluateReportAsync(EvaluateReportDto evalDto, int supervisorId)
        {
            var compRep = await _context.CompanyRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == supervisorId);

            var collegeRep = await _context.CollegeRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == supervisorId);

            if (compRep == null && collegeRep == null)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You are not authorized as a representative.");
            }

            var studentReport = await _context.StudentReports
                .Include(sr => sr.StudentProfile)
                .Include(sr => sr.ReportTemplate)
                .Include(sr => sr.TrainingRecord)
                .FirstOrDefaultAsync(sr => sr.PublicId == evalDto.StudentReportPublicId);

            if (studentReport == null)
            {
                return Error.NotFound(ErrorCodes.StudentReportNotFound, "The student report was not found.");
            }

            var strategy = _context.Database.CreateExecutionStrategy();

            if (compRep != null)
            {
                if (studentReport.TrainingRecord.CompanyId != compRep.CompanyId)
                {
                    return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You do not have permission to evaluate reports for other companies.");
                }

                var existingEval = await _context.ReportEvaluations
                    .FirstOrDefaultAsync(e => e.StudentReportId == studentReport.Id && e.Phase == enEvaluationPhase.CompanyEvaluation);

                if (existingEval != null)
                {
                    existingEval.Score = evalDto.Score;
                    existingEval.Comments = evalDto.Comments;
                    existingEval.EvaluationDate = DateTime.UtcNow;
                }
                else
                {
                    if (studentReport.Status != enReportStatus.PendingCompanyReview)
                    {
                        return Error.Validation(ErrorCodes.ReportAlreadySubmitted, "This report is not currently pending company review.");
                    }

                    var evaluation = new ReportEvaluation
                    {
                        StudentReportId = studentReport.Id,
                        CompanySupervisorId = compRep.UserId,
                        Phase = enEvaluationPhase.CompanyEvaluation,
                        Score = evalDto.Score,
                        Comments = evalDto.Comments,
                        EvaluationDate = DateTime.UtcNow
                    };

                    _context.ReportEvaluations.Add(evaluation);

                    if (studentReport.ReportTemplate.RequiresCollegeEvaluation)
                    {
                        studentReport.Status = enReportStatus.PendingCollegeReview;
                    }
                    else
                    {
                        studentReport.Status = enReportStatus.Completed;
                    }
                }

                await strategy.ExecuteAsync(async () =>
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                    }
                    catch
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                });

                return Result.Success();
            }

            if (collegeRep != null)
            {
                if (studentReport.StudentProfile.CollegeId != collegeRep.CollegeId)
                {
                    return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You do not have permission to evaluate reports for other colleges.");
                }

                var existingEval = await _context.ReportEvaluations
                    .FirstOrDefaultAsync(e => e.StudentReportId == studentReport.Id && e.Phase == enEvaluationPhase.CollegeEvaluation);

                if (existingEval != null)
                {
                    existingEval.Score = evalDto.Score;
                    existingEval.Comments = evalDto.Comments;
                    existingEval.EvaluationDate = DateTime.UtcNow;
                }
                else
                {
                    if (studentReport.Status != enReportStatus.PendingCollegeReview)
                    {
                        return Error.Validation(ErrorCodes.ReportAlreadySubmitted, "This report is not currently pending college review.");
                    }

                    var evaluation = new ReportEvaluation
                    {
                        StudentReportId = studentReport.Id,
                        CollegeSupervisorId = collegeRep.UserId,
                        Phase = enEvaluationPhase.CollegeEvaluation,
                        Score = evalDto.Score,
                        Comments = evalDto.Comments,
                        EvaluationDate = DateTime.UtcNow
                    };

                    _context.ReportEvaluations.Add(evaluation);
                    studentReport.Status = enReportStatus.Completed;
                }

                await strategy.ExecuteAsync(async () =>
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                    }
                    catch
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                });

                return Result.Success();
            }

            return Result.Success();
        }

        public async Task<Result> DeleteTemplateAsync(Guid templatePublicId, int userId)
        {
            var collegeRep = await _context.CollegeRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            var companyRep = await _context.CompanyRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (collegeRep == null && companyRep == null)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You are not authorized as a representative.");
            }

            var template = await _context.ReportTemplates
                .FirstOrDefaultAsync(t => t.PublicId == templatePublicId &&
                    ((collegeRep != null && t.CollegeId == collegeRep.CollegeId) ||
                     (companyRep != null && t.CompanyId == companyRep.CompanyId)));

            if (template == null)
            {
                return Error.NotFound(ErrorCodes.TemplateNotFound, "The template was not found.");
            }

            var hasSubmissions = await _context.StudentReports.AnyAsync(sr => sr.TemplateId == template.Id);
            if (hasSubmissions)
            {
                return Error.Conflict(ErrorCodes.TemplateHasSubmissions, "This template cannot be deleted because there are student reports associated with it.");
            }

            _context.ReportTemplates.Remove(template);
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result> UpdateTemplateAsync(SaveTemplateDto updateDto, int userId)
        {
            var collegeRep = await _context.CollegeRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            var companyRep = await _context.CompanyRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (collegeRep == null && companyRep == null)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You are not authorized as a representative.");
            }

            var template = await _context.ReportTemplates
                .Include(t => t.Questions)
                .FirstOrDefaultAsync(t => t.PublicId == updateDto.TemplatePublicId &&
                    ((collegeRep != null && t.CollegeId == collegeRep.CollegeId) ||
                     (companyRep != null && t.CompanyId == companyRep.CompanyId)));

            if (template == null)
            {
                return Error.NotFound(ErrorCodes.TemplateNotFound, "The template was not found.");
            }

            var hasSubmissions = await _context.StudentReports.AnyAsync(sr => sr.TemplateId == template.Id);

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var templateTitle = !string.IsNullOrWhiteSpace(updateDto.TemplateTitle)
                        ? updateDto.TemplateTitle
                        : (updateDto.Title ?? string.Empty);

                    if (!string.IsNullOrWhiteSpace(templateTitle))
                    {
                        template.Title = templateTitle;
                    }
                    template.Description = updateDto.Description;
                    template.IsAvailable = updateDto.IsAvailable;
                    template.RequiresCompanyEvaluation = updateDto.RequiresCompanyEvaluation;
                    template.RequiresCollegeEvaluation = updateDto.RequiresCollegeEvaluation;
                    if (updateDto.DueDate.HasValue) template.DueDate = updateDto.DueDate.Value;
                    template.UpdatedAt = DateTime.UtcNow;

                    if (!hasSubmissions && updateDto.Questions != null && updateDto.Questions.Any())
                    {
                        _context.ReportQuestions.RemoveRange(template.Questions);

                        var newQuestions = updateDto.Questions.Select((q, idx) => new ReportQuestion
                        {
                            ReportTemplate = template,
                            QuestionText = q.QuestionText,
                            QuestionType = q.QuestionType,
                            IsRequired = q.IsRequired,
                            OptionsPayload = !string.IsNullOrWhiteSpace(q.OptionsPayload)
                                ? q.OptionsPayload
                                : (q.Options != null && q.Options.Any() ? System.Text.Json.JsonSerializer.Serialize(q.Options) : null),
                            OrderPosition = q.Order > 0 ? q.Order : idx + 1
                        }).ToList();

                        _context.ReportQuestions.AddRange(newQuestions);
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });

            return Result.Success();
        }

        public async Task<Result<TemplateDetailsDto>> GetTemplateDetailsAsync(Guid templatePublicId, int userId)
        {
            var template = await _context.ReportTemplates
                .Include(t => t.Questions)
                .FirstOrDefaultAsync(t => t.PublicId == templatePublicId);

            if (template == null)
            {
                return Error.NotFound(ErrorCodes.TemplateNotFound, "The template was not found.");
            }

            bool isCollegeRep = await _context.CollegeRepresentatives.AnyAsync(cr => cr.UserId == userId && cr.CollegeId == template.CollegeId);
            bool isCompanyRep = await _context.CompanyRepresentatives.AnyAsync(cr => cr.UserId == userId && cr.CompanyId == template.CompanyId);
            bool isCollegeStudent = await _context.StudentProfiles.AnyAsync(sp => sp.UserId == userId && sp.CollegeId == template.CollegeId);
            bool isCompanyStudent = await _context.TrainingRecords.AnyAsync(tr => tr.StudentId == userId && tr.CompanyId == template.CompanyId && tr.Status == enTrainingStatus.Active);

            if (!isCollegeRep && !isCompanyRep && !isCollegeStudent && !isCompanyStudent)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You do not have permission to view this template.");
            }

            var hasSubmissions = await _context.StudentReports.AnyAsync(sr => sr.TemplateId == template.Id);
            var submissionsCount = await _context.StudentReports.CountAsync(sr => sr.TemplateId == template.Id);

            var result = new TemplateDetailsDto
            {
                TemplatePublicId = template.PublicId,
                Title = template.Title,
                Description = template.Description,
                DueDate = template.DueDate,
                IsAvailable = template.IsAvailable,
                RequiresCompanyEvaluation = template.RequiresCompanyEvaluation,
                RequiresCollegeEvaluation = template.RequiresCollegeEvaluation,
                CreatedAt = template.CreatedAt,
                HasSubmissions = hasSubmissions,
                SubmissionsCount = submissionsCount,
                Questions = template.Questions.OrderBy(q => q.OrderPosition).Select(q => new QuestionDto
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    Order = q.OrderPosition,
                    IsRequired = q.IsRequired,
                    OptionsPayload = q.OptionsPayload,
                    Options = !string.IsNullOrWhiteSpace(q.OptionsPayload)
                        ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(q.OptionsPayload, (System.Text.Json.JsonSerializerOptions?)null)
                        : null
                }).ToList()
            };

            return result;
        }

        public async Task<Result<List<CollegeStudentReportDto>>> GetCollegeReportsAsync(int userId)
        {
            var rep = await _context.CollegeRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (rep == null)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You are not authorized as a college representative.");
            }

            var reports = await _context.StudentReports
                .Include(sr => sr.StudentProfile)
                .Include(sr => sr.StudentProfile.User)
                .Include(sr => sr.ReportTemplate)
                .Include(sr => sr.Evaluations)
                .Where(sr => sr.StudentProfile.CollegeId == rep.CollegeId && sr.SubmissionDate != null)
                .Select(sr => new CollegeStudentReportDto
                {
                    StudentReportPublicId = sr.PublicId,
                    StudentName = sr.StudentProfile.User.Name,
                    ReportTitle = sr.ReportTemplate.Title,
                    SubmissionDate = sr.SubmissionDate,
                    Status = sr.Status,
                    EvaluationScore = sr.Evaluations.Where(e => e.Phase == enEvaluationPhase.CollegeEvaluation).Select(e => (enEvaluationScore?)e.Score).FirstOrDefault(),
                    EvaluationComments = sr.Evaluations.Where(e => e.Phase == enEvaluationPhase.CollegeEvaluation).Select(e => e.Comments).FirstOrDefault(),
                    EvaluatedAt = sr.Evaluations.Where(e => e.Phase == enEvaluationPhase.CollegeEvaluation).Select(e => (DateTime?)e.EvaluationDate).FirstOrDefault()
                })
                .ToListAsync();

            return reports;
        }

        public async Task<Result<StudentReportDetailsDto>> GetStudentReportDetailsAsync(Guid studentReportPublicId, int userId)
        {
            var studentReport = await _context.StudentReports
                .Include(sr => sr.StudentProfile)
                    .ThenInclude(sp => sp.User)
                .Include(sr => sr.StudentProfile)
                    .ThenInclude(sp => sp.College)
                .Include(sr => sr.TrainingRecord)
                    .ThenInclude(tr => tr.Company)
                .Include(sr => sr.ReportTemplate)
                    .ThenInclude(rt => rt.Questions)
                .Include(sr => sr.Answers)
                    .ThenInclude(a => a.ReportQuestion)
                .Include(sr => sr.Evaluations)
                    .ThenInclude(e => e.CompanySupervisor)
                        .ThenInclude(cs => cs.User)
                .Include(sr => sr.Evaluations)
                    .ThenInclude(e => e.CollegeSupervisor)
                        .ThenInclude(cs => cs.User)
                .FirstOrDefaultAsync(sr => sr.PublicId == studentReportPublicId);

            if (studentReport == null)
            {
                return Error.NotFound(ErrorCodes.StudentReportNotFound, "The student report submission was not found.");
            }

            bool isStudentOwner = studentReport.StudentId == userId;
            bool isCompanyRep = await _context.CompanyRepresentatives
                .AnyAsync(cr => cr.UserId == userId && cr.CompanyId == studentReport.TrainingRecord.CompanyId);
            bool isCollegeRep = await _context.CollegeRepresentatives
                .AnyAsync(cr => cr.UserId == userId && cr.CollegeId == studentReport.StudentProfile.CollegeId);

            if (!isStudentOwner && !isCompanyRep && !isCollegeRep)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You do not have permission to view this report submission.");
            }

            var companyEval = studentReport.Evaluations
                .FirstOrDefault(e => e.Phase == enEvaluationPhase.CompanyEvaluation);
            var collegeEval = studentReport.Evaluations
                .FirstOrDefault(e => e.Phase == enEvaluationPhase.CollegeEvaluation);

            bool hasEvaluations = studentReport.Evaluations.Any() || studentReport.Status == enReportStatus.Completed;
            bool canDelete = isStudentOwner && !hasEvaluations;

            var answersMap = studentReport.Answers.ToDictionary(a => a.QuestionId, a => a.AnswerValue);

            var answerDetails = studentReport.ReportTemplate.Questions
                .OrderBy(q => q.OrderPosition)
                .Select(q =>
                {
                    answersMap.TryGetValue(q.Id, out var val);
                    return new ReportAnswerDetailDto
                    {
                        QuestionId = q.Id,
                        QuestionText = q.QuestionText,
                        QuestionType = q.QuestionType,
                        OrderPosition = q.OrderPosition,
                        IsRequired = q.IsRequired,
                        OptionsPayload = q.OptionsPayload,
                        Options = !string.IsNullOrWhiteSpace(q.OptionsPayload)
                            ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(q.OptionsPayload, (System.Text.Json.JsonSerializerOptions?)null)
                            : null,
                        AnswerValue = val ?? string.Empty,
                        AttachmentPath = q.QuestionType == enQuestionType.FileUpload ? val : null
                    };
                }).ToList();

            var result = new StudentReportDetailsDto
            {
                StudentReportPublicId = studentReport.PublicId,
                TemplatePublicId = studentReport.ReportTemplate.PublicId,
                TemplateTitle = studentReport.ReportTemplate.Title,
                TemplateDescription = studentReport.ReportTemplate.Description,
                DueDate = studentReport.ReportTemplate.DueDate,
                SubmissionDate = studentReport.SubmissionDate,
                Status = studentReport.Status,
                StudentId = studentReport.StudentId,
                StudentName = studentReport.StudentProfile?.User?.Name ?? string.Empty,
                StudentEmail = studentReport.StudentProfile?.User?.Email,
                CollegeName = studentReport.StudentProfile?.College?.CollegeName,
                CompanyName = studentReport.TrainingRecord?.Company?.CompanyName,
                RequiresCompanyEvaluation = studentReport.ReportTemplate.RequiresCompanyEvaluation,
                RequiresCollegeEvaluation = studentReport.ReportTemplate.RequiresCollegeEvaluation,
                CanDelete = canDelete,
                Answers = answerDetails,
                CompanyScore = companyEval != null ? (enEvaluationScore?)companyEval.Score : null,
                CompanyFeedback = companyEval?.Comments,
                CompanyEvaluatedAt = companyEval?.EvaluationDate,
                CompanyEvaluatorName = companyEval?.CompanySupervisor?.User?.Name,
                CollegeScore = collegeEval != null ? (enEvaluationScore?)collegeEval.Score : null,
                CollegeFeedback = collegeEval?.Comments,
                CollegeEvaluatedAt = collegeEval?.EvaluationDate,
                CollegeEvaluatorName = collegeEval?.CollegeSupervisor?.User?.Name
            };

            return result;
        }

        public async Task<Result> DeleteStudentReportAsync(Guid studentReportPublicId, int userId)
        {
            var studentReport = await _context.StudentReports
                .Include(sr => sr.Evaluations)
                .Include(sr => sr.Answers)
                .FirstOrDefaultAsync(sr => sr.PublicId == studentReportPublicId);

            if (studentReport == null)
            {
                return Error.NotFound(ErrorCodes.StudentReportNotFound, "The student report submission was not found.");
            }

            if (studentReport.StudentId != userId)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You can only delete your own submitted reports.");
            }

            if (studentReport.Evaluations.Any() || studentReport.Status == enReportStatus.Completed)
            {
                return Error.Conflict(ErrorCodes.ReportAlreadyEvaluated, "This report cannot be deleted because it has already been evaluated.");
            }

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    _context.ReportAnswers.RemoveRange(studentReport.Answers);
                    _context.StudentReports.Remove(studentReport);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });

            return Result.Success();
        }
    }
}
