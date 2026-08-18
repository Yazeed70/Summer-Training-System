using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using summer_training_app.Common.Results;
using summer_training_app.DTOs.Reports;

namespace summer_training_app.Services.Interfaces
{
    public interface IReportsService
    {
        Task<Result<Guid>> CreateReportTemplateAsync(SaveTemplateDto reportDto, int userId);
        Task<Result<List<StudentReportSummaryDto>>> GetMyReportsAsync(int userId);
        Task<Result<Guid>> SubmitReportAsync(SubmitReportDto submissionDto, int userId);
        Task<Result<List<CompanyStudentReportDto>>> GetCompanyReportsAsync(int userId);
        Task<Result<List<CollegeReportTemplateDto>>> GetCollegeTemplatesAsync(int userId);
        Task<Result<List<CollegeReportTemplateDto>>> GetCompanyTemplatesAsync(int userId);
        Task<Result> EvaluateReportAsync(EvaluateReportDto evalDto, int supervisorId);
        Task<Result> DeleteTemplateAsync(Guid templatePublicId, int userId);
        Task<Result> UpdateTemplateAsync(SaveTemplateDto updateDto, int userId);
        Task<Result<TemplateDetailsDto>> GetTemplateDetailsAsync(Guid templatePublicId, int userId);
        Task<Result<List<CollegeStudentReportDto>>> GetCollegeReportsAsync(int userId);
        Task<Result<StudentReportDetailsDto>> GetStudentReportDetailsAsync(Guid studentReportPublicId, int userId);
        Task<Result> DeleteStudentReportAsync(Guid studentReportPublicId, int userId);
    }
}
