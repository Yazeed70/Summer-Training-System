using summer_training_app.Entities.Core;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace summer_training_app.Entities.Reports
{
	public class ReportTemplate
	{
        [Key]
        public int Id { get; set; }
        [Required]
        public Guid PublicId { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; }

		public string? Description { get; set; }
        public bool RequiresCompanyEvaluation { get; set; } = true;
        public bool RequiresCollegeEvaluation { get; set; } = true;

		public int? CollegeId { get; set; }

        [ForeignKey("CollegeId")]
        public College? College { get; set; }

        public int? CompanyId { get; set; }
        [ForeignKey("CompanyId")]
        public Company? Company { get; set; }


        public bool IsAvailable { get; set; } = false;

		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

		[Required]
		public int CreatedBy { get; set; }

        [ForeignKey("CreatedBy")]
        public User CreatedByUser { get; set; }

		public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(7); // Default due date is 7 days from creation

        public ICollection<ReportQuestion> Questions { get; set; } = new List<ReportQuestion>();
        public ICollection<StudentReport> StudentReports { get; set; } = new List<StudentReport>();
    }

}
