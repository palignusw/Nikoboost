
export type OrderReceipt = {
  orderId: string;
  createdAt: string;
  total: number;

  customer: {
    battleTag: string;
    discord: string;
    character: string;
    realm: string;
    comment: string;
  };

  service: {
    keyLevel: number;
    runs: number;
    mode: string;
    region: string;
    playerClass: string;
    role: string;
    armor: string;
    traders: number;
    dungeons: string[];
  };

  schedule: {
    preferredTime: string;
    tbilisiTime: string;
  };
};

type FontName = "NotoSans" | "NotoSansGeorgian";

type TextRun = {
  text: string;
  font: FontName;
  width: number;
};

type WrappedLine = {
  runs: TextRun[];
  width: number;
};

export async function downloadOrderPdf(
  receipt: OrderReceipt
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  // ----------------------------------
  // FONT LOADING
  // ----------------------------------

  async function loadFont(
    url: string,
    filename: string,
    fontName: FontName
  ): Promise<void> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Cannot load PDF font: ${url}`
      );
    }

    const buffer = await response.arrayBuffer();

    if (buffer.byteLength < 12) {
      throw new Error(
        `PDF font is empty or invalid: ${filename}`
      );
    }

    const signature =
      new DataView(buffer).getUint32(0);

    if (
      signature !== 0x00010000 &&
      signature !== 0x4f54544f &&
      signature !== 0x74727565
    ) {
      throw new Error(
        `Invalid font file: ${filename}`
      );
    }

    const bytes = new Uint8Array(buffer);
    let binary = "";

    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    const base64 = btoa(binary);

    pdf.addFileToVFS(filename, base64);
    pdf.addFont(filename, fontName, "normal");
  }

  await loadFont(
    "/fonts/NotoSans-Regular.ttf",
    "NotoSans-Regular.ttf",
    "NotoSans"
  );

  await loadFont(
    "/fonts/NotoSansGeorgian-Regular.ttf",
    "NotoSansGeorgian-Regular.ttf",
    "NotoSansGeorgian"
  );

  // ----------------------------------
  // PAGE SETTINGS
  // ----------------------------------

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 15;
  const WIDTH = PAGE_W - MARGIN * 2;
  const BOTTOM = PAGE_H - 18;

  const C = {
    dark: [12, 16, 28] as const,
    accent: [95, 124, 255] as const,
    text: [30, 39, 58] as const,
    muted: [105, 115, 135] as const,
    border: [230, 235, 245] as const,
    light: [239, 242, 250] as const,
  };

  let y = 0;

  // ----------------------------------
  // PAGE MANAGEMENT
  // ----------------------------------

  function startPage(first = false): void {
    if (!first) {
      pdf.addPage();
    }

    pdf.setFillColor(...C.dark);
    pdf.rect(0, 0, PAGE_W, 31, "F");

    pdf.setFillColor(...C.accent);
    pdf.rect(0, 30, PAGE_W, 1, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(19);
    pdf.setTextColor(255, 255, 255);

    pdf.text("NIKOBOOST", MARGIN, 15);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(180, 193, 225);

    pdf.text(
      "ORDER CONFIRMATION",
      MARGIN,
      23
    );

    pdf.setFontSize(7.5);

    pdf.text(
      receipt.orderId,
      PAGE_W - MARGIN,
      17,
      { align: "right" }
    );

    y = 38;
  }

  function ensureSpace(height: number): void {
    if (y + height > BOTTOM) {
      startPage();
    }
  }

  // ----------------------------------
  // MULTILINGUAL TEXT
  // ----------------------------------

  function getFont(char: string): FontName {
    return /[\u10A0-\u10FF\u1C90-\u1CBF]/u.test(char)
      ? "NotoSansGeorgian"
      : "NotoSans";
  }

  function measureRun(
    text: string,
    font: FontName,
    fontSize: number
  ): number {
    pdf.setFont(font, "normal");
    pdf.setFontSize(fontSize);

    return pdf.getTextWidth(text);
  }

  function measureMixedText(
    value: string,
    fontSize: number
  ): number {
    let width = 0;
    let currentFont: FontName | null = null;
    let currentText = "";

    for (const char of Array.from(value)) {
      const font = getFont(char);

      if (
        currentFont !== null &&
        currentFont !== font
      ) {
        width += measureRun(
          currentText,
          currentFont,
          fontSize
        );

        currentText = "";
      }

      currentFont = font;
      currentText += char;
    }

    if (currentFont !== null && currentText) {
      width += measureRun(
        currentText,
        currentFont,
        fontSize
      );
    }

    return width;
  }

  function wrapMultilingualText(
    value: string,
    maxWidth: number,
    fontSize = 8
  ): WrappedLine[] {
    const result: WrappedLine[] = [];

    let currentRuns: TextRun[] = [];
    let currentWidth = 0;

    function pushLine(): void {
      result.push({
        runs: currentRuns,
        width: currentWidth,
      });

      currentRuns = [];
      currentWidth = 0;
    }

    function appendCharacter(char: string): void {
      const font = getFont(char);
      const last = currentRuns[currentRuns.length - 1];

      if (last && last.font === font) {
        const nextText = last.text + char;
        const nextWidth = measureRun(
          nextText,
          font,
          fontSize
        );

        currentWidth += nextWidth - last.width;

        last.text = nextText;
        last.width = nextWidth;
      } else {
        const width = measureRun(
          char,
          font,
          fontSize
        );

        currentRuns.push({
          text: char,
          font,
          width,
        });

        currentWidth += width;
      }
    }

    function appendToken(token: string): void {
      for (const char of Array.from(token)) {
        const font = getFont(char);
        const last = currentRuns[currentRuns.length - 1];

        const charWidth =
          last && last.font === font
            ? measureRun(
                last.text + char,
                font,
                fontSize
              ) - last.width
            : measureRun(char, font, fontSize);

        if (
          currentWidth + charWidth > maxWidth &&
          currentWidth > 0
        ) {
          pushLine();
        }

        appendCharacter(char);
      }
    }

    const normalized = String(value || "-")
      .replace(/\r\n?/g, "\n");

    const tokens =
      normalized.match(/\n|[^\S\n]+|[^\s]+/gu) ?? [];

    for (const token of tokens) {
      if (token === "\n") {
        pushLine();
        continue;
      }

      const whitespace = /^\s+$/u.test(token);

      if (whitespace && currentWidth === 0) {
        continue;
      }

      const tokenWidth = measureMixedText(
        token,
        fontSize
      );

      if (
        !whitespace &&
        currentWidth > 0 &&
        currentWidth + tokenWidth > maxWidth
      ) {
        pushLine();
      }

      if (
        whitespace &&
        currentWidth + tokenWidth > maxWidth
      ) {
        pushLine();
        continue;
      }

      appendToken(token);
    }

    if (currentRuns.length || result.length === 0) {
      pushLine();
    }

    return result;
  }

  function drawMultilingualLines(
    lines: WrappedLine[],
    x: number,
    startY: number,
    fontSize = 8,
    lineHeight = 3.8
  ): void {
    lines.forEach((line, index) => {
      let currentX = x;

      const currentY =
        startY + index * lineHeight;

      for (const run of line.runs) {
        pdf.setFont(run.font, "normal");
        pdf.setFontSize(fontSize);
        pdf.setTextColor(...C.text);

        pdf.text(
          run.text,
          currentX,
          currentY
        );

        currentX += run.width;
      }
    });
  }

  // ----------------------------------
  // SECTIONS
  // ----------------------------------

  function section(
    title: string,
    entries: Array<[string, string]>
  ): void {
    const labelX = MARGIN + 3;
    const valueX = MARGIN + 65;

    const valueWidth =
      PAGE_W - MARGIN - valueX - 3;

    const fontSize = 8;
    const lineHeight = 3.8;
    const rowPadding = 2.5;
    const minRowHeight = 6.3;

    const headerHeight = 8;
    const headerGap = 2.5;
    const bottomGap = 4;

    const rows = entries.map(([label, value]) => {
      const lines = wrapMultilingualText(
        String(value || "-"),
        valueWidth,
        fontSize
      );

      const height = Math.max(
        minRowHeight,
        lines.length * lineHeight + rowPadding
      );

      return {
        label,
        lines,
        height,
      };
    });

    const contentHeight = rows.reduce(
      (sum, row) => sum + row.height,
      0
    );

    const sectionHeight =
      headerHeight +
      headerGap +
      contentHeight +
      bottomGap;

    // Keep normal sections on one page.
    if (sectionHeight <= BOTTOM - 38) {
      ensureSpace(sectionHeight);
    } else {
      ensureSpace(
        headerHeight +
        headerGap +
        minRowHeight
      );
    }

    function drawHeader(
      heading: string
    ): void {
      pdf.setFillColor(...C.light);

      pdf.roundedRect(
        MARGIN,
        y,
        WIDTH,
        headerHeight,
        2,
        2,
        "F"
      );

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(45, 66, 130);

      pdf.text(
        heading.toUpperCase(),
        MARGIN + 4,
        y + 5.3
      );

      y += headerHeight + headerGap;
    }

    drawHeader(title);

    for (const row of rows) {
      let lineIndex = 0;
      let firstPart = true;

      while (lineIndex < row.lines.length) {
        const remainingLines =
          row.lines.length - lineIndex;

        const remainingHeight = Math.max(
          minRowHeight,
          remainingLines * lineHeight + rowPadding
        );

        // Keep a row together if it fits
        // on a fresh page.
        if (
          remainingHeight <=
            BOTTOM - 38 - headerHeight - headerGap &&
          y + remainingHeight > BOTTOM
        ) {
          startPage();
          drawHeader(`${title} (cont.)`);
        }

        let availableLines = Math.floor(
          (BOTTOM - y - rowPadding) /
            lineHeight
        );

        if (availableLines < 1) {
          startPage();
          drawHeader(`${title} (cont.)`);

          availableLines = Math.floor(
            (BOTTOM - y - rowPadding) /
              lineHeight
          );
        }

        const part = row.lines.slice(
          lineIndex,
          lineIndex + availableLines
        );

        const partHeight = Math.max(
          minRowHeight,
          part.length * lineHeight + rowPadding
        );

        if (firstPart) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7.5);
          pdf.setTextColor(...C.muted);

          pdf.text(
            row.label,
            labelX,
            y + 3.6
          );
        }

        drawMultilingualLines(
          part,
          valueX,
          y + 3.6,
          fontSize,
          lineHeight
        );

        y += partHeight;
        lineIndex += part.length;
        firstPart = false;

        pdf.setDrawColor(...C.border);
        pdf.setLineWidth(0.2);

        pdf.line(
          MARGIN + 2,
          y,
          PAGE_W - MARGIN - 2,
          y
        );

        if (lineIndex < row.lines.length) {
          startPage();
          drawHeader(`${title} (cont.)`);
        }
      }
    }

    y += bottomGap;
  }

  // ----------------------------------
  // PRICE AND PAYMENT NOTICE
  // ----------------------------------

  function priceBlock(): void {
    const notice =
      "This document confirms receipt of your " +
      "reservation request only. No payment has " +
      "been collected. Team availability, final " +
      "pricing and the start time will be " +
      "confirmed on Discord.";

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);

    const noticeLines =
      pdf.splitTextToSize(
        notice,
        WIDTH - 4
      ) as string[];

    const noticeHeight =
      noticeLines.length * 3.5;

    const blockHeight =
      16 + 5 + 5 + noticeHeight + 5;

    ensureSpace(blockHeight);

    pdf.setFillColor(...C.dark);

    pdf.roundedRect(
      MARGIN,
      y,
      WIDTH,
      16,
      3,
      3,
      "F"
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(190, 200, 225);

    pdf.text(
      "ESTIMATED TOTAL",
      MARGIN + 5,
      y + 10
    );

    pdf.setFontSize(13);
    pdf.setTextColor(255, 255, 255);

    pdf.text(
      `${receipt.total.toLocaleString("en-US")} GOLD`,
      PAGE_W - MARGIN - 5,
      y + 10,
      { align: "right" }
    );

    y += 21;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(185, 65, 75);

    pdf.text(
      "NOT A PAYMENT RECEIPT",
      MARGIN,
      y
    );

    y += 5;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...C.muted);

    pdf.text(
      noticeLines,
      MARGIN,
      y
    );

    y += noticeHeight + 5;
  }

  // ----------------------------------
  // DOCUMENT CONTENT
  // ----------------------------------

  startPage(true);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(...C.text);

  pdf.text(
    "Reservation received",
    MARGIN,
    y + 3
  );

  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...C.muted);

  pdf.text(
    "Your request was submitted successfully.",
    MARGIN,
    y
  );

  y += 8;

  section("Order Information", [
    ["Order ID", receipt.orderId],
    [
      "Submitted",
      new Date(receipt.createdAt).toLocaleString(
        "en-GB",
        {
          timeZone: "UTC",
          dateStyle: "medium",
          timeStyle: "short",
        }
      ) + " UTC",
    ],
    [
      "Service",
      `Mythic+ +${receipt.service.keyLevel}`,
    ],
    ["Runs", String(receipt.service.runs)],
    ["Region", receipt.service.region],
    ["Mode", receipt.service.mode],
  ]);

  priceBlock();

  section("Character & Loot", [
    ["BattleTag", receipt.customer.battleTag],
    ["Discord", receipt.customer.discord],
    ["Character", receipt.customer.character],
    ["Realm", receipt.customer.realm],
    ["Class", receipt.service.playerClass],
    ["Role", receipt.service.role],
    ["Armor", receipt.service.armor],
    [
      "Loot Traders",
      receipt.service.traders === 0
        ? "None"
        : `+${receipt.service.traders}`,
    ],
  ]);

  section("Dungeon Selection", [
    [
      "Dungeons",
      receipt.service.dungeons.join(", ") ||
        "Any dungeon",
    ],
  ]);

  section("Preferred Schedule", [
    [
      "Requested Date & Time",
      receipt.schedule.preferredTime,
    ],
  ]);

  if (receipt.customer.comment.trim()) {
    section("Additional Notes", [
      ["Comment", receipt.customer.comment],
    ]);
  }

  // ----------------------------------
  // PAGE NUMBERS
  // ----------------------------------

  const pageCount = pdf.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    pdf.setPage(page);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...C.muted);

    pdf.text(
      `NikoBoost  |  Page ${page} of ${pageCount}`,
      PAGE_W / 2,
      PAGE_H - 9,
      { align: "center" }
    );
  }

  // ----------------------------------
  // DOWNLOAD
  // ----------------------------------

  const safeId = receipt.orderId.replace(
    /[^a-zA-Z0-9-]/g,
    ""
  );

  pdf.save(`NikoBoost-${safeId}.pdf`);
}
