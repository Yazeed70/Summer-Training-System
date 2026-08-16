using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.DTOs.Reports;
using summer_training_app.DTOs.Shared;

namespace summer_training_app.Services.Interfaces
{
    public interface IReportsService
    {
        Task<(Guid ReportTemplatePublicId, ApiErrorResponseDTO? Error)> CreateReportTemplateAsync(SaveTemplateDto reportDto, int userId);
        Task<(List<StudentReportSummaryDto>? Data, ApiErrorResponseDTO? Error)> GetMyReportsAsync(int userId);
        Task<(Guid StudentReportPublicId, ApiErrorResponseDTO? Error)> SubmitReportAsync(SubmitReportDto submissionDto, int userId);
        Task<(List<CompanyStudentReportDto>? Data, ApiErrorResponseDTO? Error)> GetCompanyReportsAsync(int userId);
        Task<(List<CollegeReportTemplateDto>? Data, ApiErrorResponseDTO? Error)> GetCollegeTemplatesAsync(int userId);
        Task<(List<CollegeReportTemplateDto>? Data, ApiErrorResponseDTO? Error)> GetCompanyTemplatesAsync(int userId);
        Task<ApiErrorResponseDTO?> EvaluateReportAsync(EvaluateReportDto evalDto, int supervisorId);
        Task<ApiErrorResponseDTO?> DeleteTemplateAsync(Guid templatePublicId, int userId);
        Task<ApiErrorResponseDTO?> UpdateTemplateAsync(SaveTemplateDto updateDto, int userId);
        Task<(TemplateDetailsDto? Data, ApiErrorResponseDTO? Error)> GetTemplateDetailsAsync(Guid templatePublicId, int userId);
        Task<(List<CollegeStudentReportDto>? Data, ApiErrorResponseDTO? Error)> GetCollegeReportsAsync(int userId);
    }
}
