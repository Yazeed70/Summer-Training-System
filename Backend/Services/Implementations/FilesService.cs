using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using summer_training_app.Common.Constants;
using summer_training_app.Data;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Shared;
using summer_training_app.Entities.Core;
using summer_training_app.Services.Interfaces;

namespace summer_training_app.Services.Implementations
{
    public class FilesService : IFilesService
    {
        private readonly IWebHostEnvironment _environment;

        public FilesService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<((string FilePath, string OriginalName)? Data, ApiErrorResponseDTO? Error)> UploadFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.InvalidFileType,
                    DevMessage = "Please select a valid file."
                });
            }

            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (file.Length > FileSettings.maxFileSize || !FileSettings.allowedExtensions.Contains(fileExtension))
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.InvalidFileTypeOrTooLarge,
                    DevMessage = FileSettings.errorMessage
                });
            }
            var relativeFolder = Path.Combine("Uploads", folderName);
            var absoluteFolder = Path.Combine(_environment.ContentRootPath, relativeFolder);

            if (!Directory.Exists(absoluteFolder))
                Directory.CreateDirectory(absoluteFolder);

            var storedFileName = Guid.NewGuid().ToString() + fileExtension;
            var absoluteFilePath = Path.Combine(absoluteFolder, storedFileName);

            using (var stream = new FileStream(absoluteFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeFilePath = Path.Combine(relativeFolder, storedFileName).Replace("\\", "/");

            return ((relativeFilePath, file.FileName), null);

        }

        public async Task<((string PhysicalPath, string ContentType, string FileName)? Data, ApiErrorResponseDTO? Error)> DownloadFileAsync(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.InvalidFilePath,
                    DevMessage = "Invalid file path."
                });
            }

            var normalizedPath = filePath.TrimStart('/', '\\').Replace("/", Path.DirectorySeparatorChar.ToString());
            var absoluteFilePath = Path.GetFullPath(Path.Combine(_environment.ContentRootPath, normalizedPath));

            if (!absoluteFilePath.StartsWith(Path.GetFullPath(_environment.ContentRootPath), StringComparison.OrdinalIgnoreCase))
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.InvalidFilePath,
                    DevMessage = "Access to the specified file path is restricted."
                });
            }

            if (!File.Exists(absoluteFilePath))
            {
                return (null, new ApiErrorResponseDTO
                {
                    Code = ErrorCodes.FileNotFound,
                    DevMessage = "File not found on the server."
                });
            }

            var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(absoluteFilePath, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            var fileName = Path.GetFileName(absoluteFilePath);

            return ((absoluteFilePath, contentType, fileName), null);
        }

        public async Task DeleteFile(string relativeFilePath)
        {
            if (string.IsNullOrWhiteSpace(relativeFilePath)) 
                return;

            var absolutePath = Path.Combine(_environment.ContentRootPath, relativeFilePath);

            if (File.Exists(absolutePath))
            {
                File.Delete(absolutePath);
            }
        }
    }
}
