using summer_training_app.Entities.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace summer_training_app.DTOs.Reports
{
    public class EvaluateReportDto
    {
        [Required(ErrorMessage = "Student report public ID is required")]
        public Guid StudentReportPublicId { get; set; }

        [Required(ErrorMessage = "Evaluation score is required")]
        public enEvaluationScore Score { get; set; }

        public string? Comments { get; set; }
    }
}
