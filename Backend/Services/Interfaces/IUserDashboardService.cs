using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.DTOs.Auth;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Shared;

namespace summer_training_app.Services.Interfaces
{
    public interface IUserDashboardService
    {
        Task<(UserProfileResponseDto? Data, ApiErrorResponseDTO? Error)> GetUserProfileAsync(int userId);
        Task<ApiErrorResponseDTO?> UpdateUserProfileAsync(UpdateProfileDto dto, int userId);
        Task<ApiErrorResponseDTO?> SubmitUpgradeRequestAsync(UpgradeRoleDto dto, int userId);
        Task<ApiErrorResponseDTO?> CancelUpgradeRequestAsync(Guid requestPublicId, int userId);
        Task<(UpgradeRequestDetailsDto? Data, ApiErrorResponseDTO? Error)> GetMyUpgradeRequestStatusAsync(int userId);
        Task<(List<UpgradeRequestDetailsDto>? Data, ApiErrorResponseDTO? Error)> GetMyUpgradeHistoryAsync(int userId);
        Task<List<CollegesListDto>> GetAllCollegesDetailsAsync();
        Task<List<CompaniesListDto>> GetAllCompaniesDetailsAsync();
        Task<(string? PhysicalPath, string? ContentType, string? FileName, ApiErrorResponseDTO? Error)> GetMyProofFileAsync(Guid publicId, int userId);
    }
}
