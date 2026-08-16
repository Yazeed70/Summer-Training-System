using System.ComponentModel.DataAnnotations;

namespace summer_training_app.DTOs.Core
{
    public class UploadDocumentDto
    {
        [Required(ErrorMessage = "Document title is required")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Document file is required")]
        public IFormFile File { get; set; } = null!;
    }
}
