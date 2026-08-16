namespace summer_training_app.Common.Constants
{
    public static class FileSettings
    {
        public static readonly string[] allowedExtensions = new[] { ".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx", ".xls", ".xlsx" };

        public static readonly long maxFileSize = 10 * 1024 * 1024; // 10 MB

        public static readonly string errorMessage = $"Invalid file. Allowed extensions: {string.Join(", ", allowedExtensions)}. Maximum file size: {maxFileSize / (1024 * 1024)} MB.";
    }
}
