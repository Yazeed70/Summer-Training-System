using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.DTOs.Auth;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Shared;

namespace summer_training_app.Services.Interfaces
{
    public interface IAdminDashboardService
    {
        Task<AdminDashboardStatsDto> GetStatsAsync();
        Task<List<AdminUserListItemDto>> GetAllUsersAsync();
        Task<List<AdminUserListItemDto>> GetAllCollegeRepsAsync();
        Task<List<AdminUserListItemDto>> GetAllCompanyRepsAsync();
        Task<(string? NewStatus, ApiErrorResponseDTO? Error)> ToggleUserStatusAsync(Guid userPublicId, int currentUserId);
        Task<ApiErrorResponseDTO?> CreateCollegeRepAsync(CreateCollegeRepDto dto);
        Task<ApiErrorResponseDTO?> CreateCompanyRepAsync(CreateCompanyRepDto dto);
        Task<(int CompanyId, ApiErrorResponseDTO? Error)> CreateCompanyAsync(CreateCompanyDto dto, int currentUserId);
        Task<(CompanyDetailsDto? Data, ApiErrorResponseDTO? Error)> GetCompanyByIdAsync(int id);
        Task<ApiErrorResponseDTO?> UpdateCompanyAsync(int id, CreateCompanyDto dto);
        Task<ApiErrorResponseDTO?> ToggleCompanyStatusAsync(int id);
        Task<ApiErrorResponseDTO?> ApproveCompanyAsync(int id, int currentUserId);
        Task<ApiErrorResponseDTO?> DeleteCompanyAsync(int id);
        Task<(int CollegeId, ApiErrorResponseDTO? Error)> CreateCollegeAsync(CreateCollegeDto dto);
        Task<(CollegeDetailsDto? Data, ApiErrorResponseDTO? Error)> GetCollegeByIdAsync(int id);
        Task<ApiErrorResponseDTO?> UpdateCollegeAsync(int id, CreateCollegeDto dto);
        Task<ApiErrorResponseDTO?> ToggleCollegeStatusAsync(int id);
        Task<ApiErrorResponseDTO?> DeleteCollegeAsync(int id);
        Task<List<PendingCompanyRequestDto>> GetPendingCompanyRequests();
        Task<UpgradeRequestDetailsDto?> GetUpgradeRequestByIdAsync(Guid publicId);
        Task<List<UpgradeRequestsListDto>> GetUpgradeRequestsAsync();
        Task<ApiErrorResponseDTO?> ApproveUpgradeRequestAsync(Guid publicId, int reviewerUserId);
        Task<ApiErrorResponseDTO?> RejectUpgradeRequestAsync(Guid publicId, string? comment, int reviewerUserId);
        Task<(string? PhysicalPath, string? ContentType, string? FileName, ApiErrorResponseDTO? Error)> GetProofFileAsync(Guid publicId);
        Task<(AdminUserDetailsDto? Data, ApiErrorResponseDTO? Error)> GetUserDetailsAsync(Guid publicId);
        Task<ApiErrorResponseDTO?> AdminResetUserPasswordAsync(Guid publicId, AdminResetPasswordDto dto);
        Task<List<CompaniesListDto>> GetAllCompaniesAsync();
        Task<List<CollegesListDto>> GetAllCollegesAsync();
    }
}
