const header = require("./header");
const footer = require("./footer");
const { styles } = require("../emailStyles");
const escapeHtml = require("../../utils/escapeHtml");

function layout({ title, previewText, content, config, healthDisclaimer = false }) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="${styles.body}">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(previewText || "")}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="${styles.wrapper}">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="${styles.container}">
            <tr>
              <td>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="${styles.card}">
                  ${header(config)}
                  <tr>
                    <td style="${styles.content}">
                      ${content}
                    </td>
                  </tr>
                  ${footer(config, { healthDisclaimer })}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

module.exports = layout;
