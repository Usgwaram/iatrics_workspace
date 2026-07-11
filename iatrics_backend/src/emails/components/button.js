const escapeHtml = require("../../utils/escapeHtml");
const { colors } = require("../emailStyles");

function button({ label, url }) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0;">
      <tr>
        <td style="border-radius:6px;background:${colors.primary};">
          <a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 18px;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;border-radius:6px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

module.exports = button;
