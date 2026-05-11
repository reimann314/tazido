type AppStatus = "pending" | "reviewed" | "accepted" | "rejected";
type JobStatus = "open" | "closed";

const APP_LABELS: Record<AppStatus, string> = {
  pending: "قيد المراجعة",
  reviewed: "تمت المراجعة",
  accepted: "مقبول",
  rejected: "مرفوض",
};

const APP_COLORS: Record<AppStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const JOB_LABELS: Record<JobStatus, string> = {
  open: "مفتوحة",
  closed: "مغلقة",
};

const JOB_COLORS: Record<JobStatus, string> = {
  open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
};

export function StatusBadge({ status }: { status: AppStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${APP_COLORS[status]}`}
    >
      {APP_LABELS[status]}
    </span>
  );
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${JOB_COLORS[status]}`}
    >
      {JOB_LABELS[status]}
    </span>
  );
}

export const JOB_TYPE_LABELS: Record<"internship" | "full-time" | "part-time", string> = {
  internship: "تدريب",
  "full-time": "دوام كامل",
  "part-time": "دوام جزئي",
};
