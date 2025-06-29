export default class PdfCertificate {
  id;
  filename;
  pdfBase64;

  constructor(pdf) {
    this.id        = pdf?.id ?? null;
    this.filename  = pdf?.filename ?? null;
    this.pdfBase64 = pdf?.pdf_base64 ?? null;
  }

  /**
   * Преобразует Base64 в Blob (application/pdf)
   * @returns {Blob|null}
   */
  toBlob() {
    if (!this.pdfBase64) return null;
    const binaryStr = atob(this.pdfBase64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Скачивает PDF в браузере под оригинальным именем
   */
  download() {
    const blob = this.toBlob();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.filename ?? 'certificate.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  
}