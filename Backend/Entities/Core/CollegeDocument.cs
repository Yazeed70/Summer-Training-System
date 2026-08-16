using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace summer_training_app.Entities.Core
{
    public class CollegeDocument
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; }

        [Required]
        [StringLength(512)]
        public string FilePath { get; set; } 

        [Required]
        public int CollegeId { get; set; }

        [ForeignKey("CollegeId")]
        public College College { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
