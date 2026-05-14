import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAdminToken } from "../../lib/admin-auth";
import type { Id } from "../../../convex/_generated/dataModel";
import { ArrowRight, Trash2 } from "lucide-react";

export default function AdminUserDetail({ userId, onBack }: { userId: Id<"users">; onBack: () => void }) {
  const token = getAdminToken() ?? undefined;
  const user = useQuery(api.admin.getUserById, { adminToken: token!, userId });
  const updateUser = useMutation(api.admin.updateUser);
  const deleteUser = useMutation(api.admin.deleteUser);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    try {
      await updateUser({
        adminToken: token!,
        userId,
        updates: {
          emailVerified: data.emailVerified === "true",
          name: data.name || undefined,
          companyName: data.companyName || undefined,
          university: data.university || undefined,
          website: data.website || undefined,
          nationalId: data.nationalId || undefined,
          mobileNumber: data.mobileNumber || undefined,
          academicLevel: data.academicLevel || undefined,
          specialization: data.specialization || undefined,
          skills: data.skills || undefined,
          languages: data.languages || undefined,
          hobbies: data.hobbies || undefined,
          experiences: data.experiences || undefined,
          entityType: data.entityType || undefined,
          entityName: data.entityName || undefined,
          commercialRegistration: data.commercialRegistration || undefined,
          activities: data.activities || undefined,
          crValidityDate: data.crValidityDate || undefined,
          companyAge: data.companyAge || undefined,
          contactNumber: data.contactNumber || undefined,
        },
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser({ adminToken: token!, userId });
      onBack();
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    }
  };

  const fields = user.role === "company"
    ? [
        { name: "companyName", label: "اسم الشركة", value: user.companyName },
        { name: "commercialRegistration", label: "السجل التجاري", value: user.commercialRegistration },
        { name: "activities", label: "الأنشطة", value: user.activities },
        { name: "contactNumber", label: "رقم التواصل", value: user.contactNumber },
        { name: "crValidityDate", label: "تاريخ السجل", value: user.crValidityDate },
        { name: "companyAge", label: "عمر الشركة", value: user.companyAge },
        { name: "website", label: "الموقع", value: user.website },
        { name: "entityType", label: "نوع الجهة", value: user.entityType },
        { name: "entityName", label: "اسم الجهة", value: user.entityName },
      ]
    : [
        { name: "name", label: "الاسم", value: user.name },
        { name: "nationalId", label: "السجل المدني", value: user.nationalId },
        { name: "mobileNumber", label: "رقم الجوال", value: user.mobileNumber },
        { name: "university", label: "الجامعة", value: user.university },
        { name: "academicLevel", label: "المستوى", value: user.academicLevel },
        { name: "specialization", label: "التخصص", value: user.specialization },
        { name: "skills", label: "المهارات", value: user.skills },
        { name: "languages", label: "اللغات", value: user.languages },
        { name: "hobbies", label: "الهوايات", value: user.hobbies },
        { name: "experiences", label: "الخبرات", value: user.experiences },
        { name: "entityType", label: "نوع الجهة", value: user.entityType },
        { name: "entityName", label: "اسم الجهة", value: user.entityName },
      ];

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand">
        <ArrowRight size={16} />
        العودة إلى المستخدمين
      </button>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {user.name || user.companyName || "مستخدم"}
          </h3>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                name="emailVerified"
                defaultChecked={user.emailVerified === true}
                value="true"
                className="rounded border-gray-300 text-brand focus:ring-brand"
              />
              مؤكد
            </label>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleDelete} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium">
                  تأكيد الحذف
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium">
                  إلغاء
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800">
                <Trash2 size={14} />
                حذف
              </button>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-400">
          البريد: {user.email} | تاريخ التسجيل: {new Date(user._creationTime).toLocaleDateString("ar-SA")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <label key={f.name} className="block">
              <span className="block text-sm font-medium mb-1 text-gray-700">{f.label}</span>
              <input
                name={f.name}
                defaultValue={f.value ?? ""}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand focus:bg-white"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
