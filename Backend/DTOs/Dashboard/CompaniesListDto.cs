namespace summer_training_app.DTOs.Dashboard
{
    public class CompaniesListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public bool IsApproved { get; set; } = false;
        public bool IsActive { get; set; } = true;

        public int TotalStudents { get; set; } 

    }
}
