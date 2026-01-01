import React from "react";
import { Mail, Instagram } from "lucide-react";
import { EditableText } from "./EditableText";

interface EditableFooterProps {
  content: Record<string, Record<string, { de: string; en: string }>> | undefined;
  onContentChange: (section: string, key: string, value: string) => void;
}

export const EditableFooter: React.FC<EditableFooterProps> = ({
  content,
  onContentChange,
}) => {
  const email = content?.footer?.email?.de || "kontakt@uniquevisions.at";
  const instagramLabel = content?.footer?.instagram_label?.de || "Instagram";
  const instagramUrl = content?.footer?.instagram_url?.de || "https://instagram.com/uniquevisions";
  const copyright = content?.footer?.copyright?.de || "UniqueVisions. Alle Rechte vorbehalten.";

  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Copyright */}
          <div className="text-center md:text-left">
            <span className="text-xl font-logo font-semibold tracking-tight text-foreground">
              UNIQUEVISIONS
            </span>
            <p className="text-sm text-muted-foreground mt-2">
              © {new Date().getFullYear()}{" "}
              <EditableText
                value={copyright}
                onChange={(value) => onContentChange("footer", "copyright", value)}
                as="span"
              />
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <EditableText
                value={email}
                onChange={(value) => onContentChange("footer", "email", value)}
                as="span"
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              <EditableText
                value={instagramLabel}
                onChange={(value) => onContentChange("footer", "instagram_label", value)}
                as="span"
                className="text-sm"
              />
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Impressum
            </span>
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Datenschutz
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EditableFooter;
