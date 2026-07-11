const escapeHtml = require("../../utils/escapeHtml");

function receiptTable(items = []) {
  const rows = items
    .filter((item) => item.value !== undefined && item.value !== null)
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E4E7EC;color:#667085;font-size:14px;">${escapeHtml(item.label)}</td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #E4E7EC;color:#182230;font-size:14px;font-weight:700;">${escapeHtml(item.value)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0;">
      ${rows}
    </table>
  `;
}

module.exports = receiptTable;
