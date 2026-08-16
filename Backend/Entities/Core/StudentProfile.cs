using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using summer_training_app.Entities.Reports;

namespace summer_training_app.Entities.Core
{
    public class StudentProfile
    {
        [Key]
        public int UserId { get; set; } // PK & FK
        [ForeignKey("UserId")]
        public User User { get; set; }

        [Required]
        public int CollegeId { get; set; } // FK
        [ForeignKey("CollegeId")]
        public College College { get; set; }


        [StringLength(20)]
        public string? UniversityIdNumber { get; set; }
        [StringLength(50)]
        public string? Major { get; set; }
        
        public decimal? GPA { get; set; }

        public ICollection<TrainingRecord> TrainingRecords { get; set; } = new List<TrainingRecord>();
        public ICollection<StudentReport> StudentReports { get; set; } = new List<StudentReport>();
        public ICollection<TrainingRequest> TrainingRequests { get; set; } = new List<TrainingRequest>();
    }
}
