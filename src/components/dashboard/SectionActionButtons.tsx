import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, FileText, FileDown, MessageCircle, Share2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type SectionActionButtonsProps = {
  /** Returns the plain-text content used for copy/export/share */
  getText: () => string;
  /** Used for exported file names (without extension) */
  filenameBase: string;
  /** Optional PDF layout settings */
  pdf?: {
    headerTitle?: string;
    headerSubtitle?: string;
    footerLines?: string[];
  };
  /** Optional: override default toast messages */
  labels?: {
    copied?: string;
    exportedTxt?: string;
    exportedPdf?: string;
    sharedTemporaryPage?: string;
  };
  /** Optional: custom WhatsApp text generator (e.g. dynamic temporary link) */
  getWhatsAppShareText?: () => Promise<string> | string;
  /** Optional: custom temporary page share text generator */
  getTemporaryPageShareText?: () => Promise<string> | string;
  /** When provided, the PDF button captures this DOM element visually */
  visualContainerRef?: React.RefObject<HTMLDivElement>;
};

const openExternalShare = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const downloadTxt = (text: string, filename: string) => {
  const element = document.createElement("a");
  const file = new Blob([text], { type: "text/plain; charset=utf-8" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const extractFirstUrl = (text: string) => {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match?.[0] ?? null;
};

const exportVisualPdf = async (
  container: HTMLDivElement,
  filename: string,
  options?: SectionActionButtonsProps["pdf"]
) => {
  toast.info("Gerando PDF visual, aguarde...");

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdfDoc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
    const pageWidth = pdfDoc.internal.pageSize.getWidth();
    const pageHeight = pdfDoc.internal.pageSize.getHeight();

    const margin = 24;
    const header = options?.headerTitle ?? "APIPAINEL.COM.BR";
    const subtitle = options?.headerSubtitle ?? "Relatório Completo de Consulta CPF";

    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.setFontSize(12);
    pdfDoc.text(header, margin, 20);
    pdfDoc.setFont("helvetica", "normal");
    pdfDoc.setFontSize(9);
    pdfDoc.text(subtitle, margin, 34);

    pdfDoc.addImage(imgData, "JPEG", margin, 44, contentWidth, Math.min(contentHeight, pageHeight - 68));
    pdfDoc.save(filename);
    toast.success("PDF visual exportado com sucesso!");
  } catch (error) {
    console.error("Erro ao gerar PDF visual:", error);
    toast.error("Erro ao gerar PDF. Tente novamente.");
  }
};

const exportTextPdf = (
  text: string,
  filename: string,
  options?: SectionActionButtonsProps["pdf"]
) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(options?.headerTitle ?? "APIPAINEL.COM.BR", margin, 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(options?.headerSubtitle ?? "Relatório Completo de Consulta CPF", margin, 44);

  const lines = doc.splitTextToSize(text || "Sem dados", maxWidth);
  doc.text(lines, margin, 68);
  doc.save(filename);
};

const SectionActionButtons: React.FC<SectionActionButtonsProps> = ({
  getText,
  filenameBase,
  pdf,
  labels,
  getWhatsAppShareText,
  getTemporaryPageShareText,
  visualContainerRef,
}) => {
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const [isSharingTemporaryPage, setIsSharingTemporaryPage] = useState(false);

  const onCopy = async () => {
    const text = getText();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast.success(labels?.copied ?? "Dados copiados!");
  };

  const onExportTxt = () => {
    const text = getText();
    if (!text) return;
    downloadTxt(text, `${filenameBase}.txt`);
    toast.success(labels?.exportedTxt ?? "TXT exportado com sucesso!");
  };

  const onExportPdf = async () => {
    // If a visual container ref is provided, use html2canvas capture
    if (visualContainerRef?.current) {
      await exportVisualPdf(visualContainerRef.current, `${filenameBase}.pdf`, pdf);
      return;
    }
    // Fallback to text-based PDF
    const text = getText();
    if (!text) return;
    exportTextPdf(text, `${filenameBase}.pdf`, pdf);
    toast.success(labels?.exportedPdf ?? "PDF exportado com sucesso!");
  };

  const onShareWhatsApp = async () => {
    try {
      setIsSharingWhatsApp(true);
      const text = getWhatsAppShareText
        ? await getWhatsAppShareText()
        : getText();

      if (!text) return;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      openExternalShare(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao compartilhar no WhatsApp");
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  const onShareTemporaryPage = async () => {
    if (!getTemporaryPageShareText) return;

    try {
      setIsSharingTemporaryPage(true);
      const text = await getTemporaryPageShareText();
      if (!text) return;

      const shareUrl = extractFirstUrl(text);
      await navigator.clipboard.writeText(shareUrl ?? text);
      toast.success(labels?.sharedTemporaryPage ?? "Link da página temporária copiado!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao compartilhar página temporária");
    } finally {
      setIsSharingTemporaryPage(false);
    }
  };

  return (
    <div
      className="inline-flex items-center overflow-hidden rounded-md border bg-background shadow-sm"
      aria-label="Ações do relatório"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onCopy}
        className="h-8 w-8 rounded-none"
        title="Copiar"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onExportTxt}
        className="h-8 w-8 rounded-none border-l"
        title="Exportar TXT"
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onExportPdf}
        className="h-8 w-8 rounded-none border-l"
        title="Exportar PDF Visual"
      >
        <FileDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onShareWhatsApp}
        disabled={isSharingWhatsApp}
        className="h-8 w-8 rounded-none border-l"
        title="Enviar no WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      {getTemporaryPageShareText && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onShareTemporaryPage}
          disabled={isSharingTemporaryPage}
          className="h-8 w-8 rounded-none border-l"
          title="Compartilhar página temporária"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SectionActionButtons;

