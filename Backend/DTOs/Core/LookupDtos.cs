namespace summer_training_app.DTOs.Core
{
    public class CompanyLookupDto
    {
        public int Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
    }

    public class RoleLookupDto
    {
        public int Id { get; set; }
        public string RoleName { get; set; } = string.Empty;
    }

    public class CollegeLookupDto
    {
        public int Id { get; set; }
        public string CollegeName { get; set; } = string.Empty;
    }
}
