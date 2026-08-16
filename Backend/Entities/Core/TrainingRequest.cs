using summer_training_app.Entities.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace summer_training_app.Entities.Core
{
    public class TrainingRequest
    {
        [Key]
        public int Id { get; set; }
        [Required]

        public Guid PublicId { get; set; }

        [Required]
        public int StudentId { get; set; }
        [ForeignKey("StudentId")]
        public StudentProfile Student { get; set; }

        public int? CompanyId { get; set; }
        [ForeignKey("CompanyId")]
        public Company Company { get; set; }
        [StringLength(100)]
        public string? SuggestedCompanyName { get; set; }
        [StringLength(512)]

        public string? AcceptanceLetterPath { get; set; } 

        [Required]
        public DateOnly StartDate { get; set; }
       
        [Required]
        public DateOnly EndDate { get; set; }

        //[Required]
        //public int DurationInWeeks { get; set; }
        [Required]
        [StringLength(50)]
        public string AcademicYear { get; set; }
        [Required]
        public enSemesterType Semester { get; set; }

        public enRequestStatus Status { get; set; } = enRequestStatus.Pending;
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
        public int? ReviewedById { get; set; }
        [ForeignKey("ReviewedById")]
        public CollegeRepresentative? ReviewedBy { get; set; }

        public bool IsDeleted { get; set; } = false;

    }
}
