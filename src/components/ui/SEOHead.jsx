import { Helmet } from "react-helmet-async";

const SEOHead = ({
  title = "USMLE Trivia - Master Medicine, One Question at a Time",
  description = "Prepare for USMLE exams with our comprehensive trivia app. Features thousands of medical questions, progress tracking, and personalized study plans.",
  keywords = "USMLE, medical exam, trivia, study, medicine, doctor, preparation, questions, quiz",
  image = "/og-image.jpg",
  url = window.location.href,
  type = "website",
  siteName = "USMLE Trivia",
  locale = "en_US",
  noIndex = false,
  noFollow = false,
}) => {
  const fullTitle = title.includes("USMLE Trivia")
    ? title
    : `${title} | USMLE Trivia`;
  const canonicalUrl = url.split("?")[0]; // Remove query parameters for canonical URL

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      <meta
        name="robots"
        content={`${noIndex ? "noindex" : "index"},${noFollow ? "nofollow" : "follow"}`}
      />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="author" content="USMLE Trivia Team" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, viewport-fit=cover"
      />
      <meta name="theme-color" content="#3b82f6" />

      {/* Apple Meta Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="USMLE Trivia" />

      {/* Microsoft */}
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Structured Data for Medical Education */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "USMLE Trivia",
          description: description,
          url: canonicalUrl,
          logo: `${window.location.origin}/logo.png`,
          sameAs: [
            // Add social media URLs when available
          ],
          educationalLevel: "Graduate",
          educationalUse: "Assessment",
          learningResourceType: "Quiz",
          audience: {
            "@type": "EducationalAudience",
            educationalRole: "Medical Student",
          },
        })}
      </script>
    </Helmet>
  );
};

// Predefined SEO configurations for different pages
export const homeSEO = {
  title: "USMLE Trivia - Master Medicine, One Question at a Time",
  description:
    "Prepare for USMLE Step 1, Step 2, and Step 3 exams with our comprehensive trivia app. Features thousands of medical questions, progress tracking, and personalized study plans.",
  keywords:
    "USMLE, Step 1, Step 2, Step 3, medical exam, trivia, study, medicine, doctor, preparation",
};

export const quizSEO = {
  title: "Medical Quiz - Practice USMLE Questions",
  description:
    "Test your medical knowledge with our comprehensive USMLE practice questions. Covers all major medical specialties with detailed explanations.",
  keywords:
    "medical quiz, USMLE questions, practice test, medical education, study quiz",
};

export const leaderboardSEO = {
  title: "Leaderboard - Top USMLE Students",
  description:
    "See how you rank against other medical students preparing for USMLE exams. Track your progress and compete with peers.",
  keywords:
    "USMLE leaderboard, medical student ranking, study competition, progress tracking",
};

export const profileSEO = {
  title: "Your Profile - USMLE Study Progress",
  description:
    "Track your USMLE study progress, view achievements, and monitor your performance across different medical specialties.",
  keywords:
    "USMLE profile, study progress, medical student dashboard, learning analytics",
  noIndex: true, // Private pages should not be indexed
};

export default SEOHead;
