using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using summer_training_app.Common.Constants;
using summer_training_app.Common.Results;
using summer_training_app.Data;
using summer_training_app.DTOs.Auth;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Services.Implementations
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly SummerTrainingDBContext _context;
        private readonly IFilesService _filesService;

        public AdminDashboardService(SummerTrainingDBContext context, IFilesService filesService)
        {
            _context = context;
            _filesService = filesService;
        }

        public async Task<AdminDashboardStatsDto> GetStatsAsync()
        {
            var totalStudents = await _context.Users.AsNoTracking().CountAsync(u => u.RoleId == (int)enRoles.Student);
            var totalCompanies = await _context.Companies.AsNoTracking().CountAsync();
            var totalColleges = await _context.Colleges.AsNoTracking().CountAsync();
            var pendingRequests = await _context.RoleUpgradeRequests.AsNoTracking().CountAsync(r => r.Status == enRequestStatus.Pending);
            var pendingCompanies = await _context.Companies.AsNoTracking().CountAsync(c => c.IsApproved == false);
            var activeTrainings = await _context.TrainingRecords.AsNoTracking().CountAsync(t => t.Status == enTrainingStatus.Active);

            return new AdminDashboardStatsDto
            {
                TotalStudents = totalStudents,
                TotalCompanies = totalCompanies,
                TotalColleges = totalColleges,
                RoleUpgradeRequests = pendingRequests,
                PendingCompanies = pendingCompanies,
                ActiveTrainings = activeTrainings
            };
        }

        public async Task<List<AdminUserListItemDto>> GetAllUsersAsync()
        {
            return await _context.Users
                .Include(u => u.Role)
                .AsNoTracking()
                .Where(u => u.IsActive && u.IsDeleted == false)
                .OrderBy(u => u.CreatedAt)
                .IgnoreQueryFilters()
                .Select(u => new AdminUserListItemDto
                {
                    Id = u.PublicId,
                    Username = u.Username,
                    Name = u.Name,
                    Role = u.Role.RoleName,
                    CollegeName = u.StudentProfile == null 
                        ? (u.CollegeRepresentative != null ? u.CollegeRepresentative.College.CollegeName : null) 
                        : u.StudentProfile.College.CollegeName,
                    CompanyName = u.CompanyRepresentative != null ? u.CompanyRepresentative.Company.CompanyName : null,
                    CreatedAt = u.CreatedAt,
                    IsActive = u.IsActive
                })
                .ToListAsync();
        }
        
        public async Task<List<AdminUserListItemDto>> GetAllCollegeRepsAsync()
        {
            return await _context.Users
                .AsNoTracking()
                .Where(u => u.RoleId == (int)enRoles.CollegeRep)
                .Select(u => new AdminUserListItemDto
                {
                    Id = u.PublicId,
                    Username = u.Username,
                    Name = u.Name,
                    CollegeName = u.CollegeRepresentative != null ? u.CollegeRepresentative.College.CollegeName : null,
                    CreatedAt = u.CreatedAt,
                    IsActive = u.IsActive
                })
                .ToListAsync();
        }

        public async Task<List<AdminUserListItemDto>> GetAllCompanyRepsAsync()
        {
            return await _context.Users
                .AsNoTracking()
                .Where(u => u.RoleId == (int)enRoles.CompanyRep)
                .Select(u => new AdminUserListItemDto
                {
                    Id = u.PublicId,
                    Username = u.Username,
                    Name = u.Name,
                    CompanyName = u.CompanyRepresentative != null ? u.CompanyRepresentative.Company.CompanyName : null,
                    CreatedAt = u.CreatedAt,
                    IsActive = u.IsActive
                })
                .ToListAsync();
        }

        public async Task<Result<string>> ToggleUserStatusAsync(Guid userPublicId, int currentUserId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.PublicId == userPublicId);

            if (user == null)
            {
                return Error.NotFound(ErrorCodes.UserNotFound, "User not found.");
            }

            if (user.RoleId == (int)enRoles.SuperAdmin && user.Id == currentUserId)
            {
                return Error.Forbidden(ErrorCodes.CannotModifySuperAdmin, "Cannot modify super admin status.");
            }

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            var status = user.IsActive ? "Active" : "Inactive";
            return status;
        }

        public async Task<Result> CreateCollegeRepAsync(CreateCollegeRepDto dto)
        {
            var college = await _context.Colleges.FirstOrDefaultAsync(c => c.CollegeName == dto.CollegeName);
            if (college == null)
            {
                return Error.Validation(ErrorCodes.InvalidCollegeName, "College Name is required.");
            }

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var newUser = new User
                    {
                        Name = dto.Name,
                        Username = dto.Username,
                        PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(dto.Password, 12),
                        RoleId = (int)enRoles.CollegeRep,
                        IsActive = true
                    };

                    _context.Users.Add(newUser);
                    await _context.SaveChangesAsync();

                    var collegeRep = new CollegeRepresentative
                    {
                        UserId = newUser.Id,
                        CollegeId = college.Id
                    };
                    _context.CollegeRepresentatives.Add(collegeRep);

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
        
        public async Task<Result> CreateCompanyRepAsync(CreateCompanyRepDto dto)
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.CompanyName == dto.CompanyName);
            if (company == null)
            {
                return Error.Validation(ErrorCodes.InvalidCompanyName, "Company Name is required.");
            }

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var newUser = new User
                    {
                        Name = dto.Name,
                        Username = dto.Username,
                        PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(dto.Password, 12),
                        RoleId = (int)enRoles.CompanyRep,
                        IsActive = true
                    };

                    _context.Users.Add(newUser);
                    await _context.SaveChangesAsync();

                    var companyRep = new CompanyRepresentative
                    {
                        UserId = newUser.Id,
                        CompanyId = company.Id
                    };
                    _context.CompanyRepresentatives.Add(companyRep);

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

        public async Task<Result<int>> CreateCompanyAsync(CreateCompanyDto dto, int currentUserId)
        {
            var company = new Company
            {
                CompanyName = dto.Name,
                ContactEmail = dto.ContactEmail,
                CompanyAddress = dto.Address,
                IsDeleted = false,
                CreatedByUserId = currentUserId,
                CreatedAt = DateTime.UtcNow
            };
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return company.Id;
        }

        public async Task<Result<CompanyDetailsDto>> GetCompanyByIdAsync(int id)
        {
            var company = await _context.Companies
                .Include(c => c.TrainingRecords)
                .AsNoTracking()
                .IgnoreQueryFilters()
                .Include(c => c.ApprovedByUser)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (company == null)
            {
                return Error.NotFound(ErrorCodes.CompanyNotFound, "Company not found.");
            }

            return new CompanyDetailsDto
            {
                Id = company.Id,
                Name = company.CompanyName,
                ContactEmail = company.ContactEmail,
                Address = company.CompanyAddress,
                IsApproved = company.IsApproved,
                IsActive = !company.IsDeleted,
                CreatedAt = company.CreatedAt,
                CreatedByUserName = company.ApprovedByUserId != null ? company.ApprovedByUser?.Name : null,
                ApprovedAt = company.ApprovedAt,
                TotalStudents = company.TrainingRecords.Count(s => s.CompanyId == company.Id && s.Status == enTrainingStatus.Active)
            };
        }

        public async Task<Result> UpdateCompanyAsync(int id, CreateCompanyDto dto)
        {
            var company = await _context.Companies.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == id);

            if (company == null)
            {
                return Error.NotFound(ErrorCodes.CompanyNotFound, "Company not found.");
            }

            company.CompanyName = dto.Name;
            company.ContactEmail = dto.ContactEmail;
            company.CompanyAddress = dto.Address;

            await _context.SaveChangesAsync();
            return Result.Success();
        }
        
        public async Task<Result> ToggleCompanyStatusAsync(int id)
        {
            var company = await _context.Companies.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == id);

            if (company == null)
            {
                return Error.NotFound(ErrorCodes.CompanyNotFound, "Company not found.");
            }

            if (!company.IsDeleted)
            {
                bool hasLinkedUsers = await _context.CompanyRepresentatives.AnyAsync(cr => cr.CompanyId == id) ||
                                      await _context.TrainingRecords.AnyAsync(sp => sp.CompanyId == id && sp.Status == enTrainingStatus.Active);
                if (hasLinkedUsers)
                {
                    return Error.Conflict(ErrorCodes.CompanyHasLinkedUsers, "Cannot deactivate this company because it has linked users.");
                }
            }

            company.IsDeleted = !company.IsDeleted;

            await _context.SaveChangesAsync();
            return Result.Success();
        }
        
        public async Task<Result> ApproveCompanyAsync(int id, int currentUserId)
        {
            var user = await _context.Users.FindAsync(currentUserId);
            if (user == null || user.RoleId != (int)enRoles.SuperAdmin)
            {
                return Error.Forbidden(ErrorCodes.UnauthorizedAccess, "Unauthorized to approve company.");
            }

            var company = await _context.Companies.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == id);

            if (company == null || company.IsDeleted)
            {
                return Error.NotFound(ErrorCodes.CompanyNotFound, "Company not found.");
            }

            company.IsApproved = true;
            company.ApprovedByUserId = currentUserId;
            company.ApprovedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result> DeleteCompanyAsync(int id)
        {
            var company = await _context.Companies.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == id);

            if (company == null || company.IsDeleted)
            {
                return Error.NotFound(ErrorCodes.CompanyNotFound, "Company not found.");
            }

            bool hasLinkedUsers = await _context.CompanyRepresentatives.AnyAsync(cr => cr.CompanyId == id);
            if (hasLinkedUsers)
            {
                return Error.Conflict(ErrorCodes.CompanyHasLinkedUsers, "Cannot delete this company because it has linked users.");
            }

            company.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result<int>> CreateCollegeAsync(CreateCollegeDto dto)
        {
            var college = await _context.Colleges.FirstOrDefaultAsync(c => c.CollegeName == dto.Name);
            if (college != null)
            {
                return Error.Conflict(ErrorCodes.DuplicateCollegeName, "College name already exists.");
            }
            
            college = new College
            {
                CollegeName = dto.Name,
                ContactEmail = dto.ContactEmail,
                CollegeAddress = dto.Address ?? string.Empty,
                CreatedAt = DateTime.UtcNow
            };
            _context.Colleges.Add(college);
            await _context.SaveChangesAsync();

            return college.Id;
        }

        public async Task<Result<CollegeDetailsDto>> GetCollegeByIdAsync(int id)
        {
            var college = await _context.Colleges
                .Include(c => c.StudentProfiles)
                .AsNoTracking()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(c => c.Id == id);
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
                IsActive = !college.IsDeleted,
                TotalStudents = college.StudentProfiles.Count()
            };
        }

        public async Task<Result> UpdateCollegeAsync(int id, CreateCollegeDto dto)
        {
            var college = await _context.Colleges.FindAsync(id);

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
        
        public async Task<Result> ToggleCollegeStatusAsync(int id)
        {
            var college = await _context.Colleges.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == id);

            if (college == null)
            {
                return Error.NotFound(ErrorCodes.CollegeNotFound, "College not found.");
            }

            if (!college.IsDeleted)
            {
                bool hasLinkedUsers = await _context.CollegeRepresentatives.AnyAsync(cr => cr.CollegeId == id) ||
                                      await _context.StudentProfiles.AnyAsync(sp => sp.CollegeId == id);
                if (hasLinkedUsers)
                {
                    return Error.Conflict(ErrorCodes.CollegeHasLinkedUsers, "Cannot deactivate this college because it has linked users.");
                }
            }

            college.IsDeleted = !college.IsDeleted;
            await _context.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result> DeleteCollegeAsync(int id)
        {
            var college = await _context.Colleges.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == id);

            if (college == null || college.IsDeleted)
            {
                return Error.NotFound(ErrorCodes.CollegeNotFound, "College not found or already deleted.");
            }

            bool hasLinkedUsers = await _context.CollegeRepresentatives.AnyAsync(cr => cr.CollegeId == id) ||
                                 await _context.StudentProfiles.AnyAsync(sp => sp.CollegeId == id);

            if (hasLinkedUsers)
            {
                return Error.Conflict(ErrorCodes.CollegeHasLinkedUsers, "Cannot delete this college because it has linked users.");
            }

            college.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<List<PendingCompanyRequestDto>> GetPendingCompanyRequests()
        {
            return await _context.Companies
                .AsNoTracking()
                .Where(r => r.IsApproved == false)
                .Select(r => new PendingCompanyRequestDto
                {
                    Id = r.Id,
                    CompanyName = r.CompanyName,
                    CompanyAddress = r.CompanyAddress,
                    CreatedByUsername = r.CreatedByUser != null ? r.CreatedByUser.Name : null,
                    ContactEmail = r.ContactEmail,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<UpgradeRequestsListDto>> GetUpgradeRequestsAsync()
        {
            return await _context.RoleUpgradeRequests
                .Include(r => r.User)
                .Include(r => r.RequestedRole)
                .Include(r => r.College)
                .Include(r => r.Company)
                .AsNoTracking()
                .Select(r => new UpgradeRequestsListDto
                {
                    Id = r.PublicId,
                    UserPublicId = r.User.PublicId,
                    UserName = r.User.Name,
                    RequestedRole = r.RequestedRole.RoleName,
                    CollegeName = r.College != null ? r.College.CollegeName : null,
                    CompanyName = r.Company != null ? r.Company.CompanyName : null,
                    Status = r.Status,
                    FilePath = r.ProofFilePath
                })
                .ToListAsync();
        }

        public async Task<Result<UpgradeRequestDetailsDto>> GetUpgradeRequestByIdAsync(Guid publicId)
        {
            var request = await _context.RoleUpgradeRequests
                .Include(r => r.User)
                .Include(r => r.RequestedRole)
                .Include(r => r.College)
                .Include(r => r.Company)
                .Include(r => r.ReviewedBy)
                .AsNoTracking()
                .Where(r => r.PublicId == publicId)
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

            if (request == null)
            {
                return Error.NotFound(ErrorCodes.UpgradeRequestNotFound, "Upgrade request not found.");
            }

            return request;
        }

        public async Task<Result> ApproveUpgradeRequestAsync(Guid publicId, int reviewerUserId)
        {
            var request = await _context.RoleUpgradeRequests
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.PublicId == publicId);

            if (request == null)
            {
                return Error.NotFound(ErrorCodes.UpgradeRequestNotFound, "Upgrade request not found.");
            }

            if (request.Status != enRequestStatus.Pending)
            {
                return Error.Validation(ErrorCodes.UpgradeRequestAlreadyProcessed, "This upgrade request has already been processed.");
            }

            if (request.RequestedRoleId != (int)enRoles.CollegeRep &&
                request.RequestedRoleId != (int)enRoles.CompanyRep &&
                request.RequestedRoleId != (int)enRoles.Student)
            {
                return Error.Validation(ErrorCodes.InvalidRequestedRole, "Invalid requested role for upgrade.");
            }

            if ((request.RequestedRoleId == (int)enRoles.CollegeRep || request.RequestedRoleId == (int)enRoles.Student) && !request.CollegeId.HasValue)
            {
                return Error.Validation(ErrorCodes.InvalidCollegeId, "Cannot approve: the upgrade request does not specify a College ID.");
            }

            if (request.RequestedRoleId == (int)enRoles.CompanyRep && !request.CompanyId.HasValue)
            {
                return Error.Validation(ErrorCodes.InvalidCompanyId, "Cannot approve: the upgrade request does not specify a Company ID.");
            }

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    request.Status = enRequestStatus.Approved;
                    request.ReviewedAt = DateTime.UtcNow;
                    request.ReviewedById = reviewerUserId;
                    request.User.RoleId = request.RequestedRoleId;
                    request.User.Email = request.OfficialEmail;

                    if (request.RequestedRoleId == (int)enRoles.CollegeRep)
                    {
                        var existingRep = await _context.CollegeRepresentatives.FirstOrDefaultAsync(cr => cr.UserId == request.UserId);
                        if (existingRep == null)
                        {
                            _context.CollegeRepresentatives.Add(new CollegeRepresentative
                            {
                                UserId = request.UserId,
                                CollegeId = request.CollegeId!.Value
                            });
                        }
                        else
                        {
                            existingRep.CollegeId = request.CollegeId!.Value;
                        }
                    }
                    else if (request.RequestedRoleId == (int)enRoles.CompanyRep)
                    {
                        var existingCompanyRep = await _context.CompanyRepresentatives.FirstOrDefaultAsync(cr => cr.UserId == request.UserId);
                        if (existingCompanyRep == null)
                        {
                            _context.CompanyRepresentatives.Add(new CompanyRepresentative
                            {
                                UserId = request.UserId,
                                CompanyId = request.CompanyId!.Value
                            });
                        }
                        else
                        {
                            existingCompanyRep.CompanyId = request.CompanyId!.Value;
                        }
                    }
                    else if (request.RequestedRoleId == (int)enRoles.Student)
                    {
                        var existingStudentProfile = await _context.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == request.UserId);
                        if (existingStudentProfile == null)
                        {
                            _context.StudentProfiles.Add(new StudentProfile
                            {
                                UserId = request.UserId,
                                CollegeId = request.CollegeId!.Value
                            });
                        }
                        else
                        {
                            existingStudentProfile.CollegeId = request.CollegeId!.Value;
                        }
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

        public async Task<Result> RejectUpgradeRequestAsync(Guid publicId, string? comment, int reviewerUserId)
        {
            var request = await _context.RoleUpgradeRequests.FirstOrDefaultAsync(r => r.PublicId == publicId);

            if (request == null)
            {
                return Error.NotFound(ErrorCodes.UpgradeRequestNotFound, "Upgrade request not found.");
            }

            request.Status = enRequestStatus.Rejected;
            request.ReviewedById = reviewerUserId;
            request.ReviewedAt = DateTime.UtcNow;
            request.Comment = comment;
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result<(string PhysicalPath, string ContentType, string FileName)>> GetProofFileAsync(Guid publicId)
        {
            var request = await _context.RoleUpgradeRequests
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.PublicId == publicId);

            if (request == null || string.IsNullOrEmpty(request.ProofFilePath))
            {
                return Error.NotFound(ErrorCodes.FileNotFound, "Request or file not found.");
            }

            return await _filesService.DownloadFileAsync(request.ProofFilePath);
        }

        public async Task<Result<AdminUserDetailsDto>> GetUserDetailsAsync(Guid publicId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.Role)
                .Include(u => u.StudentProfile!).ThenInclude(sp => sp.College)
                .Include(u => u.CollegeRepresentative!).ThenInclude(cr => cr.College)
                .Include(u => u.CompanyRepresentative!).ThenInclude(cr => cr.Company)
                .FirstOrDefaultAsync(u => u.PublicId == publicId);

            if (user == null)
            {
                return Error.NotFound(ErrorCodes.UserNotFound, "User not found.");
            }

            string? collegeName = user.StudentProfile?.College?.CollegeName 
                               ?? user.CollegeRepresentative?.College?.CollegeName;
            string? companyName = user.CompanyRepresentative?.Company?.CompanyName;

            return new AdminUserDetailsDto
            {
                Id = user.PublicId,
                Username = user.Username,
                Name = user.Name,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role != null ? user.Role.RoleName : user.RoleId.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                CollegeName = collegeName,
                CompanyName = companyName
            };
        }

        public async Task<Result> AdminResetUserPasswordAsync(Guid publicId, AdminResetPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.PublicId == publicId);
            if (user == null)
            {
                return Error.NotFound(ErrorCodes.UserNotFound, "User not found.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(dto.NewPassword, 12);
            user.LastUpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<List<CompaniesListDto>> GetAllCompaniesAsync()
        {
            return await _context.Companies
                .Include(c => c.TrainingRecords)
                .AsNoTracking()
                .IgnoreQueryFilters()
                .Include(c => c.ApprovedByUser)
                .Select(c => new CompaniesListDto
                {
                    Id = c.Id,
                    Name = c.CompanyName,
                    Address = c.CompanyAddress,
                    IsApproved = c.IsApproved,
                    IsActive = !c.IsDeleted,
                    TotalStudents = c.TrainingRecords.Count(tr => tr.Status == enTrainingStatus.Active)
                })
                .ToListAsync();
        }

        public async Task<List<CollegesListDto>> GetAllCollegesAsync()
        {
            return await _context.Colleges
                .Include(c => c.StudentProfiles)
                .AsNoTracking()
                .IgnoreQueryFilters()
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
    }
}
