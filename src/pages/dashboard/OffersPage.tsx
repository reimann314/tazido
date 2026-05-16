import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken, useCurrentUser } from "../../lib/auth";
import type { Id } from "../../../convex/_generated/dataModel";
import { Briefcase, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { TableSkeleton } from "../../components/LoadingSkeletons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OfferItem = any;

export default function OffersPage() {
  const token = getToken() ?? "";
  const me = useCurrentUser();

  const companyOffers = useQuery(api.offers.listByCompany, me?.role === "company" && token ? { token } : "skip");
  const studentOffers = useQuery(api.offers.listByStudent, me?.role === "student" && token ? { token } : "skip");

  const respondOffer = useMutation(api.offers.respond);
  const withdrawOffer = useMutation(api.offers.withdraw);
  const [respondingId, setRespondingId] = useState<Id<"offers"> | null>(null);

  const items = me?.role === "company" ? companyOffers : studentOffers;

  if (!items) return <TableSkeleton rows={3} />;

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      withdrawn: "bg-gray-50 text-gray-500 border-gray-200",
    };
    const labels: Record<string, string> = {
      pending: "بانتظار الرد",
      accepted: "مقبول",
      rejected: "مرفوض",
      withdrawn: "ملغي",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  const handleRespond = async (offerId: Id<"offers">, accept: boolean) => {
    if (!token) return;
    setRespondingId(offerId);
    try {
      await respondOffer({ token, offerId, accept });
    } catch { console.debug("offer respond error"); }
    setRespondingId(null);
  };

  return (
    <div>
      <h1 className="text-h2 mb-2">عروض التوظيف</h1>
      <p className="text-text-secondary mb-8">
        {me?.role === "company" ? "إدارة عروض التوظيف المقدمة للمرشحين." : "عروض التوظيف المقدمة لك من الشركات."}
      </p>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-text-muted" />
          <p className="text-text-secondary font-medium mb-1">لا توجد عروض</p>
          <p className="text-sm text-text-muted">
            {me?.role === "company" ? "قدّم عرض توظيف لمرشح من صفحة ملفه الشخصي." : "عندما تقدّم شركة لك عرضاً، سيظهر هنا."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(items as OfferItem[]).map((offer) => (
            <div key={offer._id} className="bg-white rounded-2xl border border-border-light p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary">{offer.title}</h3>
                  <p className="text-sm text-text-secondary mt-0.5">
                    {me?.role === "company" ? `إلى: ${offer.studentName || "—"}` : `من: ${offer.companyName || "—"}`}
                  </p>
                </div>
                {statusBadge(offer.status)}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                {offer.salary && (
                  <div>
                    <span className="text-text-muted">الراتب: </span>
                    <span className="text-text-primary font-medium">{offer.salary}</span>
                  </div>
                )}
                <div>
                  <span className="text-text-muted">تاريخ البداية: </span>
                  <span className="text-text-primary font-medium">{offer.startDate}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-text-muted">الشروط: </span>
                  <p className="text-text-primary mt-1 whitespace-pre-wrap">{offer.terms}</p>
                </div>
              </div>

              {offer.status === "pending" && me?.role === "student" && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-light">
                  <button
                    onClick={() => handleRespond(offer._id, true)}
                    disabled={respondingId === offer._id}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                  >
                    {respondingId === offer._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    <span>قبول العرض</span>
                  </button>
                  <button
                    onClick={() => handleRespond(offer._id, false)}
                    disabled={respondingId === offer._id}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-60 transition-colors"
                  >
                    <XCircle size={16} />
                    <span>رفض العرض</span>
                  </button>
                </div>
              )}

              {offer.status === "pending" && me?.role === "company" && (
                <div className="mt-4 pt-4 border-t border-border-light flex justify-end">
                  <button
                    onClick={async () => {
                      try { await withdrawOffer({ token, offerId: offer._id }); } catch { console.debug("withdraw error"); }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <XCircle size={16} />
                    <span>سحب العرض</span>
                  </button>
                </div>
              )}

              {offer.respondedAt && (
                <div className="mt-4 pt-4 border-t border-border-light text-xs text-text-muted">
                  {offer.status === "accepted" ? "تم القبول" : offer.status === "rejected" ? "تم الرفض" : ""} في {new Date(offer.respondedAt).toLocaleDateString("ar-SA")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
