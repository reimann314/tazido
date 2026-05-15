import { Helmet } from "react-helmet-async";

export default function SEO({ title, description }: { title: string; description?: string }) {
  const siteName = "تزيد — Tazid";
  const fullTitle = `${title} | ${siteName}`;
  const desc = description || "منصة تربط الشركات السعودية بأفضل الكفاءات الطلابية حسب التخصص — تدريب وإقامة مهنية وتوظيف مباشر.";
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
