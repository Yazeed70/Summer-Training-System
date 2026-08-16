using System.ComponentModel.DataAnnotations;

namespace summer_training_app.Entities.Core
{
    public class Role
    {
        [Key]
        public int Id { get; set; }

        //[Required]
        //[StringLength(50)]
        public string RoleName { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<RoleUpgradeRequest> RoleUpgradeRequests { get; set; } = new List<RoleUpgradeRequest>();
    }
}
