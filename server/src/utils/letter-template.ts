export type FormalLetter = {
  body: string;
  senderName: string;
  senderEmail: string;
};

export const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const toParagraphHtml = (body: string): string =>
  body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => escapeHtml(part).replaceAll("\n", "<br />"))
    .map(
      (paragraph) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#1f1f1f;font-family:'Segoe UI',Arial,sans-serif;">${paragraph}</p>`,
    )
    .join("");

export const buildFormalEmailText = (letter: FormalLetter): string =>
  `${letter.body.trim()}\n\n${letter.senderName.trim()}\n${letter.senderEmail.trim()}`;

export const buildFormalEmailHtml = (letter: FormalLetter): string => {
  const senderName = escapeHtml(letter.senderName.trim());
  const senderEmail = escapeHtml(letter.senderEmail.trim());
  const paragraphs = toParagraphHtml(letter.body);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;">
      <tr>
        <td style="padding:8px 4px 16px;max-width:640px;">
          ${paragraphs}
          <div style="margin-top:28px;padding-top:16px;border-top:1px solid #e5e5e5;font-family:'Segoe UI',Arial,sans-serif;">
            <p style="margin:0;font-size:15px;line-height:1.5;color:#1f1f1f;font-weight:600;">${senderName}</p>
            <p style="margin:4px 0 0;font-size:13px;line-height:1.4;color:#5f5f5f;">${senderEmail}</p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
