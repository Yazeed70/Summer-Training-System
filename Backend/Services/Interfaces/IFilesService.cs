using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using summer_training_app.Common.Results;

namespace summer_training_app.Services.Interfaces
{
    public interface IFilesService
    {
        Task<Result<(string FilePath, string OriginalName)>> UploadFileAsync(IFormFile file, string folderName);
        Task<Result<(string PhysicalPath, string ContentType, string FileName)>> DownloadFileAsync(string filePath);
        Task DeleteFile(string relativeFilePath);
    }
}
