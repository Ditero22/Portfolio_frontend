import PortfolioContentManagement from "../../portfolioContent/components/PortfolioContentManagement";
import certificationData from "@/features/public/certifications/data/certificationData";

export default function CertificationsManagement() {
  return (
    <PortfolioContentManagement
      config={{
        kind: "certifications",
        title: "Certifications",
        singular: "Certification",
        description:
          "Manage the credentials and courses shown on your portfolio.",
        imageUpload: true,
        titleLabel: "Certification name",
        subtitleLabel: "Issuing organization",
        descriptionLabel: "Credential ID or details",
        categoryLabel: "Issue date or category (optional)",
        sampleData: certificationData,
      }}
    />
  );
}
