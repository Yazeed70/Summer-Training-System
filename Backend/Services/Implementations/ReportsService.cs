using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using summer_training_app.Common.Constants;
using summer_training_app.Data;
using summer_training_app.DTOs.Reports;
using summer_training_app.DTOs.Shared;
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

        public async Task<(Guid ReportTemplatePublicId, ApiErrorResponseDTO? Error)> CreateReportTemplateAsync(SaveTemplateDto reportDto, int userId)
        {
            var collegeRep = await _context.CollegeRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            var companyRep = await _context.CompanyRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (collegeRep == null && companyRep == null)
            {
                return (Guid.Empty, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "You are not authorized as a college or company representative."
                });
            }

            var templateTitle = !string.IsNullOrWhiteSpace(reportDto.TemplateTitle)
                ? reportDto.TemplateTitle
                : (reportDto.Title ?? string.Empty);

            if (string.IsNullOrWhiteSpace(templateTitle))
            {
                return (Guid.Empty, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.TemplateTitleMissing,
                    DevMessage = "Template title is required."
                });
            }

            if (reportDto.Questions == null || !reportDto.Questions.Any())
            {
                return (Guid.Empty, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.TemplateQuestionsMissing,
                    DevMessage = "At least one question is required."
                });
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

            return (reportTemplate.PublicId, null);
        }

        public async Task<(List<StudentReportSummaryDto>? Data, ApiErrorResponseDTO? Error)> GetMyReportsAsync(int userId)
        {
            var student = await _context.StudentProfiles
                .FirstOrDefaultAsync(sp => sp.UserId == userId);

            if (student == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "Student profile not found for this user."
                });
            }
            // 1. fetch the current company of student
            var activeTraining = await _context.TrainingRecords
                .Where(tr => tr.StudentId == userId && tr.Status == enTrainingStatus.Active)
                .OrderByDescending(tr => tr.CreatedAt)
                .FirstOrDefaultAsync();

            var availableTemplates = await _context.ReportTemplates
                .Where(t => t.IsAvailable && (t.CollegeId == student.CollegeId || (activeTraining != null && t.CompanyId == activeTraining.CompanyId)))
                .ToListAsync();

            // 2. fetch all the reports that have been submitted by student(or start with it)
            var submittedReports = await _context.StudentReports
                .Include(sr => sr.ReportTemplate)
                .Include(sr => sr.ReportTemplate.Questions)
                .Include(sr => sr.Evaluations)
                .Where(sr => sr.StudentId == student.UserId)
                .ToListAsync();

            // extract the id number of submitted Template to avoid dublicated
            var submittedTemplateIds = submittedReports.Select(sr => sr.TemplateId).ToHashSet();

            // 3. fetch pending template and that are not submitted yet
            var pendingTemplates = await _context.ReportTemplates
                .Include(t => t.Questions)
                .Where(t => t.IsAvailable &&
                           !submittedTemplateIds.Contains(t.Id) &&
                           (t.CollegeId == student.CollegeId || (activeTraining != null && t.CompanyId == activeTraining.CompanyId)))
                .ToListAsync();

            var result = new List<StudentReportSummaryDto>();

            // 4. Adding submitted reports to the result
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

            // 5. Adding pending templates to the result
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

            // 6. Order the result by submission date, with pending reports at the end
            // orderby: order the result from smallest to largest (from 0 to 1), Draft == 0 so it mean => order by (0) 
            result = result.OrderBy(r => r.Status != enReportStatus.Draft) 
                           .ThenByDescending(r => r.SubmittedAt)
                           .ToList();

            return (result, null);
        }

        public async Task<(Guid StudentReportPublicId, ApiErrorResponseDTO? Error)> SubmitReportAsync(SubmitReportDto submissionDto, int userId)
        {
            var student = await _context.StudentProfiles
                .FirstOrDefaultAsync(sp => sp.UserId == userId);

            if (student == null)
            {
                return (Guid.Empty, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "Student profile not found for this user."
                });
            }

            var activeTraining = await _context.TrainingRecords
                .Where(tr => tr.StudentId == userId && tr.Status == enTrainingStatus.Active)
                .OrderByDescending(tr => tr.CreatedAt)
                .FirstOrDefaultAsync();

            if (activeTraining == null)
            {
                return (Guid.Empty, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.TrainingRequestNotFound,
                    DevMessage = "No active training record found for the student."
                });
            }

            var template = await _context.ReportTemplates
                .FirstOrDefaultAsync(t => t.PublicId == submissionDto.TemplatePublicId && t.IsAvailable &&
                    (t.CollegeId == student.CollegeId || t.CompanyId == activeTraining.CompanyId));

            if (template == null)
            {
                return (Guid.Empty, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.TemplateNotFound,
                    DevMessage = "The specified report template does not exist or is not available for you."
                });
            }

            var alreadySubmitted = await _context.StudentReports
                .AnyAsync(sr => sr.TemplateId == template.Id && sr.StudentId == userId);

            if (alreadySubmitted)
            {
                return (Guid.Empty, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.ReportAlreadySubmitted,
                    DevMessage = "You have already submitted a report for this template."
                });
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

            return (studentReport.PublicId, null);
        }

        public async Task<(List<CompanyStudentReportDto>? Data, ApiErrorResponseDTO? Error)> GetCompanyReportsAsync(int userId)
        {
            var companyRep = await _context.CompanyRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (companyRep == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "You are not authorized as a company representative."
                });
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

            return (reports, null);
        }

        public async Task<(List<CollegeReportTemplateDto>? Data, ApiErrorResponseDTO? Error)> GetCollegeTemplatesAsync(int userId)
        {
            var rep = await _context.CollegeRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (rep == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "You are not authorized as a college representative."
                });
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

            return (reportTemplates, null);
        }

        public async Task<(List<CollegeReportTemplateDto>? Data, ApiErrorResponseDTO? Error)> GetCompanyTemplatesAsync(int userId)
        {
            var rep = await _context.CompanyRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (rep == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "You are not authorized as a company representative."
                });
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

            return (reportTemplates, null);
        }

        public async Task<ApiErrorResponseDTO?> EvaluateReportAsync(EvaluateReportDto evalDto, int supervisorId)
        {
            var compRep = await _context.CompanyRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == supervisorId);

            var collegeRep = await _context.CollegeRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == supervisorId);

            if (compRep == null && collegeRep == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "You are not authorized as a representative."
                };
            }

            var studentReport = await _context.StudentReports
                .Include(sr => sr.StudentProfile)
                .Include(sr => sr.ReportTemplate)
                .Include(sr => sr.TrainingRecord)
                .FirstOrDefaultAsync(sr => sr.PublicId == evalDto.StudentReportPublicId);

            if (studentReport == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.StudentReportNotFound,
                    DevMessage = "The student report was not found."
                };
            }

            if (compRep != null)
            {
                if (studentReport.TrainingRecord.CompanyId != compRep.CompanyId)
                {
                    return new ApiErrorResponseDTO
                    {
                        Code = ErrorCodes.UnauthorizedAccess,
                        DevMessage = "You do not have permission to evaluate reports for other companies."
                    };
                }

                if (studentReport.Status != enReportStatus.PendingCompanyReview)
                {
                    return new ApiErrorResponseDTO
                    {
                        Code = ErrorCodes.ReportAlreadySubmitted,
                        DevMessage = "This report is not currently pending company review."
                    };
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

                if (studentReport.ReportTemplate.RequiresCollegeEvaluation)
                {
                    studentReport.Status = enReportStatus.PendingCollegeReview;
                }
                else
                {
                    studentReport.Status = enReportStatus.Completed;
                }

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    _context.ReportEvaluations.Add(evaluation);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }

                return null;
            }

            if (collegeRep != null)
            {
                if (studentReport.StudentProfile.CollegeId != collegeRep.CollegeId)
                {
                    return new ApiErrorResponseDTO
                    {
                        Code = ErrorCodes.UnauthorizedAccess,
                        DevMessage = "You do not have permission to evaluate reports for other colleges."
                    };
                }

                if (studentReport.Status != enReportStatus.PendingCollegeReview)
                {
                    return new ApiErrorResponseDTO
                    {
                        Code = ErrorCodes.ReportAlreadySubmitted,
                        DevMessage = "This report is not currently pending college review."
                    };
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

                studentReport.Status = enReportStatus.Completed;

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    _context.ReportEvaluations.Add(evaluation);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }

                return null;
            }

            return null;
        }

        public async Task<ApiErrorResponseDTO?> DeleteTemplateAsync(Guid templatePublicId, int userId)
        {
            var collegeRep = await _context.CollegeRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            var companyRep = await _context.CompanyRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (collegeRep == null && companyRep == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "You are not authorized as a representative."
                };
            }

            var template = await _context.ReportTemplates
                .FirstOrDefaultAsync(t => t.PublicId == templatePublicId &&
                    ((collegeRep != null && t.CollegeId == collegeRep.CollegeId) ||
                     (companyRep != null && t.CompanyId == companyRep.CompanyId)));

            if (template == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.TemplateNotFound,
                    DevMessage = "The template was not found."
                };
            }

            var hasSubmissions = await _context.StudentReports.AnyAsync(sr => sr.TemplateId == template.Id);
            if (hasSubmissions)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.TemplateHasSubmissions,
                    DevMessage = "This template cannot be deleted because there are student reports associated with it."
                };
            }

            _context.ReportTemplates.Remove(template);
            await _context.SaveChangesAsync();

            return null;
        }

        public async Task<ApiErrorResponseDTO?> UpdateTemplateAsync(SaveTemplateDto updateDto, int userId)
        {
            var collegeRep = await _context.CollegeRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            var companyRep = await _context.CompanyRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (collegeRep == null && companyRep == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "You are not authorized as a representative."
                };
            }

            var template = await _context.ReportTemplates
                .Include(t => t.Questions)
                .FirstOrDefaultAsync(t => t.PublicId == updateDto.TemplatePublicId &&
                    ((collegeRep != null && t.CollegeId == collegeRep.CollegeId) ||
                     (companyRep != null && t.CompanyId == companyRep.CompanyId)));

            if (template == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.TemplateNotFound,
                    DevMessage = "The template was not found."
                };
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

            return null;
        }

        public async Task<(TemplateDetailsDto? Data, ApiErrorResponseDTO? Error)> GetTemplateDetailsAsync(Guid templatePublicId, int userId)
        {
            var template = await _context.ReportTemplates
                .Include(t => t.Questions)
                .FirstOrDefaultAsync(t => t.PublicId == templatePublicId);

            if (template == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.TemplateNotFound,
                    DevMessage = "The template was not found."
                });
            }

            bool isCollegeRep = await _context.CollegeRepresentatives.AnyAsync(cr => cr.UserId == userId && cr.CollegeId == template.CollegeId);
            bool isCompanyRep = await _context.CompanyRepresentatives.AnyAsync(cr => cr.UserId == userId && cr.CompanyId == template.CompanyId);
            bool isCollegeStudent = await _context.StudentProfiles.AnyAsync(sp => sp.UserId == userId && sp.CollegeId == template.CollegeId);
            bool isCompanyStudent = await _context.TrainingRecords.AnyAsync(tr => tr.StudentId == userId && tr.CompanyId == template.CompanyId && tr.Status == enTrainingStatus.Active);

            if (!isCollegeRep && !isCompanyRep && !isCollegeStudent && !isCompanyStudent)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "You do not have permission to view this template."
                });
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

            return (result, null);
        }

        public async Task<(List<CollegeStudentReportDto>? Data, ApiErrorResponseDTO? Error)> GetCollegeReportsAsync(int userId)
        {
            var rep = await _context.CollegeRepresentatives
                .FirstOrDefaultAsync(cr => cr.UserId == userId);

            if (rep == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "You are not authorized as a college representative."
                });
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

            return (reports, null);
        }
    }
}
