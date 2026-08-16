using summer_training_app.Entities.Enums;
using summer_training_app.Entities.Reports;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace summer_training_app.Entities.Core
{
    public class TrainingRecord
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public Guid PublicId { get; set; }

        [Required]
        public int StudentId { get; set; }
        [ForeignKey("StudentId")]
        public StudentProfile Student { get; set; }

        [Required]
        public int CompanyId { get; set; }
        [ForeignKey("CompanyId")]
        public Company Company { get; set; }


        // Date of the period of training
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        //[StringLength(10)]
        public string AcademicYear { get; set; } // Exp: "2025-2026"
        public enSemesterType Semester { get; set; }


        // Status of the training record
        public enTrainingStatus Status { get; set; } = enTrainingStatus.NotStarted;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<StudentReport> StudentReports { get; set; } = new List<StudentReport>();
    }
}
