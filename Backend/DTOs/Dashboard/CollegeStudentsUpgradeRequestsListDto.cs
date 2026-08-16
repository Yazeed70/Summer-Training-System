using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Dashboard
{
    public class CollegeStudentsUpgradeRequestsListDto
    {
        public Guid PublicId { get; set; }
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public string RequestedRole { get; set; }
        public string CollegeName { get; set; }
        public enRequestStatus Status { get; set; }
        public string FilePath { get; set; }
    }
}
