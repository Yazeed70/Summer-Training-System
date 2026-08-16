using System.Collections.Generic;
using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Reports
{
    public class QuestionDto
    {
        public int Id { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public enQuestionType QuestionType { get; set; }
        public bool IsRequired { get; set; }
        public string? OptionsPayload { get; set; }
        public List<string>? Options { get; set; }
        public int Order { get; set; }
    }
}
