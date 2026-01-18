import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useContent";

export const Hero = () => {
  const { data: siteContent } = useSiteContent();

  // Get images from visual editor grid or use fallbacks
  const getGridImages = () => {
    const images: string[] = [];
    
    // Try to get el-2, el-3, el-4 images from visual editor
    const imageIds = ["el-2", "el-3", "el-4"];
    for (const id of imageIds) {
      const savedContent = siteContent?.visual_editor?.[id]?.de;
      if (savedContent) {
        try {
          const parsed = JSON.parse(savedContent);
          if (parsed.content && parsed.type === "image") {
            images.push(parsed.content);
          }
        } catch {
          // Skip invalid entries
        }
      }
    }

    // Fallback images if none found
    if (images.length === 0) {
      return [
        "/placeholder.svg",
        "/placeholder.svg",
        "/placeholder.svg"
      ];
    }

    return images;
  };

  const gridImages = getGridImages();

  const scrollToServices = () => {
    const element = document.querySelector("#dienstleistungen");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };

  // Get headline content from visual editor or use defaults
  const headline = (() => {
    const savedContent = siteContent?.visual_editor?.["el-0"]?.de;
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        return parsed.content || "Professioneller Foto- & Video-Content mit klarer Wirkung.";
      } catch {
        return "Professioneller Foto- & Video-Content mit klarer Wirkung.";
      }
    }
    return "Professioneller Foto- & Video-Content mit klarer Wirkung.";
  })();

  const subheadline = (() => {
    const savedContent = siteContent?.visual_editor?.["el-1"]?.de;
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        return parsed.content || "Maßgeschneiderte Pakete für Unternehmen, Marken, Agenturen & Privatkunden.";
      } catch {
        return "Maßgeschneiderte Pakete für Unternehmen, Marken, Agenturen & Privatkunden.";
      }
    }
    return "Maßgeschneiderte Pakete für Unternehmen, Marken, Agenturen & Privatkunden.";
  })();

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      <div className="container mx-auto px-4 lg:px-8 pt-32 pb-16 relative z-10">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-4xl mx-auto mb-8"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-semibold leading-tight mb-6">
            {headline.includes("Wirkung") ? (
              <>
                Professioneller Foto- & Video-
                <br />
                <span className="text-gradient-gold">Content mit klarer Wirkung.</span>
              </>
            ) : (
              headline
            )}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {subheadline}
          </p>
        </motion.div>

        {/* Image Cards - No text overlays */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto mb-12"
        >
          {gridImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              className="group relative overflow-hidden rounded-lg aspect-[4/3]"
            >
              <img
                src={image}
                alt={`Showcase ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Button
            onClick={scrollToServices}
            size="lg"
            className="bg-foreground/10 hover:bg-foreground/20 text-foreground border border-border backdrop-blur-sm px-8 py-6 text-base font-medium rounded-md transition-all"
          >
            Alle Dienstleistungen entdecken
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;