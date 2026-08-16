using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using summer_training_app.Common.Constants;
using summer_training_app.Data;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Reports;
using summer_training_app.DTOs.Shared;
using summer_training_app.DTOs.Training;
using summer_training_app.Entities.Enums;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Services.Implementations
{
    public class StudentDashboardService : IStudentDashboardService
    {
        private readonly SummerTrainingDBContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IReportsService _reportsService;
        private readonly IFilesService _filesService;

        public StudentDashboardService(
            SummerTrainingDBContext context, 
            IWebHostEnvironment environment,
            IReportsService reportsService,
            IFilesService filesService)
        {
            _context = context;
            _environment = environment;
            _reportsService = reportsService;
            _filesService = filesService;
        }

        public async Task<(StudentProfileResponseDto? Data, ApiErrorResponseDTO? Error)> GetMyProfileAsync(int userId)
        {
            var studentProfile = await _context.StudentProfiles
                .Where(sp => sp.UserId == userId)
                .Select(sp => new StudentProfileResponseDto
                {
                    Id = sp.User.PublicId,
                    Name = sp.User.Name,
                    Username = sp.User.Username,
                    Email = sp.User.Email,
                    PhoneNumber = sp.User.PhoneNumber,
                    CollegeName = sp.College.CollegeName,
                    UniversityIdNumber = sp.UniversityIdNumber,
                    Major = sp.Major,
                    GPA = sp.GPA,

                    ActiveTraining = _context.TrainingRecords
                        .Where(tr => tr.StudentId == userId && (tr.Status == enTrainingStatus.Active || tr.Status == enTrainingStatus.Completed))
                        .OrderByDescending(tr => tr.CreatedAt)
                        .Select(tr => new ActiveTrainingDto
                        {
                            Id = tr.Id,
                            CompanyName = tr.Company.CompanyName,
                            StartDate = tr.StartDate,
                            EndDate = tr.EndDate,
                            AcademicYear = tr.AcademicYear,
                            Semester = tr.Semester,
                            TrainingStatus = tr.Status
                        }).FirstOrDefault()
                }).FirstOrDefaultAsync();

            if (studentProfile == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "Student profile not found."
                });
            }

            return (studentProfile, null);
        }

        public async Task<ApiErrorResponseDTO?> UpdateMyProfileAsync(UpdateStudentProfileDto dto, int userId)
        {
            var studentProfile = await _context.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == userId);
            if (studentProfile == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "Student profile not found."
                };
            }

            if (dto.UniversityIdNumber != null)
                studentProfile.UniversityIdNumber = dto.UniversityIdNumber;

            if (dto.Major != null)
                studentProfile.Major = dto.Major;

            if (dto.GPA.HasValue)
                studentProfile.GPA = dto.GPA.Value;

            await _context.SaveChangesAsync();
            return null;
        }

        public async Task<(List<StudentTrainingHistoryDto>? Data, ApiErrorResponseDTO? Error)> GetTrainingHistoryAsync(int userId)
        {
            var history = await _context.TrainingRecords
                .Include(tr => tr.Company)
                .AsNoTracking()
                .Where(tr => tr.StudentId == userId)
                .OrderByDescending(tr => tr.StartDate)
                .Select(tr => new StudentTrainingHistoryDto
                {
                    PublicId = tr.PublicId,
                    CompanyName = tr.Company.CompanyName,
                    StartDate = tr.StartDate,
                    EndDate = tr.EndDate,
                    AcademicYear = tr.AcademicYear,
                    Semester = tr.Semester,
                    Status = tr.Status
                })
                .ToListAsync();

            return (history, null);
        }

        public async Task<(List<StudentReportSummaryDto>? Data, ApiErrorResponseDTO? Error)> GetReportsSummaryAsync(int userId)
        {
            return await _reportsService.GetMyReportsAsync(userId);
        }

        public async Task<(List<CollegeAdvisorDto>? Data, ApiErrorResponseDTO? Error)> GetCollegeAdvisorAsync(int userId)
        {
            var studentProfile = await _context.StudentProfiles
                .Include(sp => sp.College)
                .AsNoTracking()
                .FirstOrDefaultAsync(sp => sp.UserId == userId);

            if (studentProfile == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "Student profile not found."
                });
            }

            var advisors = await _context.CollegeRepresentatives
                .Include(cr => cr.User)
                .AsNoTracking()
                .Where(cr => cr.CollegeId == studentProfile.CollegeId)
                .Select(cr => new CollegeAdvisorDto
                {
                    Name = cr.User.Name,
                    Email = cr.User.Email,
                    PhoneNumber = cr.User.PhoneNumber,
                    JobTitle = cr.JobTitle,
                    CollegeName = studentProfile.College.CollegeName
                })
                .ToListAsync();

            return (advisors, null);
        }

        public async Task<(List<CollegeDocumentDto>? Data, ApiErrorResponseDTO? Error)> GetCollegeDocumentsAsync(int userId)
        {
            var studentProfile = await _context.StudentProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(sp => sp.UserId == userId);

            if (studentProfile == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "Student profile not found."
                });
            }

            var documents = await _context.CollegeDocuments
                .AsNoTracking()
                .Where(cd => cd.CollegeId == studentProfile.CollegeId)
                .OrderByDescending(cd => cd.UploadedAt)
                .Select(cd => new CollegeDocumentDto
                {
                    Id = cd.Id,
                    Title = cd.Title,
                    FilePath = cd.FilePath,
                    CollegeId = cd.CollegeId,
                    CollegeName = cd.College.CollegeName,
                    UploadedAt = cd.UploadedAt
                })
                .ToListAsync();

            return (documents, null);
        }

        public async Task<(string? PhysicalPath, string? ContentType, string? FileName, ApiErrorResponseDTO? Error)> GetMyProofFileAsync(Guid publicId, int userId)
        {
            var request = await _context.TrainingRequests
                .AsNoTracking()
                .FirstOrDefaultAsync(tr => tr.PublicId == publicId && tr.StudentId == userId);

            if (request == null || string.IsNullOrWhiteSpace(request.AcceptanceLetterPath))
            {
                return (null, null, null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.FileNotFound,
                    DevMessage = "Training request or proof file not found."
                });
            }

            var result = await _filesService.DownloadFileAsync(request.AcceptanceLetterPath);

            if (result.Error != null)
                return (null, null, null, result.Error);

            return (result.Data.Value.PhysicalPath, result.Data.Value.ContentType, result.Data.Value.FileName, null);
        }

        public async Task<(string? PhysicalPath, string? ContentType, string? FileName, ApiErrorResponseDTO? Error)> DownloadCollegeDocumentAsync(int documentId, int userId)
        {
            var studentProfile = await _context.StudentProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(sp => sp.UserId == userId);

            if (studentProfile == null)
            {
                return (null, null, null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "Student profile not found."
                });
            }

            var document = await _context.CollegeDocuments
                .AsNoTracking()
                .FirstOrDefaultAsync(cd => cd.Id == documentId && cd.CollegeId == studentProfile.CollegeId);

            if (document == null || string.IsNullOrWhiteSpace(document.FilePath))
            {
                return (null, null, null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.DocumentNotFound,
                    DevMessage = "College document not found."
                });
            }

            var result = await _filesService.DownloadFileAsync(document.FilePath);

            if (result.Error != null)
                return (null, null, null, result.Error);

            return (result.Data.Value.PhysicalPath, result.Data.Value.ContentType, result.Data.Value.FileName, null);
        }
    }
}
