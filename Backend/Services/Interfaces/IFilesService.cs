using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using summer_training_app.DTOs.Core;
using summer_training_app.DTOs.Shared;

namespace summer_training_app.Services.Interfaces
{
    public interface IFilesService
    {
        Task<((string FilePath, string OriginalName)? Data, ApiErrorResponseDTO? Error)> UploadFileAsync(IFormFile file, string folderName);
        Task<((string PhysicalPath, string ContentType, string FileName)? Data, ApiErrorResponseDTO? Error)> DownloadFileAsync(string filePath);
        Task DeleteFile(string relativeFilePath);
    }
}
