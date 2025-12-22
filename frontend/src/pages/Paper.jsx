import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Download,
  ExternalLink,
  ArrowLeft,
  Calendar,
  FileText,
  Tag,
  Share2,
  BookOpen,
  Clock,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { paperAPI, textbookAPI, studyNoteAPI } from "../services/document.api";

export const Paper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPapers, setRelatedPapers] = useState([]);
  const [recentPapers, setRecentPapers] = useState([]);

  useEffect(() => {
    loadPaper();
  }, [id]);

  useEffect(() => {
    if (paper) {
      loadRelatedAndRecentPapers();
    }
  }, [paper]);

  const loadPaper = async () => {
    setLoading(true);
    try {
      const response = await paperAPI.getById(id);
      setPaper(response);
      setError(null);
    } catch (err) {
      setError("Failed to load paper details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedAndRecentPapers = async () => {
    try {
      if (paper.subject_id && paper.grade_id) {
        // Load related papers (same subject and grade)
        const related = await paperAPI.getAll(paper.grade_id, paper.subject_id);
        // Filter out current paper and get up to 5 related
        const filtered = related
          ?.filter((p) => p.id !== paper.id)
          .slice(0, 5) || [];
        setRelatedPapers(filtered);
      }

      // Load recent papers
      const recent = await paperAPI.getAll(null, null, null, 0, 5);
      const filtered = recent?.filter((p) => p.id !== paper.id) || [];
      setRecentPapers(filtered);
    } catch (err) {
      console.error("Failed to load related papers:", err);
    }
  };

  const handleDownload = () => {
    if (paper?.google_drive_url) {
      window.open(paper.google_drive_url, "_blank", "noopener,noreferrer");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: paper?.title,
        text: `Check out this paper: ${paper?.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const paperTypes = {
    past_paper: "📜 Past Paper",
    provisional_paper: "📋 Provisional Paper",
    school_paper: "🏫 School Paper",
    model_paper: "⭐ Model Paper",
    other: "📄 Other",
  };

  const RelatedPaperCard = ({ item }) => (
    <div
      onClick={() => navigate(`/paper/${item.id}`)}
      className="bg-card border border-border rounded-lg p-3 hover:shadow-lg hover:border-amber-500 transition-all cursor-pointer"
    >
      <h4 className="font-semibold text-sm line-clamp-2 mb-2">{item.title}</h4>
      <div className="flex flex-wrap gap-1">
        {item.exam_year && (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs">
            {item.exam_year}
          </span>
        )}
        {item.paper_type && (
          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded text-xs">
            {paperTypes[item.paper_type] || item.paper_type}
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-amber-600 border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading paper...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen bg-background text-foreground py-12">
        <div className="container mx-auto px-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <p className="text-lg font-medium mb-2 text-red-700 dark:text-red-300">
              {error || "Paper not found"}
            </p>
            <p className="text-red-600 dark:text-red-400">
              The paper you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Side - PDF Preview */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* PDF Viewer Container */}
              <div className="bg-gray-900 dark:bg-gray-950 aspect-video flex items-center justify-center relative">
                {/* PDF Preview - Google Drive Embed or Placeholder */}
                {paper.google_drive_url ? (
                  <div className="w-full h-full">
                    <iframe
                      src={`https://drive.google.com/file/d/${
                        extractGoogleDriveId(paper.google_drive_url) || ""
                      }/preview`}
                      className="w-full h-full border-0"
                      allowFullScreen
                      title={paper.title}
                    ></iframe>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>PDF preview not available</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {paper.description && (
                <div className="p-6 border-t border-border">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{paper.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Paper Information */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              {/* Title */}
              <h1 className="text-2xl font-bold mb-4">{paper.title}</h1>

              {/* Tags/Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {paper.paper_type && (
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium">
                    {paperTypes[paper.paper_type] || paper.paper_type}
                  </span>
                )}
                {paper.exam_year && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                    {paper.exam_year}
                  </span>
                )}
                {paper.part && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
                    Part {paper.part}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4 mb-6">
                {paper.grade && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Grade</p>
                      <p className="font-medium">{paper.grade}</p>
                    </div>
                  </div>
                )}

                {paper.subject && (
                  <div className="flex items-start gap-3">
                    <Tag className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Subject</p>
                      <p className="font-medium">{paper.subject}</p>
                    </div>
                  </div>
                )}

                {paper.exam_year && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Exam Year
                      </p>
                      <p className="font-medium">{paper.exam_year}</p>
                    </div>
                  </div>
                )}

                {paper.created_at && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Added on
                      </p>
                      <p className="font-medium">
                        {new Date(paper.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleDownload}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>

                <Button
                  onClick={() =>
                    paper.google_drive_url &&
                    window.open(
                      paper.google_drive_url,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Drive
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Papers Section */}
        {relatedPapers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-600" />
              Related Papers
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {relatedPapers.map((related) => (
                <RelatedPaperCard key={related.id} item={related} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Papers Section */}
        {recentPapers.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-600" />
              Recent Papers
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {recentPapers.map((recent) => (
                <RelatedPaperCard key={recent.id} item={recent} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to extract Google Drive file ID from URL
function extractGoogleDriveId(url) {
  if (!url) return null;

  // Handle various Google Drive URL formats
  const patterns = [
    /\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /([a-zA-Z0-9-_]+)(?:\/|$)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export default Paper;
