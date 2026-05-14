import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAdminToken } from "../../lib/admin-auth";
import AdminUserDetail from "./AdminUserDetail";

export default function AdminUsers() {
  const token = getAdminToken() ?? undefined;
  const [roleFilter, setRoleFilter] = useState<"" | "student" | "company">("");
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const users = useQuery(api.admin.getUsers, {
    adminToken: token!,
    role: roleFilter || undefined,
    search: search || undefined,
  });

  if (selectedUserId) {
    return (
      <AdminUserDetail
        userId={selectedUserId as any}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالبريد الإلكتروني أو الاسم..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-brand"
        />
        <div className="flex gap-2">
          {(["", "student", "company"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border ${
                roleFilter === r
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand/40"
              }`}
            >
              {r === "" ? "الكل" : r === "student" ? "طلاب" : "شركات"}
            </button>
          ))}
        </div>
      </div>

      {!users ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
          لا يوجد مستخدمين
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الاسم</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">البريد</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">النوع</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">تاريخ التسجيل</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {user.name || user.companyName || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.role === "student"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-violet-50 text-violet-700"
                      }`}>
                        {user.role === "student" ? "طالب" : "شركة"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.emailVerified
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {user.emailVerified ? "مؤكد" : "غير مؤكد"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(user._creationTime).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-4 py-3 text-left">
                      <button
                        onClick={() => setSelectedUserId(user._id)}
                        className="text-brand text-xs font-medium hover:underline"
                      >
                        تفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
