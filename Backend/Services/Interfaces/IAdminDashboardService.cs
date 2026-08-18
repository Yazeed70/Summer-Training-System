using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.Common.Results;
using summer_training_app.DTOs.Auth;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;

namespace summer_training_app.Services.Interfaces
{
    public interface IAdminDashboardService
    {
        Task<AdminDashboardStatsDto> GetStatsAsync();
        Task<List<AdminUserListItemDto>> GetAllUsersAsync();
        Task<List<AdminUserListItemDto>> GetAllCollegeRepsAsync();
        Task<List<AdminUserListItemDto>> GetAllCompanyRepsAsync();
        Task<Result<string>> ToggleUserStatusAsync(Guid userPublicId, int currentUserId);
        Task<Result> CreateCollegeRepAsync(CreateCollegeRepDto dto);
        Task<Result> CreateCompanyRepAsync(CreateCompanyRepDto dto);
        Task<Result<int>> CreateCompanyAsync(CreateCompanyDto dto, int currentUserId);
        Task<Result<CompanyDetailsDto>> GetCompanyByIdAsync(int id);
        Task<Result> UpdateCompanyAsync(int id, CreateCompanyDto dto);
        Task<Result> ToggleCompanyStatusAsync(int id);
        Task<Result> ApproveCompanyAsync(int id, int currentUserId);
        Task<Result> DeleteCompanyAsync(int id);
        Task<Result<int>> CreateCollegeAsync(CreateCollegeDto dto);
        Task<Result<CollegeDetailsDto>> GetCollegeByIdAsync(int id);
        Task<Result> UpdateCollegeAsync(int id, CreateCollegeDto dto);
        Task<Result> ToggleCollegeStatusAsync(int id);
        Task<Result> DeleteCollegeAsync(int id);
        Task<List<PendingCompanyRequestDto>> GetPendingCompanyRequests();
        Task<Result<UpgradeRequestDetailsDto>> GetUpgradeRequestByIdAsync(Guid publicId);
        Task<List<UpgradeRequestsListDto>> GetUpgradeRequestsAsync();
        Task<Result> ApproveUpgradeRequestAsync(Guid publicId, int reviewerUserId);
        Task<Result> RejectUpgradeRequestAsync(Guid publicId, string? comment, int reviewerUserId);
        Task<Result<(string PhysicalPath, string ContentType, string FileName)>> GetProofFileAsync(Guid publicId);
        Task<Result<AdminUserDetailsDto>> GetUserDetailsAsync(Guid publicId);
        Task<Result> AdminResetUserPasswordAsync(Guid publicId, AdminResetPasswordDto dto);
        Task<List<CompaniesListDto>> GetAllCompaniesAsync();
        Task<List<CollegesListDto>> GetAllCollegesAsync();
    }
}
