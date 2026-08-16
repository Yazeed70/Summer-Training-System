using System.ComponentModel.DataAnnotations;

namespace summer_training_app.DTOs.Dashboard
{
    public class UpdateStudentProfileDto
    {
        [StringLength(20)]
        public string? UniversityIdNumber { get; set; }

        [StringLength(50)]
        public string? Major { get; set; }

        [Range(0.0, 5.0)]
        public decimal? GPA { get; set; }
    }
}
