import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Upload,
  FileText,
  FileCode,
  Image as ImageIcon,
  FileType,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Sliders,
  FileCheck,
  Trash2,
  Archive,
} from "lucide-react";
import { ThemeConfig } from "../types";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Configure pdfjs-dist worker dynamically matching installed version
const pdfWorkerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || "6.3.289"}/build/pdf.worker.min.mjs`;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export type ConversionMode = "docx2pdf" | "pdf2docx" | "pdf2img" | "img2pdf" | "img2img";

interface DocumentConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: ConversionMode;
  activeTheme: ThemeConfig;
  onSuccessToast?: (msg: string) => void;
}

export default function DocumentConverterModal({
  isOpen,
  onClose,
  initialMode = "docx2pdf",
  activeTheme,
  onSuccessToast,
}: DocumentConverterModalProps) {
  const [activeMode, setActiveMode] = useState<ConversionMode>(initialMode);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Conversion options
  const [imageScale, setImageScale] = useState<number>(2); // 1x, 2x HD, 3x Ultra HD
  const [imageFormat, setImageFormat] = useState<"png" | "jpeg">("png");
  const [imageQuality, setImageQuality] = useState<number>(0.92);
  const [targetImageFormat, setTargetImageFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [outputFileName, setOutputFileName] = useState("");

  // Result state
  const [convertedPdfBlob, setConvertedPdfBlob] = useState<Blob | null>(null);
  const [convertedDocxBlob, setConvertedDocxBlob] = useState<Blob | null>(null);
  const [renderedPages, setRenderedPages] = useState<{ pageNum: number; dataUrl: string }[]>([]);
  const [convertedImages, setConvertedImages] = useState<{ name: string; dataUrl: string }[]>([]);
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode);
    }
  }, [initialMode, isOpen]);

  useEffect(() => {
    // Reset state when switching modes
    setSelectedFile(null);
    setSelectedImages([]);
    setConvertedPdfBlob(null);
    setConvertedDocxBlob(null);
    setRenderedPages([]);
    setConvertedImages([]);
    setHtmlPreview(null);
    setErrorMsg(null);
    setProgress(0);
    setProgressStatus("");
    setOutputFileName("");
  }, [activeMode]);

  if (!isOpen) return null;

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setConvertedPdfBlob(null);
    setConvertedDocxBlob(null);
    setRenderedPages([]);
    setConvertedImages([]);

    if (activeMode === "img2pdf") {
      const validImages = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (validImages.length === 0) {
        setErrorMsg("Please upload valid image files (PNG, JPG, WEBP).");
        return;
      }
      setSelectedImages((prev) => [...prev, ...validImages]);
      const defaultName = validImages[0].name.replace(/\.[^/.]+$/, "") + "_combined.pdf";
      setOutputFileName(defaultName);
    } else {
      const file = files[0];
      setSelectedFile(file);

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      if (activeMode === "docx2pdf") setOutputFileName(`${baseName}.pdf`);
      else if (activeMode === "pdf2docx") setOutputFileName(`${baseName}.docx`);
      else if (activeMode === "pdf2img") setOutputFileName(`${baseName}_images`);
      else if (activeMode === "img2img") setOutputFileName(`${baseName}.${targetImageFormat}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setConvertedPdfBlob(null);
    setConvertedDocxBlob(null);
    setRenderedPages([]);

    if (activeMode === "img2pdf") {
      const validImages = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (validImages.length === 0) {
        setErrorMsg("Please drop valid image files (PNG, JPG, WEBP).");
        return;
      }
      setSelectedImages((prev) => [...prev, ...validImages]);
      setOutputFileName(validImages[0].name.replace(/\.[^/.]+$/, "") + "_combined.pdf");
    } else {
      setSelectedFile(files[0]);
      const baseName = files[0].name.replace(/\.[^/.]+$/, "");
      if (activeMode === "docx2pdf") setOutputFileName(`${baseName}.pdf`);
      else if (activeMode === "pdf2docx") setOutputFileName(`${baseName}.docx`);
      else if (activeMode === "pdf2img") setOutputFileName(`${baseName}_images`);
      else if (activeMode === "img2img") setOutputFileName(`${baseName}.${targetImageFormat}`);
    }
  };

  // Helper to wait for image elements to load
  const waitForImagesToLoad = async (container: HTMLElement) => {
    const images = Array.from(container.querySelectorAll("img"));
    const promises = images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    await Promise.all(promises);
  };

  // 1. DOCX to PDF Conversion Engine
  const convertDocxToPdf = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgress(15);
    setProgressStatus("Reading DOCX file buffer...");
    setErrorMsg(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      setProgress(40);
      setProgressStatus("Extracting DOCX formatting & structure...");

      const mammothResult = await mammoth.convertToHtml({ arrayBuffer });
      const htmlContent = mammothResult.value;
      setHtmlPreview(htmlContent);

      setProgress(60);
      setProgressStatus("Rendering document layout...");

      // Render HTML using invisible element container
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "0";
      container.style.top = "0";
      container.style.opacity = "0";
      container.style.pointerEvents = "none";
      container.style.zIndex = "-9999";
      container.style.width = "794px"; // Standard A4 width at 96 DPI
      container.style.padding = "45px";
      container.style.backgroundColor = "#ffffff";
      container.style.color = "#1f2937";
      container.style.fontFamily = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      container.style.fontSize = "14px";
      container.style.lineHeight = "1.7";
      container.innerHTML = htmlContent;

      // Apply responsive styling to headings, tables & paragraphs
      const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
      headings.forEach((h) => {
        const el = h as HTMLElement;
        el.style.marginTop = "18px";
        el.style.marginBottom = "10px";
        el.style.color = "#111827";
        el.style.fontWeight = "700";
      });
      const paragraphs = container.querySelectorAll("p");
      paragraphs.forEach((p) => {
        (p as HTMLElement).style.marginBottom = "12px";
      });
      const tables = container.querySelectorAll("table");
      tables.forEach((tbl) => {
        const el = tbl as HTMLElement;
        el.style.width = "100%";
        el.style.borderCollapse = "collapse";
        el.style.marginBottom = "16px";
        el.querySelectorAll("td, th").forEach((cell) => {
          (cell as HTMLElement).style.border = "1px solid #d1d5db";
          (cell as HTMLElement).style.padding = "8px 12px";
        });
      });

      document.body.appendChild(container);
      await waitForImagesToLoad(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(container);

      setProgress(85);
      setProgressStatus("Generating PDF pages...");

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const pdfBlob = pdf.output("blob");
      setConvertedPdfBlob(pdfBlob);
      setProgress(100);
      setProgressStatus("Conversion Complete!");
      if (onSuccessToast) onSuccessToast("DOCX converted to PDF successfully!");
    } catch (err: any) {
      console.error("DOCX to PDF Error:", err);
      setErrorMsg(`Failed to convert DOCX to PDF: ${err.message || "Invalid or corrupted file format."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. PDF to DOCX Conversion Engine
  const convertPdfToDocx = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgress(15);
    setProgressStatus("Parsing PDF file...");
    setErrorMsg(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      const numPages = pdfDoc.numPages;
      const docParagraphs: Paragraph[] = [];

      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round(20 + (i / numPages) * 65));
        setProgressStatus(`Extracting page ${i} of ${numPages}...`);

        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();

        // Header for Page break
        if (i > 1) {
          docParagraphs.push(
            new Paragraph({
              text: `--- Page ${i} ---`,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 240, after: 120 },
            })
          );
        }

        // Safe item extraction for marked content & text items
        const lineMap: Record<number, string[]> = {};
        textContent.items.forEach((item: any) => {
          if (!item || typeof item !== "object" || !("str" in item) || !item.str) return;
          const transform = item.transform;
          const y = transform && Array.isArray(transform) && transform.length >= 6 ? Math.round(transform[5]) : 0;
          if (!lineMap[y]) lineMap[y] = [];
          lineMap[y].push(item.str);
        });

        // Sort lines top to bottom
        const sortedY = Object.keys(lineMap)
          .map(Number)
          .sort((a, b) => b - a);

        if (sortedY.length === 0) {
          docParagraphs.push(
            new Paragraph({
              children: [new TextRun({ text: "[Page contains scanned image or non-vector graphic content]", italics: true })],
              spacing: { after: 120 },
            })
          );
        } else {
          sortedY.forEach((y) => {
            const lineText = lineMap[y].join(" ").trim();
            if (lineText) {
              docParagraphs.push(
                new Paragraph({
                  children: [new TextRun({ text: lineText, size: 24 })], // 12pt text size
                  spacing: { after: 120 },
                })
              );
            }
          });
        }
      }

      setProgress(88);
      setProgressStatus("Building Microsoft Word (.docx) file...");

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docParagraphs.length > 0
              ? docParagraphs
              : [new Paragraph({ children: [new TextRun("No extractable text found in PDF document.")] })],
          },
        ],
      });

      const docxBlob = await Packer.toBlob(doc);
      setConvertedDocxBlob(docxBlob);
      setProgress(100);
      setProgressStatus("Conversion Complete!");
      if (onSuccessToast) onSuccessToast("PDF converted to DOCX successfully!");
    } catch (err: any) {
      console.error("PDF to DOCX Error:", err);
      setErrorMsg(`Failed to convert PDF to DOCX: ${err.message || "Invalid or encrypted PDF document."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. PDF to PNG / JPEG Images Conversion Engine
  const convertPdfToImages = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgress(15);
    setProgressStatus("Loading PDF document...");
    setErrorMsg(null);
    setRenderedPages([]);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      const pagesList: { pageNum: number; dataUrl: string }[] = [];

      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round(20 + (i / numPages) * 75));
        setProgressStatus(`Rendering HD page ${i} of ${numPages}...`);

        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: imageScale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          if (imageFormat === "jpeg") {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
          }
          await page.render({ canvasContext: context, viewport, canvas } as any).promise;
          const mimeType = imageFormat === "png" ? "image/png" : "image/jpeg";
          const dataUrl = canvas.toDataURL(mimeType, imageQuality);
          pagesList.push({ pageNum: i, dataUrl });
        }
      }

      setRenderedPages(pagesList);
      setProgress(100);
      setProgressStatus("Pages Rendered Successfully!");
      if (onSuccessToast) onSuccessToast(`Rendered ${pagesList.length} pages to ${imageFormat.toUpperCase()}!`);
    } catch (err: any) {
      console.error("PDF to Image Error:", err);
      setErrorMsg(`Failed to render PDF pages: ${err.message || "Invalid PDF file."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Images to PDF Conversion Engine
  const convertImagesToPdf = async () => {
    if (selectedImages.length === 0) return;
    setIsProcessing(true);
    setProgress(20);
    setProgressStatus("Processing image files...");
    setErrorMsg(null);

    try {
      let pdf: jsPDF | null = null;

      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        setProgress(Math.round(20 + ((i + 1) / selectedImages.length) * 70));
        setProgressStatus(`Adding image ${i + 1} of ${selectedImages.length}...`);

        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = dataUrl;
        });

        const orientation = img.width > img.height ? "landscape" : "portrait";
        if (i === 0) {
          pdf = new jsPDF({
            orientation,
            unit: "pt",
            format: [img.width, img.height],
          });
          pdf.addImage(dataUrl, file.type.includes("png") ? "PNG" : "JPEG", 0, 0, img.width, img.height);
        } else if (pdf) {
          pdf.addPage([img.width, img.height], orientation);
          pdf.addImage(dataUrl, file.type.includes("png") ? "PNG" : "JPEG", 0, 0, img.width, img.height);
        }
      }

      if (pdf) {
        const pdfBlob = pdf.output("blob");
        setConvertedPdfBlob(pdfBlob);
        setProgress(100);
        setProgressStatus("PDF Generated Successfully!");
        if (onSuccessToast) onSuccessToast("Combined images into multi-page PDF successfully!");
      }
    } catch (err: any) {
      console.error("Images to PDF Error:", err);
      setErrorMsg(`Failed to convert images to PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Image to Image Format Switcher
  const convertImageFormat = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgress(30);
    setProgressStatus(`Converting format to ${targetImageFormat.toUpperCase()}...`);
    setErrorMsg(null);

    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      });

      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = dataUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (targetImageFormat === "jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
      }

      const mimeType = targetImageFormat === "png" ? "image/png" : targetImageFormat === "jpeg" ? "image/jpeg" : "image/webp";
      const convertedUrl = canvas.toDataURL(mimeType, imageQuality);

      setConvertedImages([{ name: outputFileName || `converted.${targetImageFormat}`, dataUrl: convertedUrl }]);
      setProgress(100);
      setProgressStatus("Image Converted!");
      if (onSuccessToast) onSuccessToast(`Converted image format to ${targetImageFormat.toUpperCase()}!`);
    } catch (err: any) {
      console.error("Image format conversion error:", err);
      setErrorMsg(`Failed to convert image format: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger Conversion based on Active Mode
  const handleStartConversion = () => {
    if (activeMode === "docx2pdf") convertDocxToPdf();
    else if (activeMode === "pdf2docx") convertPdfToDocx();
    else if (activeMode === "pdf2img") convertPdfToImages();
    else if (activeMode === "img2pdf") convertImagesToPdf();
    else if (activeMode === "img2img") convertImageFormat();
  };

  // Download Trigger
  const triggerDownload = (blob: Blob | string, fileName: string) => {
    if (typeof blob === "string") {
      saveAs(blob, fileName);
    } else {
      saveAs(blob, fileName);
    }
  };

  // Batch Zip Download for Rendered Pages
  const handleDownloadAllPagesZip = async () => {
    if (renderedPages.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder("pdf_pages");

      renderedPages.forEach((pg) => {
        const base64Data = pg.dataUrl.replace(/^data:image\/(png|jpeg);base64,/, "");
        folder?.file(`page_${pg.pageNum}.${imageFormat}`, base64Data, { base64: true });
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${outputFileName || "pdf_pages"}.zip`);
      if (onSuccessToast) onSuccessToast("Downloaded ZIP archive with all pages!");
    } catch (e: any) {
      console.error("ZIP creation error:", e);
      setErrorMsg("Failed to create ZIP package of pages.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className={`relative w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl border ${
            activeTheme.isDark
              ? "bg-slate-900 border-slate-800 text-slate-100 shadow-indigo-900/20"
              : "bg-white border-slate-200 text-slate-800 shadow-slate-300/50"
          } max-h-[92vh] flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-6 border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
                <RefreshCw className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${activeTheme.headingText}`}>
                  Document & File Converter Studio
                </h2>
                <p className={`text-xs sm:text-sm ${activeTheme.secondaryText}`}>
                  Client-side instant file conversion — 100% private, fast, & secure
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2.5 rounded-full transition ${
                activeTheme.isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Selector Navigation Tabs */}
          <div className="flex flex-wrap gap-2 pb-4 mb-6 border-b border-slate-800/40">
            {[
              { id: "docx2pdf", label: "DOCX ➔ PDF", icon: <FileText className="w-4 h-4 text-amber-400" /> },
              { id: "pdf2docx", label: "PDF ➔ DOCX", icon: <FileCode className="w-4 h-4 text-indigo-400" /> },
              { id: "pdf2img", label: "PDF ➔ PNG/JPG", icon: <ImageIcon className="w-4 h-4 text-emerald-400" /> },
              { id: "img2pdf", label: "Image ➔ PDF", icon: <FileType className="w-4 h-4 text-purple-400" /> },
              { id: "img2img", label: "Image Converter", icon: <Sliders className="w-4 h-4 text-pink-400" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMode(tab.id as ConversionMode)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                  activeMode === tab.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]"
                    : activeTheme.isDark
                    ? "bg-slate-800/70 hover:bg-slate-800 text-slate-300"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Options configuration per mode */}
            {activeMode === "pdf2img" && (
              <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${activeTheme.isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-indigo-400">Quality Scale:</span>
                  {(
                    [
                      { value: 1, label: "1x Standard" },
                      { value: 2, label: "2x HD (300 DPI)" },
                      { value: 3, label: "3x Ultra HD" },
                    ] as const
                  ).map((scale) => (
                    <button
                      key={scale.value}
                      onClick={() => setImageScale(scale.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        imageScale === scale.value ? "bg-indigo-600 text-white shadow-sm" : activeTheme.isDark ? "bg-slate-800 text-slate-300" : "bg-white text-slate-700"
                      }`}
                    >
                      {scale.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-indigo-400">Image Format:</span>
                  {(["png", "jpeg"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setImageFormat(fmt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition ${
                        imageFormat === fmt ? "bg-indigo-600 text-white shadow-sm" : activeTheme.isDark ? "bg-slate-800 text-slate-300" : "bg-white text-slate-700"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeMode === "img2img" && (
              <div className={`p-4 rounded-2xl border flex flex-wrap items-center gap-4 ${activeTheme.isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="text-xs font-semibold text-indigo-400">Target Image Format:</span>
                {(["png", "jpeg", "webp"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setTargetImageFormat(fmt)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase transition ${
                      targetImageFormat === fmt ? "bg-indigo-600 text-white shadow-md scale-105" : activeTheme.isDark ? "bg-slate-800 text-slate-300" : "bg-white text-slate-700"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                activeTheme.isDark
                  ? "border-slate-700 hover:border-indigo-500 bg-slate-950/40 hover:bg-slate-900/60"
                  : "border-slate-300 hover:border-indigo-500 bg-slate-50/80 hover:bg-indigo-50/40"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={
                  activeMode === "docx2pdf"
                    ? ".docx"
                    : activeMode === "pdf2docx" || activeMode === "pdf2img"
                    ? ".pdf"
                    : activeMode === "img2pdf" || activeMode === "img2img"
                    ? "image/*"
                    : "*"
                }
                multiple={activeMode === "img2pdf"}
                className="hidden"
              />
              <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 shadow-inner">
                <Upload className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <p className={`text-base font-semibold ${activeTheme.headingText}`}>
                  {activeMode === "img2pdf" ? "Drop images here or click to select multiple files" : "Drop your file here or click to browse"}
                </p>
                <p className={`text-xs ${activeTheme.secondaryText} mt-1`}>
                  Supported formats:{" "}
                  {activeMode === "docx2pdf"
                    ? "DOCX (.docx)"
                    : activeMode === "pdf2docx" || activeMode === "pdf2img"
                    ? "PDF (.pdf)"
                    : activeMode === "img2pdf"
                    ? "PNG, JPG, WEBP"
                    : "PNG, JPG, WEBP, GIF"}
                </p>
              </div>
            </div>

            {/* Selected Files List */}
            {selectedFile && activeMode !== "img2pdf" && (
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${activeTheme.isDark ? "bg-slate-800/60 border-slate-700" : "bg-indigo-50/50 border-indigo-100"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <FileCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${activeTheme.headingText}`}>{selectedFile.name}</p>
                    <p className={`text-xs ${activeTheme.secondaryText}`}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {selectedImages.length > 0 && activeMode === "img2pdf" && (
              <div className="space-y-2">
                <p className={`text-xs font-bold uppercase tracking-wider ${activeTheme.secondaryText}`}>Selected Images ({selectedImages.length}):</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className={`p-2 rounded-xl border flex items-center justify-between text-xs ${activeTheme.isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                      <span className="truncate max-w-[100px]">{img.name}</span>
                      <button
                        onClick={() => setSelectedImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-600 ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                  <span>{progressStatus || "Converting file..."}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Conversion Result: DOCX / PDF Download Button */}
            {(convertedPdfBlob || convertedDocxBlob) && (
              <div className={`p-6 rounded-3xl border text-center space-y-4 ${activeTheme.isDark ? "bg-emerald-950/20 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"}`}>
                <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className={`text-lg font-bold ${activeTheme.headingText}`}>Conversion Completed Successfully!</h3>
                <div className="max-w-md mx-auto space-y-2">
                  <label className={`text-xs font-medium ${activeTheme.secondaryText}`}>Output File Name:</label>
                  <input
                    type="text"
                    value={outputFileName}
                    onChange={(e) => setOutputFileName(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl text-sm border text-center font-medium ${activeTheme.inputBg}`}
                  />
                </div>
                <button
                  onClick={() => {
                    const blob = convertedPdfBlob || convertedDocxBlob;
                    if (blob) triggerDownload(blob, outputFileName || "converted_file");
                  }}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Converted File</span>
                </button>
              </div>
            )}

            {/* Rendered PDF Pages Preview / Images Download Grid */}
            {renderedPages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${activeTheme.headingText}`}>Converted Pages ({renderedPages.length}):</h4>
                  <button
                    disabled={isZipping}
                    onClick={handleDownloadAllPagesZip}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <Archive className="w-4 h-4" />
                    <span>{isZipping ? "Creating ZIP..." : "Download All Pages (ZIP)"}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-72 overflow-y-auto p-1">
                  {renderedPages.map((pg) => (
                    <div key={pg.pageNum} className={`p-3 rounded-2xl border space-y-2 relative group ${activeTheme.isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                      <img src={pg.dataUrl} alt={`Page ${pg.pageNum}`} className="w-full h-40 object-contain rounded-xl bg-white" />
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span>Page {pg.pageNum}</span>
                        <button
                          onClick={() => triggerDownload(pg.dataUrl, `${outputFileName || "page"}_${pg.pageNum}.${imageFormat}`)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span className="uppercase">{imageFormat}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rendered Image Format Conversion Result */}
            {convertedImages.length > 0 && (
              <div className={`p-6 rounded-3xl border text-center space-y-4 ${activeTheme.isDark ? "bg-emerald-950/20 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"}`}>
                <img src={convertedImages[0].dataUrl} alt="Converted" className="max-h-48 mx-auto rounded-2xl border shadow-md" />
                <button
                  onClick={() => triggerDownload(convertedImages[0].dataUrl, convertedImages[0].name)}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-lg flex items-center gap-2 mx-auto"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Converted Image</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="border-t pt-4 mt-6 border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Ranbidge Converter • High performance in-browser engine</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className={`px-5 py-3 rounded-2xl text-xs font-semibold transition w-full sm:w-auto ${
                  activeTheme.isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                }`}
              >
                Close
              </button>
              <button
                disabled={isProcessing || (!selectedFile && selectedImages.length === 0)}
                onClick={handleStartConversion}
                className="px-7 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 w-full sm:w-auto transition transform active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                <span>{isProcessing ? "Converting..." : "Convert Now"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
