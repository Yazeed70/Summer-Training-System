using Microsoft.EntityFrameworkCore;
using summer_training_app.Common.Constants;
using summer_training_app.Data;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Reports;
using summer_training_app.DTOs.Shared;
using summer_training_app.DTOs.Training;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;
using summer_training_app.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Threading.Tasks;

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

        public async Task<(CollegeDetailsDto? Data, ApiErrorResponseDTO? Error)> GetCollegeProfileAsync(int collegeId)
        {

            var college = await _context.Colleges
                .Include(c => c.StudentProfiles)
                .Include(c => c.Documents)
                .FirstOrDefaultAsync(c => c.Id == collegeId);

            if (college == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.CollegeNotFound,
                    DevMessage = "College not found."
                });
            }

            return (new CollegeDetailsDto
            {
                Id = college.Id,
                Name = college.CollegeName,
                ContactEmail = college.ContactEmail,
                Address = college.CollegeAddress,
                CreatedAt = college.CreatedAt,
                TotalStudents = college.StudentProfiles.Count()
                //Documents = college.Documents.OrderByDescending(d => d.UploadedAt).Select(d => new CollegeDocumentDto
                //{
                //    Id = d.Id,
                //    Title = d.Title,
                //    FilePath = d.FilePath,
                //    CollegeId = college.Id,
                //    CollegeName = college.CollegeName,
                //    UploadedAt = d.UploadedAt
                //}).ToList()
            }, null);
        }

        public async Task<ApiErrorResponseDTO?> UpdateCollegeAsync(CreateCollegeDto dto, int collegeId, int userId)
        {

            if(!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized to update this college."
                };
            }

            var college = await _context.Colleges.FindAsync(collegeId);

            college.CollegeName = dto.Name;
            college.ContactEmail = dto.ContactEmail;
            if (dto.Address != null)
            {
                college.CollegeAddress = dto.Address;
            }

            await _context.SaveChangesAsync();
            return null;
        }

        public async Task<ApiErrorResponseDTO?> DeleteCollegeAsync(int collegeId, int userId)
        {

            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized to update this college."
                };
            }

            var college = await _context.Colleges.FindAsync(collegeId);

            bool hasLinkedUsers = await _context.CollegeRepresentatives.AnyAsync(cr => cr.CollegeId == collegeId) ||
                                  await _context.StudentProfiles.AnyAsync(sp => sp.CollegeId == collegeId);

            if (hasLinkedUsers)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.CollegeHasLinkedUsers,
                    DevMessage = "Cannot delete this college because it has linked users."
                };
            }

            college.IsDeleted = true;
            await _context.SaveChangesAsync();
            return null;
        }

        public async Task<(List<CollegeStudentsListDto>? Data, ApiErrorResponseDTO? Error)> GetCollegeStudentsAsync(int collegeId, int userId)
        {
            if(!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized to view students of this college."
                });
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

            return (students, null);
        }

        public async Task<(StudentProfileResponseDto? Data, ApiErrorResponseDTO? Error)> GetStudentProfileAsync(Guid studentPublicId, int collegeId)
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
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "Student not found or you do not have permission to access this profile."
                });
            }

            return (studentProfile, null);
        }

        public async Task<(Guid? NewPublicId, ApiErrorResponseDTO? Error)> LinkCollegeStudentAsync(Guid userPublicId, int collegeId, int userId)
        {
            if(!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized to link students to this college."
                });
            }

            var user = await _context.Users
                .Include(u => u.StudentProfile)
                .FirstOrDefaultAsync(u => u.PublicId == userPublicId && u.RoleId == (int)enRoles.Student);

            if (user == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "Student user not found."
                });
            }

            if (user.StudentProfile != null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.StudentAlreadyLinked,
                    DevMessage = "This student is already linked to a college."
                });
            }
            
            _context.StudentProfiles.Add(new StudentProfile
            {
                UserId = user.Id,
                CollegeId = collegeId
            });

            await _context.SaveChangesAsync();
            return (user.PublicId, null);
        }

        public async Task<ApiErrorResponseDTO?> UnlinkCollegeStudentAsync(Guid studentPublicId, int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized to unlink students from this college."
                };
            }
            var studentProfile = await _context.StudentProfiles
                .Where(sp => sp.User.PublicId == studentPublicId && sp.CollegeId == collegeId)
                .FirstOrDefaultAsync();


            if (studentProfile == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "Student not found in your college."
                };
            }

            _context.StudentProfiles.Remove(studentProfile);
            await _context.SaveChangesAsync();

            return null;
        }

        public async Task<ApiErrorResponseDTO?> UploadCollegeDocumentAsync(UploadDocumentDto dto, int collegeId, int userId)
        {

            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return  new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.InvalidCollegeId,
                    DevMessage = "You are not associated with a valid college."
                };
            }

            var uploadResult = await _filesService.UploadFileAsync(dto.File, $"Colleges/{collegeId}");

            if (uploadResult.Error != null) return uploadResult.Error;
            
            var document = new CollegeDocument
            {
                Title = dto.Title,
                FilePath = uploadResult.Data.Value.FilePath,
                CollegeId = collegeId,
                UploadedAt = DateTime.UtcNow
            };

            try
            {
                _context.CollegeDocuments.Add(document);
                await _context.SaveChangesAsync();

            }
            catch (Exception ex)
            {
                _filesService.DeleteFile(document.FilePath);
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.DatabaseError,
                    DevMessage = $"An error occurred while saving the document: {ex.Message}"
                };

            }

            return null;
        }

        public async Task<ApiErrorResponseDTO?> DeleteDocumentAsync(int documentId, int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.InvalidCollegeId,
                    DevMessage = "You are not associated with a valid college."
                };
            }

            var document = await _context.CollegeDocuments.FindAsync(documentId);
            if (document == null || document.CollegeId != collegeId) 
                return new ApiErrorResponseDTO 
                {
                    Code = ErrorCodes.DocumentNotFound,
                    DevMessage = "Document not found or does not belong to your college."
                };

            try
            {
                _context.CollegeDocuments.Remove(document);
                await _context.SaveChangesAsync();
                _filesService.DeleteFile(document.FilePath);
            }
            catch (Exception ex)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.DatabaseError,
                    DevMessage = $"An error occurred while deleting the document: {ex.Message}"
                };
            }

            return null;
        }


        public async Task<(List<CollegeStudentsUpgradeRequestsListDto>? Data, ApiErrorResponseDTO? Error)> GetPendingStudentRequestsAsync(int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized for this college."
                });
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

            return (requests, null);
        }
        
        public async Task<(List<CollegeStudentsUpgradeRequestsListDto>? Data, ApiErrorResponseDTO? Error)> GetHandledStudentRequestsAsync(int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized for this college."
                });
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

            return (requests, null);
        }

        public async Task<(UpgradeRequestDetailsDto? Data, ApiErrorResponseDTO? Error)> GetStudentRequestDetailsAsync(Guid requestPublicId, int collegeRepId)
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
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UpgradeRequestNotFound,
                    DevMessage = "Upgrade request not found."
                });
            }

            if (!request.CollegeId.HasValue || !await IsUserCollegeRepresentativeAsync(collegeRepId, request.CollegeId.Value))
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "You are not authorized to view requests for this college."
                });
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

            return (details, null);
        }

        public async Task<ApiErrorResponseDTO?> HandleStudentRequestAsync(Guid requestPublicId, HandleUpgradeRequestDto dto, int collegeRepId)
        {
            var request = await _context.RoleUpgradeRequests
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.PublicId == requestPublicId);

            if (request == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UpgradeRequestNotFound,
                    DevMessage = "Upgrade request not found."
                };
            }

            if (request.RequestedRoleId != (int)enRoles.Student)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.InvalidRequestedRole,
                    DevMessage = "This request is not a student upgrade request."
                };
            }

            if (request.Status != enRequestStatus.Pending)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UpgradeRequestAlreadyProcessed,
                    DevMessage = "This request has already been processed."
                };
            }

            if (!request.CollegeId.HasValue || !await IsUserCollegeRepresentativeAsync(collegeRepId, request.CollegeId.Value))
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "You are not authorized to review requests for this college."
                };
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

            return null;
        }

        public async Task<(string? PhysicalPath, string? ContentType, string? FileName, ApiErrorResponseDTO? Error)> GetProofFileAsync(Guid publicId, int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return (null, null, null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized for this college."
                });
            }

            var request = await _context.RoleUpgradeRequests
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.PublicId == publicId && r.CollegeId == collegeId);

            if (request == null || string.IsNullOrEmpty(request.ProofFilePath))
            {
                return (null, null, null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.FileNotFound,
                    DevMessage = "Request or proof file not found."
                });
            }

            var result = await _filesService.DownloadFileAsync(request.ProofFilePath);
            if (result.Error != null)
            {
                return (null, null, null, result.Error);
            }

            return (result.Data.Value.PhysicalPath, result.Data.Value.ContentType, result.Data.Value.FileName, null);
        }

        public async Task<(string? PhysicalPath, string? ContentType, string? FileName, ApiErrorResponseDTO? Error)> DownloadDocumentAsync(int documentId, int collegeId)
        {
            var document = await _context.CollegeDocuments
                .AsNoTracking()
                .FirstOrDefaultAsync(cd => cd.Id == documentId && cd.CollegeId == collegeId);

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

        public async Task<(List<CollegeDocumentDto>? Data, ApiErrorResponseDTO? Error)> GetDocumentsAsync(int collegeId, int userId)
        {
            if (!await IsUserCollegeRepresentativeAsync(userId, collegeId))
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UnauthorizedAccess,
                    DevMessage = "User is not authorized for this college."
                });
            }

            var college = await _context.Colleges.FindAsync(collegeId);
            if (college == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.CollegeNotFound,
                    DevMessage = "College not found."
                });
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

            return (documents, null);
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
