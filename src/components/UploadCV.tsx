import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getToken } from "../lib/auth";
import { Upload, FileText, X, CheckCircle, Loader2, Trash2 } from "lucide-react";

export default function UploadCV() {
  const token = getToken() ?? "";
  const generateUploadUrl = useMutation(api.cv.generateUploadUrl);
  const saveCv = useMutation(api.cv.saveCv);
  const deleteCv = useMutation(api.cv.deleteCv);
  const cvUrl = useQuery(api.cv.getCvUrl, token ? { token } : "skip");

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  const maxSize = 5 * 1024 * 1024;

  const validateFile = (f: File): string | null => {
    if (!allowedTypes.includes(f.type)) return "يرجى رفع ملف PDF أو Word فقط";
    if (f.size > maxSize) return "الملف كبير جداً. الحد الأقصى 5 ميغابايت";
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const err = validateFile(selected);
    if (err) { setError(err); return; }
    setFile(selected);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file || !token) return;
    setUploading(true);
    setError(null);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) throw new Error("فشل رفع الملف");
      const { storageId } = await response.json();
      await saveCv({ token, storageId });
      setDone(true);
      setFile(null);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    try {
      await deleteCv({ token });
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border-light p-6">
      <h3 className="font-bold text-text-primary mb-1">السيرة الذاتية (CV)</h3>
      <p className="text-sm text-text-secondary mb-4">
        ارفع سيرتك الذاتية لتتمكن الشركات من الاطلاع عليها عند التقديم على الوظائف
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {done && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
          <CheckCircle size={16} />
          <span>تم رفع السيرة الذاتية بنجاح</span>
        </div>
      )}

      {cvUrl ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-brand/5 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-brand" />
              <span className="text-sm font-medium text-text-primary">السيرة الذاتية</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors"
              >
                عرض
              </a>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                title="حذف"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : file ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-brand/5 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <FileText size={20} className="text-brand shrink-0" />
              <span className="text-sm text-text-primary truncate">{file.name}</span>
              <span className="text-xs text-text-secondary shrink-0">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
            <button
              onClick={() => { setFile(null); setError(null); }}
              className="p-1 text-text-secondary hover:text-red-500"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60 transition-all"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              <span>{uploading ? "جاري الرفع..." : "رفع الملف"}</span>
            </button>
            <button
              onClick={() => { setFile(null); setError(null); }}
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl border border-border-light text-text-secondary text-sm font-medium hover:bg-surface disabled:opacity-60 transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-brand"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-brand"); }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("border-brand");
            const dropped = e.dataTransfer.files[0];
            if (dropped) {
              const err = validateFile(dropped);
              if (err) { setError(err); return; }
              setFile(dropped);
              setError(null);
            }
          }}
          className="border-2 border-dashed border-border-light rounded-xl p-8 text-center cursor-pointer hover:border-brand/40 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Upload size={32} className="mx-auto mb-3 text-text-secondary" />
          <p className="text-text-primary font-medium mb-1">اضغط لرفع السيرة الذاتية</p>
          <p className="text-xs text-text-secondary">PDF أو Word فقط — حد أقصى 5 ميغابايت</p>
        </div>
      )}
    </div>
  );
}
