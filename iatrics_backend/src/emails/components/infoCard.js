const escapeHtml = require("../../utils/escapeHtml");

function infoCard(items = []) {
  const rows = items
    .filter((item) => item.value !== undefined && item.value !== null && item.value !== "")
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#667085;font-size:13px;line-height:20px;width:42%;">${escapeHtml(item.label)}</td>
          <td style="padding:8px 0;color:#182230;font-size:14px;line-height:20px;font-weight:600;">${escapeHtml(item.value)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0;border:1px solid #E4E7EC;border-radius:8px;background:#FCFCFD;">
      <tr>
        <td style="padding:12px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${rows}
          </table>
        </td>
      </tr>
    </table>
  `;
}

module.exports = infoCard;
