using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace InterviewPrep.API.Services;

public class ResumeParserService
{
    private readonly ILogger<ResumeParserService> _logger;

    public ResumeParserService(ILogger<ResumeParserService> logger)
    {
        _logger = logger;
    }

    public string ExtractTextFromPdf(string filePath)
    {
        try
        {
            using var document = PdfDocument.Open(filePath);
            var sb = new System.Text.StringBuilder();

            foreach (Page page in document.GetPages())
            {
                sb.AppendLine(page.Text);
            }

            var result = sb.ToString().Trim();
            _logger.LogInformation("Extracted {Chars} chars from PDF: {File}", result.Length, filePath);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to extract text from PDF: {File}", filePath);
            return string.Empty;
        }
    }

    public string TruncateForPrompt(string text, int maxChars = 3000)
    {
        if (text.Length <= maxChars) return text;
        return text[..maxChars] + "\n[Resume truncated for brevity...]";
    }
}
