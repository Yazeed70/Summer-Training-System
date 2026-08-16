using System.ComponentModel.DataAnnotations;

namespace summer_training_app.DTOs.Reports
{
    public class StudentAnswerDto
    {
        [Required]
        public int QuestionId { get; set; }

        public string? AnswerValue { get; set; }
        public string? AttachmentPath { get; set; }
    }
}
