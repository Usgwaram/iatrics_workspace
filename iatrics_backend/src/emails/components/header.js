const escapeHtml = require("../../utils/escapeHtml");
const { colors } = require("../emailStyles");

function header(config) {
  const logo = config.logoUrl
    ? `<img src="${escapeHtml(config.logoUrl)}" width="112" alt="Iatrics" style="display:block;border:0;max-width:112px;height:auto;margin-bottom:8px;">`
    : `<div style="font-size:22px;font-weight:800;color:#FFFFFF;margin-bottom:4px;">Iatrics</div>`;

  return `
    <tr>
      <td style="background:${colors.primary};padding:24px 28px;">
        ${logo}
        <div style="font-size:21px;font-weight:800;color:#FFFFFF;line-height:28px;">Iatrics</div>
        <div style="font-size:13px;color:#D1FADF;line-height:20px;">Healthcare Beyond Boundaries</div>
      </td>
    </tr>
  `;
}

module.exports = header;
