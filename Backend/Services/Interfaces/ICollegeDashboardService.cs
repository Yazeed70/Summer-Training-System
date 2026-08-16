using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Shared;

namespace summer_training_app.Services.Interfaces
{
    public interface ICollegeDashboardService
    {
        Task<(CollegeDetailsDto? Data, ApiErrorResponseDTO? Error)> GetCollegeProfileAsync(int collegeId);
        Task<ApiErrorResponseDTO?> UpdateCollegeAsync(CreateCollegeDto dto, int collegeId, int userId);
        Task<ApiErrorResponseDTO?> DeleteCollegeAsync(int collegeId, int userId);
        Task<(StudentProfileResponseDto? Data, ApiErrorResponseDTO? Error)> GetStudentProfileAsync(Guid studentPublicId, int collegeId);
        Task<(List<CollegeStudentsListDto>? Data, ApiErrorResponseDTO? Error)> GetCollegeStudentsAsync(int collegeId, int userId);
        Task<(Guid? NewPublicId, ApiErrorResponseDTO? Error)> LinkCollegeStudentAsync(Guid userPublicId, int collegeId, int userId);
        Task<ApiErrorResponseDTO?> UnlinkCollegeStudentAsync(Guid studentPublicId, int collegeId, int userId);

        Task<ApiErrorResponseDTO?> UploadCollegeDocumentAsync(UploadDocumentDto dto, int collegeId, int userId);
        Task<ApiErrorResponseDTO?> DeleteDocumentAsync(int documentId, int collegeId, int userId);

        Task<(List<CollegeStudentsUpgradeRequestsListDto>? Data, ApiErrorResponseDTO? Error)> GetPendingStudentRequestsAsync(int collegeId, int userId);
        Task<(List<CollegeStudentsUpgradeRequestsListDto>? Data, ApiErrorResponseDTO? Error)> GetHandledStudentRequestsAsync(int collegeId, int userId);
        Task<(UpgradeRequestDetailsDto? Data, ApiErrorResponseDTO? Error)> GetStudentRequestDetailsAsync(Guid requestPublicId, int collegeRepId);
        Task<ApiErrorResponseDTO?> HandleStudentRequestAsync(Guid requestPublicId, HandleUpgradeRequestDto dto, int collegeRepId);
        Task<(string? PhysicalPath, string? ContentType, string? FileName, ApiErrorResponseDTO? Error)> GetProofFileAsync(Guid publicId, int collegeId, int userId);
        Task<(string? PhysicalPath, string? ContentType, string? FileName, ApiErrorResponseDTO? Error)> DownloadDocumentAsync(int documentId, int collegeId);
        Task<(List<CollegeDocumentDto>? Data, ApiErrorResponseDTO? Error)> GetDocumentsAsync(int collegeId, int userId);
    }
}
