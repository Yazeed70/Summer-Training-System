using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace summer_training_app.DTOs.Reports
{
    public class SubmitReportDto
    {
        [Required]
        public Guid TemplatePublicId { get; set; }

        [Required]
        public List<StudentAnswerDto> Answers { get; set; } = new List<StudentAnswerDto>();
    }
}
