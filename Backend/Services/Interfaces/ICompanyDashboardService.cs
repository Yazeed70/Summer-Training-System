using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.Common.Results;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;

namespace summer_training_app.Services.Interfaces
{
    public interface ICompanyDashboardService
    {
        Task<Result<List<CompanyStudentsListDto>>> GetCompanyStudentsAsync(int companyId, int userId);
        Task<Result<StudentProfileResponseDto>> GetStudentProfileAsync(Guid studentPublicId, int companyId);
        Task<Result<CompanyDetailsDto>> GetCompanyProfileAsync(int companyId);
        Task<Result> AddCompanyRepresentativeAsync(int userId, int companyId, int currentUserId);
        Task<Result> UpdateCompanyAsync(CreateCompanyDto dto, int companyId, int userId);
        Task<Result> DeleteCompanyAsync(int companyId, int userId);
        Task<Result<Guid>> LinkCompanyStudentAsync(CreateTrainingRecordDto dto, int companyId, int userId);
        Task<Result> UnlinkCompanyStudentAsync(Guid studentPublicId, int companyId, int userId);
    }
}
