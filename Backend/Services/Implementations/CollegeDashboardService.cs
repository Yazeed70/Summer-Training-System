using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using summer_training_app.Common.Constants;
using summer_training_app.Common.Results;
using summer_training_app.Data;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Training;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Services.Implementations
{
    public class CollegeDashboardService : ICollegeDashboardService
    {
        private readonly SummerTrainingDBContext _context;
        private readonly IFilesService _filesService;

        public CollegeDashboardService(SummerTrainingDBContext context, IFilesService filesService)
        {
            _context = context;
            _filesService = filesService;
        }

        public async Task<Result<CollegeDetailsDto>> GetCollegeProfileAsync(int collegeId)
        {
            var college = await _context.Colleges
                .Include(c => c.StudentProfiles)
                .Include(c => c.Documents)
                .FirstOrDefaultAsync(c => c.Id == collegeId);

            if (college == null)
            {
                return Error.NotFound(ErrorCodes.CollegeNotFound, "College not found.");
            }

            return new CollegeDetailsDto
            {
                Id = college.Id,
                Name = college.CollegeName,
                ContactEmail = college.ContactEmail,
                Address = college.CollegeAddress,
                CreatedAt = college.CreatedAt,
                TotalStudents = college.StudentProfiles.Count()
            };
        }

        public async Task<Result> UpdateCollegeAsync(CreateCollegeDto dto, int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "User is not authorized to update this college.");
            }

            var college = await _context.Colleges.FindAsync(collegeId);
            if (college == null)
            {
                return Error.NotFound(ErrorCodes.CollegeNotFound, "College not found.");
            }

            college.CollegeName = dto.Name;
            college.ContactEmail = dto.ContactEmail;
            if (dto.Address != null)
            {
                college.CollegeAddress = dto.Address;
            }

            await _context.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result> DeleteCollegeAsync(int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "User is not authorized to update this college.");
            }

            var college = await _context.Colleges.FindAsync(collegeId);
            if (college == null)
            {
                return Error.NotFound(ErrorCodes.CollegeNotFound, "College not found.");
            }

            bool hasLinkedUsers = await _context.CollegeRepresentatives.AnyAsync(cr => cr.CollegeId == collegeId) ||
                                  await _context.StudentProfiles.AnyAsync(sp => sp.CollegeId == collegeId);

            if (hasLinkedUsers)
            {
                return Error.Conflict(ErrorCodes.CollegeHasLinkedUsers, "Cannot delete this college because it has linked users.");
            }

            college.IsDeleted = true;
            await _context.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result<List<CollegeStudentsListDto>>> GetCollegeStudentsAsync(int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "User is not authorized to view students of this college.");
            }
            
            var students = await _context.StudentProfiles
                .Include(u => u.User)
                .Include(u => u.College)
                .Include(u => u.TrainingRecords)
                .Include(u => u.StudentReports)
                .Where(u => u.CollegeId == collegeId)
                .Select(u => new CollegeStudentsListDto
                {
                    PublicId = u.User.PublicId,
                    StudentName = u.User.Name,
                    CompletedReports = u.StudentReports
                        .Where(sr => sr.Status == enReportStatus.Completed && u.TrainingRecords.Any(tr => tr.Status == enTrainingStatus.Active))
                        .Count(),

                    ActiveTraining = u.TrainingRecords
                        .Where(tr => tr.Status == enTrainingStatus.Active)
                        .Select(tr => new ActiveTrainingListDto
                        {
                            Id = tr.Id,
                            CompanyName = tr.Company.CompanyName,
                            TrainingStatus = tr.Status
                        }).FirstOrDefault()
                }).ToListAsync();

            return students;
        }

        public async Task<Result<StudentProfileResponseDto>> GetStudentProfileAsync(Guid studentPublicId, int collegeId)
        {
            var studentProfile = await _context.StudentProfiles
                .Where(u => u.User.PublicId == studentPublicId && u.CollegeId == collegeId)
                .Select(u => new StudentProfileResponseDto
                {
                    Id = u.User.PublicId,
                    Name = u.User.Name,
                    Username = u.User.Username,
                    CollegeName = u.College.CollegeName,
                    UniversityIdNumber = u.UniversityIdNumber,
                    Major = u.Major,
                    GPA = u.GPA,
                    Email = u.User.Email,
                    PhoneNumber = u.User.PhoneNumber,

                    ActiveTraining = u.TrainingRecords
                        .Where(tr => tr.Status == enTrainingStatus.Active)
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
                return Error.NotFound(ErrorCodes.UserNotFound, "Student not found or you do not have permission to access this profile.");
            }

            return studentProfile;
        }

        public async Task<Result<Guid>> LinkCollegeStudentAsync(Guid userPublicId, int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "User is not authorized to link students to this college.");
            }

            var user = await _context.Users
                .Include(u => u.StudentProfile)
                .FirstOrDefaultAsync(u => u.PublicId == userPublicId && u.RoleId == (int)enRoles.Student);

            if (user == null)
            {
                return Error.NotFound(ErrorCodes.UserNotFound, "Student user not found.");
            }

            if (user.StudentProfile != null)
            {
                return Error.Conflict(ErrorCodes.StudentAlreadyLinked, "This student is already linked to a college.");
            }
            
            _context.StudentProfiles.Add(new StudentProfile
            {
                UserId = user.Id,
                CollegeId = collegeId
            });

            await _context.SaveChangesAsync();
            return user.PublicId;
        }

        public async Task<Result> UnlinkCollegeStudentAsync(Guid studentPublicId, int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "User is not authorized to unlink students from this college.");
            }
            var studentProfile = await _context.StudentProfiles
                .Where(sp => sp.User.PublicId == studentPublicId && sp.CollegeId == collegeId)
                .FirstOrDefaultAsync();

            if (studentProfile == null)
            {
                return Error.NotFound(ErrorCodes.UserNotFound, "Student not found in your college.");
            }

            _context.StudentProfiles.Remove(studentProfile);
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result> UploadCollegeDocumentAsync(UploadDocumentDto dto, int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return Error.Forbidden(ErrorCodes.InvalidCollegeId, "You are not associated with a valid college.");
            }

            var uploadResult = await _filesService.UploadFileAsync(dto.File, $"Colleges/{collegeId}");
            if (uploadResult.IsFailure)
            {
                return uploadResult.Error;
            }
            
            var document = new CollegeDocument
            {
                Title = dto.Title,
                FilePath = uploadResult.Value.FilePath,
                CollegeId = collegeId,
                UploadedAt = DateTime.UtcNow
            };

            try
            {
                _context.CollegeDocuments.Add(document);
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                await _filesService.DeleteFile(document.FilePath);
                return Error.Failure(ErrorCodes.DatabaseError, "An error occurred while saving the document.");
            }

            return Result.Success();
        }

        public async Task<Result> DeleteDocumentAsync(int documentId, int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return Error.Forbidden(ErrorCodes.InvalidCollegeId, "You are not associated with a valid college.");
            }

            var document = await _context.CollegeDocuments.FindAsync(documentId);
            if (document == null || document.CollegeId != collegeId) 
            {
                return Error.NotFound(ErrorCodes.DocumentNotFound, "Document not found or does not belong to your college.");
            }

            try
            {
                _context.CollegeDocuments.Remove(document);
                await _context.SaveChangesAsync();
                await _filesService.DeleteFile(document.FilePath);
            }
            catch (Exception)
            {
                return Error.Failure(ErrorCodes.DatabaseError, "An error occurred while deleting the document.");
            }

            return Result.Success();
        }

        public async Task<Result<List<CollegeStudentsUpgradeRequestsListDto>>> GetPendingStudentRequestsAsync(int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "User is not authorized for this college.");
            }

            var requests = await _context.RoleUpgradeRequests
                .Include(r => r.User)
                .Include(r => r.RequestedRole)
                .Include(r => r.College)
                .AsNoTracking()
                .Where(r => r.CollegeId == collegeId 
                         && r.RequestedRoleId == (int)enRoles.Student 
                         && r.Status == enRequestStatus.Pending)
                .Select(r => new CollegeStudentsUpgradeRequestsListDto
                {
                    PublicId = r.PublicId,
                    StudentId = r.User.PublicId,
                    StudentName = r.User.Name,
                    RequestedRole = r.RequestedRole.RoleName,
                    CollegeName = r.College.CollegeName,
                    Status = r.Status,
                    FilePath = r.ProofFilePath
                })
                .ToListAsync();

            return requests;
        }
        
        public async Task<Result<List<CollegeStudentsUpgradeRequestsListDto>>> GetHandledStudentRequestsAsync(int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "User is not authorized for this college.");
            }

            var requests = await _context.RoleUpgradeRequests
                .Include(r => r.User)
                .Include(r => r.RequestedRole)
                .Include(r => r.College)
                .AsNoTracking()
                .Where(r => r.CollegeId == collegeId 
                         && r.RequestedRoleId == (int)enRoles.Student 
                         && r.Status != enRequestStatus.Pending)
                .OrderByDescending(r => r.ReviewedAt ?? r.CreatedAt)
                .Select(r => new CollegeStudentsUpgradeRequestsListDto
                {
                    PublicId = r.PublicId,
                    StudentId = r.User.PublicId,
                    StudentName = r.User.Name,
                    RequestedRole = r.RequestedRole.RoleName,
                    CollegeName = r.College.CollegeName,
                    Status = r.Status,
                    FilePath = r.ProofFilePath
                })
                .ToListAsync();

            return requests;
        }

        public async Task<Result<UpgradeRequestDetailsDto>> GetStudentRequestDetailsAsync(Guid requestPublicId, int collegeRepId)
        {
            var request = await _context.RoleUpgradeRequests
                .Include(r => r.User)
                .Include(r => r.RequestedRole)
                .Include(r => r.College)
                .Include(r => r.Company)
                .Include(r => r.ReviewedBy)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.PublicId == requestPublicId);

            if (request == null)
            {
                return Error.NotFound(ErrorCodes.UpgradeRequestNotFound, "Upgrade request not found.");
            }

            if (!request.CollegeId.HasValue || !await IsUserCollegeRepresentativeAsync(collegeRepId, request.CollegeId.Value))
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You are not authorized to view requests for this college.");
            }

            var details = new UpgradeRequestDetailsDto
            {
                Id = request.PublicId,
                StudentPublicId = request.User.PublicId,
                UserName = request.User.Name,
                UserEmail = request.User.Email ?? string.Empty,
                RequestedRole = request.RequestedRole.RoleName,
                CollegeName = request.College != null ? request.College.CollegeName : null,
                CompanyName = request.Company != null ? request.Company.CompanyName : null,
                OfficialEmail = request.OfficialEmail,
                ProofFilePath = request.ProofFilePath,
                Status = request.Status,
                Comment = request.Comment,
                CreatedAt = request.CreatedAt,
                ReviewedAt = request.ReviewedAt,
                ReviewedByName = request.ReviewedBy != null ? request.ReviewedBy.Name : null
            };

            return details;
        }

        public async Task<Result> HandleStudentRequestAsync(Guid requestPublicId, HandleUpgradeRequestDto dto, int collegeRepId)
        {
            var request = await _context.RoleUpgradeRequests
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.PublicId == requestPublicId);

            if (request == null)
            {
                return Error.NotFound(ErrorCodes.UpgradeRequestNotFound, "Upgrade request not found.");
            }

            if (request.RequestedRoleId != (int)enRoles.Student)
            {
                return Error.Validation(ErrorCodes.InvalidRequestedRole, "This request is not a student upgrade request.");
            }

            if (request.Status != enRequestStatus.Pending)
            {
                return Error.Validation(ErrorCodes.UpgradeRequestAlreadyProcessed, "This request has already been processed.");
            }

            if (!request.CollegeId.HasValue || !await IsUserCollegeRepresentativeAsync(collegeRepId, request.CollegeId.Value))
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "You are not authorized to review requests for this college.");
            }

            if (dto.IsApproved)
            {
                var strategy = _context.Database.CreateExecutionStrategy();
                await strategy.ExecuteAsync(async () =>
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        request.Status = enRequestStatus.Approved;
                        request.ReviewedById = collegeRepId;
                        request.ReviewedAt = DateTime.UtcNow;
                        request.User.RoleId = (int)enRoles.Student;

                        var existingProfile = await _context.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == request.UserId);
                        if (existingProfile == null)
                        {
                            _context.StudentProfiles.Add(new StudentProfile
                            {
                                UserId = request.UserId,
                                CollegeId = request.CollegeId.Value
                            });
                        }
                        else
                        {
                            existingProfile.CollegeId = request.CollegeId.Value;
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
            }
            else
            {
                request.Status = enRequestStatus.Rejected;
                request.Comment = dto.Comment;
                request.ReviewedById = collegeRepId;
                request.ReviewedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
            }

            return Result.Success();
        }

        public async Task<Result<(string PhysicalPath, string ContentType, string FileName)>> GetProofFileAsync(Guid publicId, int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "User is not authorized for this college.");
            }

            var request = await _context.RoleUpgradeRequests
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.PublicId == publicId && r.CollegeId == collegeId);

            if (request == null || string.IsNullOrEmpty(request.ProofFilePath))
            {
                return Error.NotFound(ErrorCodes.FileNotFound, "Request or proof file not found.");
            }

            return await _filesService.DownloadFileAsync(request.ProofFilePath);
        }

        public async Task<Result<(string PhysicalPath, string ContentType, string FileName)>> DownloadDocumentAsync(int documentId, int collegeId)
        {
            var document = await _context.CollegeDocuments
                .AsNoTracking()
                .FirstOrDefaultAsync(cd => cd.Id == documentId && cd.CollegeId == collegeId);

            if (document == null || string.IsNullOrWhiteSpace(document.FilePath))
            {
                return Error.NotFound(ErrorCodes.DocumentNotFound, "College document not found.");
            }

            return await _filesService.DownloadFileAsync(document.FilePath);
        }

        public async Task<Result<List<CollegeDocumentDto>>> GetDocumentsAsync(int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "User is not authorized for this college.");
            }

            var college = await _context.Colleges.FindAsync(collegeId);
            if (college == null)
            {
                return Error.NotFound(ErrorCodes.CollegeNotFound, "College not found.");
            }

            var documents = await _context.CollegeDocuments
                .AsNoTracking()
                .Where(cd => cd.CollegeId == collegeId)
                .OrderByDescending(cd => cd.UploadedAt)
                .Select(cd => new CollegeDocumentDto
                {
                    Id = cd.Id,
                    Title = cd.Title,
                    FilePath = cd.FilePath,
                    CollegeId = cd.CollegeId,
                    CollegeName = college.CollegeName,
                    UploadedAt = cd.UploadedAt
                })
                .ToListAsync();

            return documents;
        }

        private async Task<bool> IsUserCollegeRepresentativeAsync(int userId, int collegeId)
        {
            var college = await _context.Colleges
                .Include(c => c.CollegeRepresentatives)
                .FirstOrDefaultAsync(c => c.Id == collegeId);
            if (college == null)
            {
                return false;
            }
            return college.CollegeRepresentatives.Any(r => r.UserId == userId);
        }
    }
}
