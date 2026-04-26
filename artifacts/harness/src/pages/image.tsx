import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { useGenerateOpenaiImage } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ImageIcon, Download } from "lucide-react";
type ImageSize = "1024x1024" | "1536x1024" | "1024x1536";
const IMAGE_SIZES: ImageSize[] = ["1024x1024", "1536x1024", "1024x1536"];

export default function ImageLab() {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<ImageSize>("1024x1024");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generateImage = useGenerateOpenaiImage();

  const handleGenerate = () => {
    if (!prompt) return;
    
    generateImage.mutate(
      { data: { prompt, size } },
      {
        onSuccess: (data) => {
          setImageUrl(`data:image/png;base64,${data.b64_json}`);
        }
      }
    );
  };

  return (
    <div className="flex h-full w-full">
      {/* Settings Panel */}
      <div className="w-80 border-r border-border bg-card p-6 flex flex-col gap-6">
        <div>
          <h2 className="font-bold text-sm tracking-widest text-muted-foreground uppercase mb-4">{t("nav_image")}</h2>
          <p className="text-xs text-muted-foreground font-mono mb-6">Test image generation capabilities.</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">{t("image_prompt")}</label>
          <Textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic cockpit in space..."
            className="font-mono bg-background min-h-[120px] focus-visible:ring-primary border-border"
            data-testid="input-image-prompt"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">{t("size")}</label>
          <Select value={size} onValueChange={(val: ImageSize) => setSize(val)}>
            <SelectTrigger className="font-mono bg-background border-border focus:ring-primary" data-testid="select-image-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMAGE_SIZES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={!prompt || generateImage.isPending}
          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/80 font-bold tracking-wide"
          data-testid="btn-generate-image"
        >
          {generateImage.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
          {t("generate")}
        </Button>
      </div>

      {/* Result Area */}
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-8 overflow-y-auto">
        {generateImage.isPending ? (
          <div className="flex flex-col items-center justify-center text-primary">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="font-mono text-sm animate-pulse">Generating rendering matrix...</p>
          </div>
        ) : imageUrl ? (
          <div className="max-w-full flex flex-col items-center gap-4">
            <div className="border border-border p-2 bg-card rounded-md shadow-2xl">
              <img src={imageUrl} alt="Generated" className="max-w-full max-h-[70vh] object-contain rounded" data-testid="img-generated-result" />
            </div>
            <Button variant="outline" className="font-mono text-xs" onClick={() => {
              const a = document.createElement("a");
              a.href = imageUrl;
              a.download = `generated-${Date.now()}.png`;
              a.click();
            }}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          </div>
        ) : (
          <div className="text-center text-muted-foreground opacity-50">
            <ImageIcon className="h-24 w-24 mx-auto mb-4" />
            <p className="font-mono text-sm uppercase tracking-widest">Awaiting Prompt</p>
          </div>
        )}
      </div>
    </div>
  );
}
