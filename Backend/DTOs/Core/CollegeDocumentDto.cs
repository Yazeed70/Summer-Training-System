using System;

namespace summer_training_app.DTOs.Core
{
    public class CollegeDocumentDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public int CollegeId { get; set; }
        public string CollegeName { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }
}
