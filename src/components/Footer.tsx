import { Mail, Instagram, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Copyright */}
          <div className="text-center md:text-left">
            <a
              href="/"
              className="text-xl font-logo font-semibold tracking-widest text-foreground"
            >
              UNIQUEVISIONS
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              © {new Date().getFullYear()} UniqueVisions. Alle Rechte vorbehalten.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
            <a
              href="mailto:kontakt@uniquevisions.at"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">kontakt@uniquevisions.at</span>
            </a>
            <a
              href="https://instagram.com/uniquevisions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span className="text-sm">Instagram</span>
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Impressum
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Datenschutz
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
