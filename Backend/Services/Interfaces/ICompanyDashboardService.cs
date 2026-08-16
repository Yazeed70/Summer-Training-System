using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Shared;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace summer_training_app.Services.Interfaces
{
    public interface ICompanyDashboardService
    {
        Task<(List<CompanyStudentsListDto>? Data, ApiErrorResponseDTO? Error)> GetCompanyStudentsAsync(int companyId, int userId);
        Task<(StudentProfileResponseDto? Data, ApiErrorResponseDTO? Error)> GetStudentProfileAsync(Guid studentPublicId, int companyId);
        Task<(CompanyDetailsDto? Data, ApiErrorResponseDTO? Error)> GetCompanyProfileAsync(int companyId);
        Task<ApiErrorResponseDTO?> AddCompanyRepresentativeAsync(int userId, int companyId, int currentUserId);
        Task<ApiErrorResponseDTO?> UpdateCompanyAsync(CreateCompanyDto dto, int companyId, int userId);
        Task<ApiErrorResponseDTO?> DeleteCompanyAsync(int companyId, int userId);
        Task<(Guid? NewPublicId, ApiErrorResponseDTO? Error)> LinkCompanyStudentAsync(CreateTrainingRecordDto dto, int companyId, int userId);
        Task<ApiErrorResponseDTO?> UnlinkCompanyStudentAsync(Guid studentPublicId, int companyId, int userId);
    }
}
