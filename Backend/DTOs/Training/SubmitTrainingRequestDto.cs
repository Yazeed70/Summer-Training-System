using System.ComponentModel.DataAnnotations;
using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Training
{
    public class SubmitTrainingRequestDto
    {
        public int? CompanyId { get; set; }
        public string? SuggestedCompanyName { get; set; }
        public string? Comment { get; set; }

        [Required(ErrorMessage = "Start date is required")]
        public DateOnly StartDate { get; set; }
        [Required(ErrorMessage = "End date is required")]
        public DateOnly EndDate { get; set; }

        //[Required(ErrorMessage = "Duration in weeks is required")]
        //public int DurationInWeeks { get; set; }

        [Required(ErrorMessage = "Academic year is required")]
        public string AcademicYear { get; set; } = string.Empty;

        [Required(ErrorMessage = "Semester is required")]
        public enSemesterType Semester { get; set; }

        [Required(ErrorMessage = "Acceptance letter file is required")]
        public IFormFile AcceptanceLetter { get; set; } = null!;
    }
}
