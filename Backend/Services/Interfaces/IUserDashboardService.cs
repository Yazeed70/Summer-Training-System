using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.Common.Results;
using summer_training_app.DTOs.Auth;
using summer_training_app.DTOs.Dashboard;

namespace summer_training_app.Services.Interfaces
{
    public interface IUserDashboardService
    {
        Task<Result<UserProfileResponseDto>> GetUserProfileAsync(int userId);
        Task<Result> UpdateUserProfileAsync(UpdateProfileDto dto, int userId);
        Task<Result> SubmitUpgradeRequestAsync(UpgradeRoleDto dto, int userId);
        Task<Result> CancelUpgradeRequestAsync(Guid requestPublicId, int userId);
        Task<Result<UpgradeRequestDetailsDto>> GetMyUpgradeRequestStatusAsync(int userId);
        Task<Result<List<UpgradeRequestDetailsDto>>> GetMyUpgradeHistoryAsync(int userId);
        Task<List<CollegesListDto>> GetAllCollegesDetailsAsync();
        Task<List<CompaniesListDto>> GetAllCompaniesDetailsAsync();
        Task<Result<(string PhysicalPath, string ContentType, string FileName)>> GetMyProofFileAsync(Guid publicId, int userId);
    }
}
