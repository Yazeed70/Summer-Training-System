using System.ComponentModel.DataAnnotations;

namespace summer_training_app.DTOs.Auth
{
    public class UpgradeRoleDto
    {
        [Required(ErrorMessage = "Requested role ID is required")]
        public int RequestedRoleId { get; set; }

        //[Required(ErrorMessage = "College selection is required")]
        public int? CollegeId { get; set; }
        public int? CompanyId { get; set; }


        [Required(ErrorMessage = "Official email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address format")]
        public string OfficialEmail { get; set; } = string.Empty;

        [Required(ErrorMessage = "Proof file is required")]
        public IFormFile ProofFile { get; set; } = null!;
    }
}
