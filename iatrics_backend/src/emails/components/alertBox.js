const escapeHtml = require("../../utils/escapeHtml");

function alertBox(message, tone = "info") {
  const tones = {
    info: { bg: "#EFF8FF", border: "#B2DDFF", color: "#1849A9" },
    warning: { bg: "#FFFAEB", border: "#FEDF89", color: "#B54708" },
    success: { bg: "#ECFDF3", border: "#ABEFC6", color: "#067647" },
  };
  const selected = tones[tone] || tones.info;

  return `<div style="margin:18px 0;padding:12px 14px;background:${selected.bg};border:1px solid ${selected.border};border-radius:8px;color:${selected.color};font-size:14px;line-height:22px;">${escapeHtml(message)}</div>`;
}

module.exports = alertBox;
