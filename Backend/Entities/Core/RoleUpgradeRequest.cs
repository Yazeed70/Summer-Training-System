using summer_training_app.Entities.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace summer_training_app.Entities.Core
{
    public class RoleUpgradeRequest
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public Guid PublicId { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        public int RequestedRoleId { get; set; }
        
        [ForeignKey("RequestedRoleId")]
        public Role RequestedRole { get; set; }

        public int? CollegeId { get; set; }
        [ForeignKey("CollegeId")]
        public College? College { get; set; }

        public int? CompanyId { get; set; }
        [ForeignKey("CompanyId")]
        public Company? Company { get; set; }

        public enRequestStatus Status { get; set; } = enRequestStatus.Pending;
        [StringLength(512)]
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string OfficialEmail { get; set; }
        [Required]
        [StringLength(512)]
        public string ProofFilePath { get; set; }

        public DateTime? ReviewedAt { get; set; }
        public int? ReviewedById { get; set; }
        [ForeignKey("ReviewedById")]
        public User? ReviewedBy { get; set; }
    }
}
