using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using summer_training_app.Common.Constants;
using summer_training_app.Data;
using summer_training_app.DTOs.Auth;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Shared;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Services.Implementations
{
    public class UserDashboardService : IUserDashboardService
    {
        private readonly SummerTrainingDBContext _context;
        private readonly IFilesService _filesService;
        private readonly IAuthService _authService;

        public UserDashboardService(
            SummerTrainingDBContext context, 
            IFilesService filesService,
            IAuthService authService)
        {
            _context = context;
            _filesService = filesService;
            _authService = authService;
        }

        public async Task<(UserProfileResponseDto? Data, ApiErrorResponseDTO? Error)> GetUserProfileAsync(int userId)
        {
            var userProfile = await _context.Users
                .Include(u => u.Role)
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new UserProfileResponseDto
                {
                    PublicId = u.PublicId,
                    Name = u.Name,
                    Username = u.Username,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    RoleName = u.Role.RoleName,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (userProfile == null)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "User not found."
                });
            }

            return (userProfile, null);
        }

        public async Task<ApiErrorResponseDTO?> UpdateUserProfileAsync(UpdateProfileDto dto, int userId)
        {
            return await _authService.UpdateProfileAsync(dto, userId);
        }

        public async Task<ApiErrorResponseDTO?> SubmitUpgradeRequestAsync(UpgradeRoleDto dto, int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UserNotFound,
                    DevMessage = "User not found."
                };
            }

            if (user.RoleId != (int)enRoles.BasicUser)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.InvalidRole,
                    DevMessage = "Only users with BasicUser role can submit upgrade requests."
                };
            }

            var existingPendingRequest = await _context.RoleUpgradeRequests
                .FirstOrDefaultAsync(r => r.UserId == userId && r.Status == enRequestStatus.Pending);

            if (existingPendingRequest != null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.ExistingPendingRequest,
                    DevMessage = "You already have a pending role upgrade request."
                };
            }

            if (dto.RequestedRoleId == (int)enRoles.Student || dto.RequestedRoleId == (int)enRoles.CollegeRep)
            {
                if (!dto.CollegeId.HasValue)
                {
                    return new ApiErrorResponseDTO
                    {
                        Code = ErrorCodes.CollegeNotFound,
                        DevMessage = "College selection is required for this role upgrade."
                    };
                }

                var collegeExists = await _context.Colleges.AnyAsync(c => c.Id == dto.CollegeId.Value);
                if (!collegeExists)
                {
                    return new ApiErrorResponseDTO
                    {
                        Code = ErrorCodes.CollegeNotFound,
                        DevMessage = "Specified college was not found."
                    };
                }
            }

            if (dto.RequestedRoleId == (int)enRoles.CompanyRep)
            {
                if (!dto.CompanyId.HasValue)
                {
                    return new ApiErrorResponseDTO
                    {
                        Code = ErrorCodes.CompanyNotFound,
                        DevMessage = "Company selection is required for Company Representative role upgrade."
                    };
                }

                var companyExists = await _context.Companies.AnyAsync(c => c.Id == dto.CompanyId.Value);
                if (!companyExists)
                {
                    return new ApiErrorResponseDTO
                    {
                        Code = ErrorCodes.CompanyNotFound,
                        DevMessage = "Specified company was not found."
                    };
                }
            }

            var uploadResult = await _filesService.UploadFileAsync(dto.ProofFile, "role_upgrade_proofs");
            if (uploadResult.Error != null || !uploadResult.Data.HasValue)
            {
                return uploadResult.Error ?? new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.InvalidProofFile,
                    DevMessage = "Failed to upload proof file."
                };
            }

            var relativeFilePath = uploadResult.Data.Value.FilePath;

            var upgradeRequest = new RoleUpgradeRequest
            {
                UserId = userId,
                RequestedRoleId = dto.RequestedRoleId,
                CollegeId = dto.CollegeId,
                CompanyId = dto.CompanyId,
                OfficialEmail = dto.OfficialEmail,
                ProofFilePath = relativeFilePath,
                Status = enRequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                _context.RoleUpgradeRequests.Add(upgradeRequest);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                await _filesService.DeleteFile(relativeFilePath);
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.DatabaseError,
                    DevMessage = $"An error occurred while saving the request: {ex.Message}"
                };
            }

            return null;
        }

        public async Task<ApiErrorResponseDTO?> CancelUpgradeRequestAsync(Guid requestPublicId, int userId)
        {
            var request = await _context.RoleUpgradeRequests
                .FirstOrDefaultAsync(r => r.PublicId == requestPublicId && r.UserId == userId);

            if (request == null)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UpgradeRequestNotFound,
                    DevMessage = "Upgrade request not found or you do not have permission to access it."
                };
            }

            if (request.Status != enRequestStatus.Pending)
            {
                return new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.UpgradeRequestAlreadyProcessed,
                    DevMessage = "Only pending upgrade requests can be canceled."
                };
            }

            request.Status = enRequestStatus.Deleted;
            await _context.SaveChangesAsync();

            return null;
        }

        public async Task<(UpgradeRequestDetailsDto? Data, ApiErrorResponseDTO? Error)> GetMyUpgradeRequestStatusAsync(int userId)
        {
            var latestRequest = await _context.RoleUpgradeRequests
                .Include(r => r.User)
                .Include(r => r.RequestedRole)
                .Include(r => r.College)
                .Include(r => r.Company)
                .Include(r => r.ReviewedBy)
                .AsNoTracking()
                .Where(r => r.UserId == userId && r.Status != enRequestStatus.Deleted)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new UpgradeRequestDetailsDto
                {
                    Id = r.PublicId,
                    StudentPublicId = r.User.PublicId,
                    UserName = r.User.Name,
                    UserEmail = r.User.Email ?? string.Empty,
                    RequestedRole = r.RequestedRole.RoleName,
                    CollegeName = r.College != null ? r.College.CollegeName : null,
                    CompanyName = r.Company != null ? r.Company.CompanyName : null,
                    OfficialEmail = r.OfficialEmail,
                    ProofFilePath = r.ProofFilePath,
                    Status = r.Status,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    ReviewedAt = r.ReviewedAt,
                    ReviewedByName = r.ReviewedBy != null ? r.ReviewedBy.Name : null
                })
                .FirstOrDefaultAsync();

            return (latestRequest, null);
        }

        public async Task<(List<UpgradeRequestDetailsDto>? Data, ApiErrorResponseDTO? Error)> GetMyUpgradeHistoryAsync(int userId)
        {
            var history = await _context.RoleUpgradeRequests
                .Include(r => r.User)
                .Include(r => r.RequestedRole)
                .Include(r => r.College)
                .Include(r => r.Company)
                .Include(r => r.ReviewedBy)
                .AsNoTracking()
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new UpgradeRequestDetailsDto
                {
                    Id = r.PublicId,
                    StudentPublicId = r.User.PublicId,
                    UserName = r.User.Name,
                    UserEmail = r.User.Email ?? string.Empty,
                    RequestedRole = r.RequestedRole.RoleName,
                    CollegeName = r.College != null ? r.College.CollegeName : null,
                    CompanyName = r.Company != null ? r.Company.CompanyName : null,
                    OfficialEmail = r.OfficialEmail,
                    ProofFilePath = r.ProofFilePath,
                    Status = r.Status,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    ReviewedAt = r.ReviewedAt,
                    ReviewedByName = r.ReviewedBy != null ? r.ReviewedBy.Name : null
                })
                .ToListAsync();

            return (history, null);
        }

        public async Task<List<CollegesListDto>> GetAllCollegesDetailsAsync()
        {
            return await _context.Colleges
                .Include(c => c.StudentProfiles)
                .AsNoTracking()
                .Select(c => new CollegesListDto
                {
                    Id = c.Id,
                    Name = c.CollegeName,
                    Address = c.CollegeAddress,
                    IsActive = !c.IsDeleted,
                    TotalStudents = c.StudentProfiles.Count()
                })
                .ToListAsync();
        }

        public async Task<List<CompaniesListDto>> GetAllCompaniesDetailsAsync()
        {
            return await _context.Companies
                .Include(c => c.TrainingRecords)
                .Where(c => c.IsApproved)
                .AsNoTracking()
                .Select(c => new CompaniesListDto
                {
                    Id = c.Id,
                    Name = c.CompanyName,
                    Address = c.CompanyAddress,
                    IsApproved = c.IsApproved,
                    IsActive = !c.IsDeleted,
                    TotalStudents = c.TrainingRecords.Select(tr => tr.Status == enTrainingStatus.Active).Count()
                })
                .ToListAsync();
        }

        public async Task<(string? PhysicalPath, string? ContentType, string? FileName, ApiErrorResponseDTO? Error)> GetMyProofFileAsync(Guid publicId, int userId)
        {
            var request = await _context.RoleUpgradeRequests
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.PublicId == publicId && r.UserId == userId);

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
                return (null, null, null, result.Error);

            return (result.Data.Value.PhysicalPath, result.Data.Value.ContentType, result.Data.Value.FileName, null);
        }
    }
}
