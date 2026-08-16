using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Dashboard;
using summer_training_app.DTOs.Reports;
using summer_training_app.DTOs.Shared;

namespace summer_training_app.Services.Interfaces
{
    public interface IStudentDashboardService
    {
        Task<(StudentProfileResponseDto? Data, ApiErrorResponseDTO? Error)> GetMyProfileAsync(int userId);
        Task<ApiErrorResponseDTO?> UpdateMyProfileAsync(UpdateStudentProfileDto dto, int userId);
        Task<(List<StudentTrainingHistoryDto>? Data, ApiErrorResponseDTO? Error)> GetTrainingHistoryAsync(int userId);
        Task<(List<StudentReportSummaryDto>? Data, ApiErrorResponseDTO? Error)> GetReportsSummaryAsync(int userId);
        Task<(List<CollegeAdvisorDto>? Data, ApiErrorResponseDTO? Error)> GetCollegeAdvisorAsync(int userId);
        Task<(List<CollegeDocumentDto>? Data, ApiErrorResponseDTO? Error)> GetCollegeDocumentsAsync(int userId);
        Task<(string? PhysicalPath, string? ContentType, string? FileName, ApiErrorResponseDTO? Error)> GetMyProofFileAsync(Guid publicId, int userId);
        Task<(string? PhysicalPath, string? ContentType, string? FileName, ApiErrorResponseDTO? Error)> DownloadCollegeDocumentAsync(int documentId, int userId);
    }
}
