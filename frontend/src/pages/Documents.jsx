import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import {
  Trash2,
  Search as SearchIcon,
  AlertCircle,
  Upload,
} from "lucide-react";
import {
  paperAPI,
  textbookAPI,
  studyNoteAPI,
} from "../services/document.api";

export const Documents = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("papers");
  const [papers, setPapers] = useState([]);
  const [textbooks, setTextbooks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [activeTab]);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-dismiss success after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "papers") {
        const response = await paperAPI.getUserPapers(0, 100);
        setPapers(response || []);
      } else if (activeTab === "textbooks") {
        const response = await textbookAPI.getUserTextbooks(0, 100);
        setTextbooks(response || []);
      } else if (activeTab === "notes") {
        const response = await studyNoteAPI.getUserStudyNotes(0, 100);
        setNotes(response || []);
      }
    } catch (err) {
      setError(`Failed to load ${activeTab}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      if (activeTab === "papers") {
        await paperAPI.delete(id);
        setPapers(papers.filter((p) => p.id !== id));
      } else if (activeTab === "textbooks") {
        await textbookAPI.delete(id);
        setTextbooks(textbooks.filter((t) => t.id !== id));
      } else if (activeTab === "notes") {
        await studyNoteAPI.delete(id);
        setNotes(notes.filter((n) => n.id !== id));
      }
      setDeleteConfirm(null);
      setError(null); // Clear any previous errors
      setSuccess("Document deleted successfully!");
    } catch (err) {
      setError("Failed to delete document");
      console.error(err);
      setDeleteConfirm(null); // Still close dialog on error
    } finally {
      setDeleting(false);
    }
  };

  const filterDocuments = (documents) => {
    if (!searchQuery.trim()) {
      return documents;
    }

    const query = searchQuery.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        (doc.description && doc.description.toLowerCase().includes(query))
    );
  };

  const paperTypes = {
    past_paper: "📜 Past Paper",
    provisional_paper: "📋 Provisional Paper",
    school_paper: "🏫 School Paper",
    model_paper: "⭐ Model Paper",
    other: "📄 Other",
  };

  const DocumentCard = ({ item, type }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="border p-4 rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground line-clamp-2">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {type === "paper" && item.paper_type && (
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium">
                {paperTypes[item.paper_type] || item.paper_type}
              </span>
            )}
            {item.exam_year && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                {item.exam_year}
              </span>
            )}
            {item.part && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
                Part {item.part}
              </span>
            )}
            {item.lesson && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                {item.lesson}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {new Date(item.created_at).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/paper/${item.id}`)}
              className="text-sm border text-muted-foreground rounded-lg hover:text-foreground"
            >
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(item.id)}
              className="text-sm border text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            My{" "}
            <span className="text-amber-600 dark:text-amber-500">
              Documents
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your donated study materials
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 flex items-start gap-3">
            <div className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400">✓</div>
            <div>{success}</div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold mb-4">Delete Document?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this document? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-2 border-b border-border overflow-x-auto">
          {[
            { id: "papers", label: "Papers", count: papers.length },
            {
              id: "textbooks",
              label: "Textbooks",
              count: textbooks.length,
            },
            {
              id: "notes",
              label: "Study Notes",
              count: notes.length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-amber-600 text-amber-600 dark:text-amber-500"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}{" "}
              <span className="text-xs ml-2">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-border rounded-lg bg-background text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-muted-foreground"
              />
            </div>
            <Button
              onClick={() => navigate("/donate")}
              className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload New
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-amber-600 border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your documents...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          ((activeTab === "papers" && filterDocuments(papers).length === 0) ||
            (activeTab === "textbooks" &&
              filterDocuments(textbooks).length === 0) ||
            (activeTab === "notes" && filterDocuments(notes).length === 0)) && (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">No documents yet</p>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "No documents match your search"
                  : `You haven't uploaded any ${activeTab} yet. Share your study materials!`}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => navigate("/donate")}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
              )}
            </div>
          )}

        {/* Document Grid */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {activeTab === "papers" &&
              filterDocuments(papers).map((paper) => (
                <DocumentCard key={paper.id} item={paper} type="paper" />
              ))}
            {activeTab === "textbooks" &&
              filterDocuments(textbooks).map((textbook) => (
                <DocumentCard
                  key={textbook.id}
                  item={textbook}
                  type="textbook"
                />
              ))}
            {activeTab === "notes" &&
              filterDocuments(notes).map((note) => (
                <DocumentCard key={note.id} item={note} type="note" />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
