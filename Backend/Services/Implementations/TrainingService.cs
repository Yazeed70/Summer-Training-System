using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using summer_training_app.Common.Constants;
using summer_training_app.Common.Results;
using summer_training_app.Data;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Training;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Services.Implementations
{
    public class TrainingService : ITrainingService
    {
        private readonly SummerTrainingDBContext _context;
        private readonly IFilesService _filesService;

        public TrainingService(SummerTrainingDBContext context, IFilesService filesService)
        {
            _context = context;
            _filesService = filesService;
        }

        public async Task<Result<Guid>> SubmitRequestAsync(SubmitTrainingRequestDto dto, int studentId)
        {
            var studentUser = await _context.StudentProfiles
                .FirstOrDefaultAsync(u => u.UserId == studentId);

            if (studentUser == null)
            {
                return Error.Validation(ErrorCodes.InvalidCollegeId, "User is not associated with a valid college.");
            }

            var existingRequest = await _context.TrainingRequests
                .FirstOrDefaultAsync(tr => tr.StudentId == studentId && tr.Status == enRequestStatus.Pending);

            if (existingRequest != null)
            {
                return Error.Conflict(ErrorCodes.ExistingPendingRequest, "You already have a pending request.");
            }

            if (dto.CompanyId == null && string.IsNullOrWhiteSpace(dto.SuggestedCompanyName))
            {
                return Error.Validation(ErrorCodes.InvalidProofFile, "You must select a company from the list or enter a suggested company name.");
            }

            var uploadResult = await _filesService.UploadFileAsync(dto.AcceptanceLetter, "acceptance_letters");
            if (uploadResult.IsFailure)
            {
                return uploadResult.Error;
            }

            var request = new TrainingRequest
            {
                StudentId = studentId,
                CompanyId = dto.CompanyId,
                SuggestedCompanyName = dto.SuggestedCompanyName,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                AcademicYear = dto.AcademicYear,
                Semester = dto.Semester,
                AcceptanceLetterPath = uploadResult.Value.FilePath,
                Status = enRequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                _context.TrainingRequests.Add(request);
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                await _filesService.DeleteFile(uploadResult.Value.FilePath);
                return Error.Failure(ErrorCodes.DatabaseError, "An error occurred while saving the training request.");
            }

            return request.PublicId;
        }

        public async Task<Result<List<PendingTrainingRequestDto>>> GetStudentPendingRequestsAsync(int studentId)
        {
            var requests = await _context.TrainingRequests
                .Where(tr => tr.StudentId == studentId)
                .OrderByDescending(tr => tr.CreatedAt)
                .Select(tr => new PendingTrainingRequestDto
                {
                    Id = tr.PublicId,
                    StudentName = tr.Student.User.Name,
                    CompanyName = tr.Company != null ? tr.Company.CompanyName : (tr.SuggestedCompanyName ?? "Other"),
                    StartDate = tr.StartDate,
                    EndDate = tr.EndDate,
                    AcceptanceLetterPath = tr.AcceptanceLetterPath,
                    Status = tr.Status,
                    CreatedAt = tr.CreatedAt
                })
                .ToListAsync();

            return requests;
        }

        public async Task<Result<MyTrainingRequestDto>> GetPendingRequestAsync(Guid requestPublicId)
        {
            var request = await _context.TrainingRequests
                .Where(tr => tr.PublicId == requestPublicId)
                .Select(tr => new MyTrainingRequestDto
                {
                    Id = tr.PublicId,
                    StudentName = tr.Student.User.Name,
                    CompanyName = tr.Company != null ? tr.Company.CompanyName : (tr.SuggestedCompanyName ?? "Other"),
                    StartDate = tr.StartDate,
                    EndDate = tr.EndDate,
                    AcademicYear = tr.AcademicYear,
                    Semester = tr.Semester,
                    Status = tr.Status,
                    AcceptanceLetterPath = tr.AcceptanceLetterPath,
                    CreatedAt = tr.CreatedAt,
                    Comment = tr.Comment,
                    ReviewedAt = tr.ReviewedAt,
                    ReviewedByUserName = tr.ReviewedById != null ? tr.ReviewedBy.User.Name : null
                })
                .FirstOrDefaultAsync();

            if (request == null)
            {
                return Error.NotFound(ErrorCodes.RequestNotFound, "The specified training request was not found.");
            }

            return request;
        }

        public async Task<Result<List<PendingTrainingRequestDto>>> GetCollegePendingRequestsAsync(int collegeId, int userId)
        {
            if (!await _context.CollegeRepresentatives.AnyAsync(u => u.UserId == userId && u.CollegeId == collegeId))
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "User does not have access to this college's requests.");
            }

            var requests = await _context.TrainingRequests
                .Where(tr => tr.Student.CollegeId == collegeId)
                .OrderByDescending(tr => tr.CreatedAt)
                .Select(tr => new PendingTrainingRequestDto
                {
                    Id = tr.PublicId,
                    StudentName = tr.Student.User.Name,
                    CompanyName = tr.Company != null ? tr.Company.CompanyName : (tr.SuggestedCompanyName ?? "Other"),
                    StartDate = tr.StartDate,
                    EndDate = tr.EndDate,
                    AcceptanceLetterPath = tr.AcceptanceLetterPath,
                    Status = tr.Status,
                    CreatedAt = tr.CreatedAt
                })
                .ToListAsync();

            return requests;
        }

        public async Task<Result> ProcessRequestAsync(ProcessTrainingRequestDto dto, int reviewerUserId)
        {
            var reviewerUser = await _context.CollegeRepresentatives
                .Include(cr => cr.College)
                .FirstOrDefaultAsync(u => u.UserId == reviewerUserId);

            if (reviewerUser == null)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You are not authorized to process this request.");
            }

            var request = await _context.TrainingRequests
                .Include(tr => tr.Student)
                .FirstOrDefaultAsync(tr => tr.PublicId == dto.RequestPublicId && tr.Student.CollegeId == reviewerUser.CollegeId);

            if (request == null)
            {
                return Error.NotFound(ErrorCodes.RequestNotFound, "The training request was not found.");
            }

            if (request.Status != enRequestStatus.Pending)
            {
                return Error.Validation(ErrorCodes.ExistingPendingRequest, "This request has already been processed.");
            }

            var strategy = _context.Database.CreateExecutionStrategy();
            Error? resultError = null;

            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    request.Status = dto.IsApproved ? enRequestStatus.Approved : enRequestStatus.Rejected;
                    request.ReviewedAt = DateTime.UtcNow;
                    request.ReviewedById = reviewerUserId;
                    request.Comment = dto.RejectionReason;

                    if (!dto.IsApproved)
                    {
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        resultError = null;
                        return;
                    }

                    int finalCompanyId;
                    if (request.CompanyId == null)
                    {
                        if (string.IsNullOrWhiteSpace(request.SuggestedCompanyName))
                        {
                            resultError = Error.Validation(ErrorCodes.CompanyIdMissing, "Company ID is missing.");
                            return;
                        }

                        var trimmedSuggestedName = request.SuggestedCompanyName.Trim();
                        var existingCompany = await _context.Companies
                            .FirstOrDefaultAsync(c => c.CompanyName.ToLower() == trimmedSuggestedName.ToLower());

                        if (existingCompany != null)
                        {
                            finalCompanyId = existingCompany.Id;
                            request.CompanyId = finalCompanyId;
                        }
                        else
                        {
                            var newCompany = new Company
                            {
                                CompanyName = trimmedSuggestedName,
                                CompanyAddress = "Not Specified",
                                ContactEmail = null,
                                IsApproved = true,
                                ApprovedAt = DateTime.UtcNow,
                                ApprovedByUserId = reviewerUserId,
                                CreatedByUserId = reviewerUserId,
                                CreatedAt = DateTime.UtcNow
                            };
                            _context.Companies.Add(newCompany);
                            await _context.SaveChangesAsync();

                            finalCompanyId = newCompany.Id;
                            request.CompanyId = finalCompanyId;
                        }
                    }
                    else
                    {
                        var company = await _context.Companies.FindAsync(request.CompanyId);
                        if (company == null)
                        {
                            resultError = Error.NotFound(ErrorCodes.CompanyIdMissing, "Company ID is missing.");
                            return;
                        }

                        finalCompanyId = company.Id;
                    }

                    var training = new TrainingRecord
                    {
                        StudentId = request.StudentId,
                        CompanyId = finalCompanyId,
                        StartDate = request.StartDate,
                        EndDate = request.EndDate,
                        AcademicYear = request.AcademicYear,
                        Semester = request.Semester,
                        Status = enTrainingStatus.Active,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.TrainingRecords.Add(training);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    resultError = null;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });

            if (resultError != null)
            {
                return resultError;
            }

            return Result.Success();
        }

        public async Task<Result> UpdateTrainingStatusAsync(UpdateTrainingStatusDto dto, int userId)
        {
            var training = await _context.TrainingRecords
                .Include(tr => tr.Student)
                .FirstOrDefaultAsync(tr => tr.PublicId == dto.TrainingPublicId);

            if (training == null)
            {
                return Error.NotFound(ErrorCodes.TrainingRequestNotFound, "Training record not found.");
            }
            
            bool isCollegeAdmin = await _context.CollegeRepresentatives.AnyAsync(cr => cr.UserId == userId && cr.CollegeId == training.Student.CollegeId);

            if (!isCollegeAdmin)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You do not have permission to update this training record.");
            }

            if (training.Status != enTrainingStatus.Active || dto.NewStatus == enTrainingStatus.NotStarted)
            {
                return Error.Validation(ErrorCodes.TrainingIsNotActive, $"Cannot update status. Training is currently '{training.Status}' and is not active.");
            }
            
            training.Status = dto.NewStatus;
            await _context.SaveChangesAsync();

            return Result.Success();
        }
    }
}
