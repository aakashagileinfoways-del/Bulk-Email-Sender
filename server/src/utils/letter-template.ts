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

export const buildFormalEmailText = (body: string): string => body.trim();

export const buildFormalEmailHtml = (body: string): string => {
  const paragraphs = toParagraphHtml(body);

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
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
