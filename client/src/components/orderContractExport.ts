/** The document is assembled locally. No project data is sent to a document service. */
export type OrderContractDocument = {
  title: string;
  sections: ReadonlyArray<{ heading: string; paragraphs: ReadonlyArray<string> }>;
};

export type PreparedOrderContract = {
  blob: Blob;
  file: File | null;
  fileName: string;
};

/** These results describe a request to the OS/browser, not proof a file was saved. */
export type ContractDeliveryResult = 'shared' | 'download-requested' | 'cancelled' | 'unavailable';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const DEFAULT_FILE_NAME = 'web4tg-dogovor-proekt.docx';
const OBJECT_URL_LIFETIME_MS = 60_000;

// XML 1.0 does not allow these characters. Preserve other user-entered text:
// docx's XML serializer escapes markup instead of interpreting it as formatting.
const safeText = (text: string) => text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '');

/** Load the document library only when the user opens/updates the contract. */
export async function prepareOrderContract(contract: OrderContractDocument): Promise<PreparedOrderContract> {
  if (!contract.title.trim() || !contract.sections.length) throw new Error('Contract content is empty');
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Footer, PageNumber } = await import('docx');
  const children = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: safeText(contract.title), bold: true })],
      spacing: { after: 260 },
    }),
    ...contract.sections.flatMap(section => [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: safeText(section.heading), bold: true })],
        spacing: { before: 180, after: 100 },
        keepNext: true,
        pageBreakBefore: /^Приложение №/.test(section.heading),
      }),
      ...section.paragraphs.map(text => new Paragraph({
        children: [new TextRun({ text: safeText(text) })],
        spacing: { after: 110, line: 276 },
        alignment: AlignmentType.JUSTIFIED,
      })),
    ]),
  ];
  const document = new Document({
    styles: {
      default: {
        document: { run: { font: 'Times New Roman', size: 23 }, paragraph: { spacing: { line: 276 } } },
        heading1: { run: { font: 'Times New Roman', size: 25, bold: true, color: '181818' } },
        title: { run: { font: 'Times New Roman', size: 28, bold: true, color: '181818' } },
      },
    },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1417, right: 1134 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Страница ' }), new TextRun({ children: [PageNumber.CURRENT] })] })] }) },
      children,
    }],
  });
  const packed = await Packer.toBlob(document);
  // Explicit type is needed for file sharing and office apps on mobile systems.
  const blob = new Blob([packed], { type: DOCX_MIME });
  const file = typeof File === 'function' ? new File([blob], DEFAULT_FILE_NAME, { type: DOCX_MIME }) : null;
  return { blob, file, fileName: DEFAULT_FILE_NAME };
}

/** Must be called directly by a user tap, without awaiting generation first. */
export function downloadPreparedOrderContract(prepared: PreparedOrderContract): ContractDeliveryResult {
  if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') return 'unavailable';
  let url: string | undefined;
  let anchor: HTMLAnchorElement | undefined;
  try {
    url = URL.createObjectURL(prepared.blob);
    anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = prepared.fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    // Browsers may read the URL after the click returns. Do not revoke it immediately.
    const retainedUrl = url;
    setTimeout(() => URL.revokeObjectURL(retainedUrl), OBJECT_URL_LIFETIME_MS);
    url = undefined;
    return 'download-requested';
  } catch {
    return 'unavailable';
  } finally {
    anchor?.remove();
    if (url) URL.revokeObjectURL(url);
  }
}

/** Prefer the system share sheet for files; returns unavailable on a rejected share.
 * The UI can then offer a separate download/copy action that receives a new tap. */
export function deliverPreparedOrderContract(prepared: PreparedOrderContract): Promise<ContractDeliveryResult> {
  if (typeof navigator !== 'undefined' && prepared.file && typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
    const data: ShareData = { files: [prepared.file], title: 'Проект договора WEB4TG' };
    let canShare = false;
    try { canShare = navigator.canShare(data); } catch { /* Fall back to browser download. */ }
    if (canShare) {
      // Calling share synchronously here preserves the initiating user gesture.
      try {
        return navigator.share(data).then(() => 'shared' as const).catch(error =>
          error && error.name === 'AbortError' ? 'cancelled' as const : 'unavailable' as const,
        );
      } catch {
        return Promise.resolve('unavailable');
      }
    }
  }
  return Promise.resolve(downloadPreparedOrderContract(prepared));
}
