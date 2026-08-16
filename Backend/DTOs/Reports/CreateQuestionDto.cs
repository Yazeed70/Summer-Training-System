using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Reports
{
    public class CreateQuestionDto
    {
        [Required(ErrorMessage = "Question text is required")]
        public string QuestionText { get; set; } = string.Empty;

        [Required(ErrorMessage = "Question type is required")]
        public enQuestionType QuestionType { get; set; }
        public string? OptionsPayload { get; set; } // JSON string for options if QuestionType is multiple-choice
        public List<string>? Options { get; set; }

        public bool IsRequired { get; set; } = false;

        public int Order { get; set; }
    }
}
