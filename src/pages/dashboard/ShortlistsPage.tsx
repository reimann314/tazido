import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken } from "../../lib/auth";
import type { Id } from "../../../convex/_generated/dataModel";
import { Bookmark, X, FileText, ExternalLink, GraduationCap, BookOpen } from "lucide-react";
import { TableSkeleton } from "../../components/LoadingSkeletons";
import StudentProfileView from "./StudentProfileView";

export default function ShortlistsPage() {
  const token = getToken() ?? "";
  const items = useQuery(api.shortlists.list, token ? { token } : "skip");
  const removeItem = useMutation(api.shortlists.remove);
  const [selectedStudentId, setSelectedStudentId] = useState<Id<"users"> | null>(null);

  if (selectedStudentId) {
    return (
      <StudentProfileView
        studentId={selectedStudentId}
        onBack={() => setSelectedStudentId(null)}
      />
    );
  }

  if (!items) return <TableSkeleton rows={4} />;

  return (
    <div>
      <h1 className="text-h2 mb-2">القائمة المختصرة</h1>
      <p className="text-text-secondary mb-8">الطلاب الذين حفظتهم لمراجعتهم لاحقاً.</p>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
          <Bookmark size={48} className="mx-auto mb-4 text-text-muted" />
          <p className="text-text-secondary font-medium mb-1">القائمة فارغة</p>
          <p className="text-sm text-text-muted">ابحث عن الطلاب وأضفهم إلى القائمة المختصرة لمراجعتهم لاحقاً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-border-light p-5 hover:border-brand/30 transition-all cursor-pointer"
              onClick={() => setSelectedStudentId(item.studentId)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary mb-1">{item.studentName}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary mb-2">
                    {item.specialization && (
                      <span className="flex items-center gap-1">
                        <GraduationCap size={14} />
                        {item.specialization}
                      </span>
                    )}
                    {item.university && (
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} />
                        {item.university}
                      </span>
                    )}
                    {item.academicLevel && (
                      <span>{item.academicLevel === "university" ? "جامعي" : "ثانوي"}</span>
                    )}
                  </div>
                  {item.note && (
                    <p className="text-xs text-text-muted bg-surface rounded-lg px-3 py-2 inline-block">
                      {item.note}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.cvUrl && (
                    <a
                      href={item.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-xs font-medium hover:bg-brand/20 transition-colors"
                    >
                      <FileText size={14} />
                      <span>CV</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try { await removeItem({ token, shortlistId: item._id }); } catch { console.debug("remove shortlist error"); }
                    }}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="إزالة"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
