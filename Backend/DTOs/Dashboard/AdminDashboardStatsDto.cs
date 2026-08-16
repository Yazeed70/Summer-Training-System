namespace summer_training_app.DTOs.Dashboard
{
    public class AdminDashboardStatsDto
    {
        public int TotalStudents { get; set; }
        public int TotalCompanies { get; set; }
        public int TotalColleges { get; set; }
        public int RoleUpgradeRequests { get; set; }
        public int PendingCompanies { get; set; }
        public int ActiveTrainings { get; set; }
    }
}
