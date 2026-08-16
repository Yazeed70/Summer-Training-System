using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Core;

namespace summer_training_app.Data.Configurations
{
    public class CollegeDocumentConfiguration : IEntityTypeConfiguration<CollegeDocument>
    {
        public void Configure(EntityTypeBuilder<CollegeDocument> builder)
        {
            builder.HasKey(cd => cd.Id);

            builder.HasOne(cd => cd.College)
                .WithMany(c => c.Documents)
                .HasForeignKey(cd => cd.CollegeId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(cd => cd.Title).HasColumnType("nvarchar(150)").IsRequired();
            builder.Property(cd => cd.FilePath).HasColumnType("varchar(512)");
            builder.Property(cd => cd.UploadedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");

            builder.HasIndex(cd => cd.CollegeId);
            builder.HasIndex(cd => new { cd.CollegeId, cd.Title }).IsUnique();

            builder.HasQueryFilter(cd => !cd.College.IsDeleted);
        }
    }
}
