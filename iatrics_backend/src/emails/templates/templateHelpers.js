const escapeHtml = require("../../utils/escapeHtml");
const button = require("../components/button");
const infoCard = require("../components/infoCard");
const alertBox = require("../components/alertBox");
const receiptTable = require("../components/receiptTable");
const { styles } = require("../emailStyles");

function paragraph(text) {
  return `<p style="${styles.p}">${escapeHtml(text)}</p>`;
}

function heading(text) {
  return `<h1 style="${styles.h1}">${escapeHtml(text)}</h1>`;
}

function linkFallback(url) {
  if (!url) return "";
  return `<p style="${styles.muted}">If the button does not work, copy and paste this link into your browser:<br><a href="${escapeHtml(url)}" style="color:#0A7C6B;word-break:break-all;">${escapeHtml(url)}</a></p>`;
}

function list(items = []) {
  const safeItems = items.map((item) => `<li style="margin:0 0 8px;">${escapeHtml(item)}</li>`).join("");
  return `<ul style="margin:12px 0 18px;padding-left:22px;color:#344054;font-size:15px;line-height:24px;">${safeItems}</ul>`;
}

function textBlock(lines = []) {
  return lines.filter(Boolean).join("\n\n");
}

function formatMoney(amount, currency = "NGN") {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

module.exports = {
  alertBox,
  button,
  escapeHtml,
  formatMoney,
  heading,
  infoCard,
  linkFallback,
  list,
  paragraph,
  receiptTable,
  textBlock,
};
