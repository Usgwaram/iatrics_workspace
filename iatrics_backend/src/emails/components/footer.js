const escapeHtml = require("../../utils/escapeHtml");

function footer(config, { healthDisclaimer = false } = {}) {
  const year = new Date().getFullYear();
  const disclaimer = healthDisclaimer
    ? `<p style="margin:0 0 12px;color:#667085;font-size:12px;line-height:18px;">Iatrics supports access to healthcare services but does not replace emergency care. In a medical emergency, contact the appropriate local emergency service or proceed to the nearest emergency facility.</p>`
    : "";

  return `
    <tr>
      <td style="padding:20px 28px;background:#FFFFFF;border-top:1px solid #E4E7EC;">
        ${disclaimer}
        <p style="margin:0 0 8px;color:#667085;font-size:12px;line-height:18px;">Need help? Contact <a href="mailto:${escapeHtml(config.supportEmail)}" style="color:#0A7C6B;">${escapeHtml(config.supportEmail)}</a></p>
        <p style="margin:0 0 8px;color:#667085;font-size:12px;line-height:18px;">Visit <a href="${escapeHtml(config.appWebUrl)}" style="color:#0A7C6B;">${escapeHtml(config.appWebUrl)}</a></p>
        <p style="margin:0 0 8px;color:#667085;font-size:12px;line-height:18px;">&copy; ${year} Iatrics. All rights reserved.</p>
        <p style="margin:0;color:#667085;font-size:12px;line-height:18px;">This is an automated service email. Please do not share passwords, verification codes, payment credentials or confidential medical information by replying to this message.</p>
      </td>
    </tr>
  `;
}

module.exports = footer;
