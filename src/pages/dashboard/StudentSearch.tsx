import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken } from "../../lib/auth";
import { Search, GraduationCap, BookOpen, FileText, ExternalLink, User } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import StudentProfileView from "./StudentProfileView";

export default function StudentSearch() {
  const token = getToken() ?? "";
  const [specialization, setSpecialization] = useState("");
  const [skills, setSkills] = useState("");
  const [university, setUniversity] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [keyword, setKeyword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<Id<"users"> | null>(null);

  const results = useQuery(
    api.search.searchStudents,
    !token || !submitted ? "skip" : {
      token,
      specialization: specialization || undefined,
      skills: skills || undefined,
      university: university || undefined,
      academicLevel: academicLevel || undefined,
      search: keyword || undefined,
    },
  );

  if (selectedStudentId) {
    return (
      <StudentProfileView
        studentId={selectedStudentId}
        onBack={() => setSelectedStudentId(null)}
      />
    );
  }

  return (
    <div>
      <h1 className="text-h2 mb-2">البحث عن طلاب</h1>
      <p className="text-text-secondary mb-8">ابحث عن الطلاب حسب التخصص والمهارات للعثور على المرشح المناسب.</p>

      <div className="bg-white rounded-2xl border border-border-light p-6 mb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text-primary">التخصص</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="مثال: هندسة برمجيات"
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text-primary">المهارات</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="مثال: Python, React"
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text-primary">الجامعة</label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="اسم الجامعة"
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text-primary">السنة الدراسية</label>
            <select
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand"
            >
              <option value="">الكل</option>
              <option value="university">جامعي</option>
              <option value="high-school">ثانوي</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text-primary">كلمة مفتاحية</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="ابحث بالاسم أو التخصص..."
              className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand"
            />
          </div>
        </div>
        <button
          onClick={() => setSubmitted(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-all"
        >
          <Search size={16} />
          <span>بحث</span>
        </button>
      </div>

      {!submitted ? (
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
          <Search size={48} className="mx-auto mb-4 text-text-muted" />
          <p className="text-text-secondary">استخدم الفلاتر أعلاه للبحث عن الطلاب</p>
        </div>
      ) : results === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border-light p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
          <User size={48} className="mx-auto mb-4 text-text-muted" />
          <p className="text-text-secondary font-medium mb-1">لا توجد نتائج</p>
          <p className="text-sm text-text-muted">حاول تغيير معايير البحث</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary mb-2">{results.length} نتيجة</p>
          {results.map((student) => (
            <div
              key={student._id}
              className="bg-white rounded-2xl border border-border-light p-5 hover:border-brand/30 transition-all cursor-pointer"
              onClick={() => setSelectedStudentId(student._id as Id<"users">)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary mb-1">{student.name || "غير محدد"}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                    {student.specialization && (
                      <span className="flex items-center gap-1">
                        <GraduationCap size={14} />
                        {student.specialization}
                      </span>
                    )}
                    {student.university && (
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} />
                        {student.university}
                      </span>
                    )}
                    {student.academicLevel && (
                      <span>{student.academicLevel === "university" ? "جامعي" : "ثانوي"}</span>
                    )}
                  </div>
                  {student.skills && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                {student.skills.split(/[،,]/).slice(0, 4).map((skill: string) => (
                  <span key={skill} className="px-2.5 py-0.5 rounded-full bg-brand/5 text-brand text-xs">
                    {skill.trim()}
                  </span>
                ))}
                {student.skills.split(/[،,]/).length > 4 && (
                  <span className="text-xs text-text-muted">+{student.skills.split(/[،,]/).length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {student.cvUrl && (
                    <a
                      href={student.cvUrl}
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
                  <span className="text-brand text-xs font-medium">عرض الملف</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
