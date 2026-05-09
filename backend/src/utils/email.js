const { ApiError } = require('./errors');

/**
 * Send an email via the Brevo (Sendinblue) transactional API.
 */
const sendBrevoEmail = async ({ to, toName, subject, htmlContent, attachment }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'info@forgerealm.co.uk';
  const senderName = process.env.BREVO_SENDER_NAME || 'ForgeRealm';

  if (!apiKey) {
    throw new ApiError(500, 'BREVO_API_KEY is not configured');
  }

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to, name: toName || to }],
    subject,
    htmlContent,
  };

  // attachment: { buffer: Buffer, filename: string }
  if (attachment?.buffer) {
    payload.attachment = [{ content: attachment.buffer.toString('base64'), name: attachment.filename }];
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    console.error('Brevo email failed:', { status: response.status, message: body.message });
    throw new ApiError(502, body.message || 'Failed to send email');
  }
};

/**
 * Send an order confirmation email.
 */
const sendOrderConfirmation = async ({ order }) => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(148,163,184,0.15);color:#e2e8f0;font-size:14px;">
          ${item.name}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid rgba(148,163,184,0.15);color:#94a3b8;font-size:14px;text-align:center;">
          x${item.qty}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid rgba(148,163,184,0.15);color:#e2e8f0;font-size:14px;text-align:right;font-weight:600;">
          &pound;${((item.price * item.qty) / 100).toFixed(2)}
        </td>
      </tr>`
    )
    .join('');

  const htmlContent = `
    <div style="margin:0;padding:0;background:#0b1220;font-family:'Trebuchet MS',Arial,sans-serif;color:#e2e8f0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;padding:32px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;border-radius:28px;overflow:hidden;background:#0f172a;border:1px solid rgba(148,163,184,0.15);box-shadow:0 24px 60px rgba(59,130,246,0.25);">
              <tr>
                <td style="padding:28px 28px 12px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align:left;">
                        <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:rgba(16,185,129,0.15);border:1px solid rgba(52,211,153,0.35);text-transform:uppercase;letter-spacing:0.32em;font-size:10px;color:#6ee7b7;">
                          Order Confirmed
                        </div>
                      </td>
                      <td style="text-align:right;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.2em;">
                        #${String(order.id).padStart(5, '0')}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 28px 0;">
                  <h1 style="margin:0;font-size:28px;line-height:1.2;color:#f8fafc;">
                    Thanks for your order!
                  </h1>
                  <p style="margin:12px 0 0;font-size:15px;color:#cbd5f5;">
                    Hey ${order.customer_name.split(' ')[0] || 'Maker'}, your ForgeRealm prints are being prepared. We'll have them ready within 3-5 business days.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 28px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(15,23,42,0.7);border-radius:18px;border:1px solid rgba(148,163,184,0.15);">
                    <tr>
                      <td style="padding:20px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <th style="text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.15em;padding-bottom:12px;border-bottom:1px solid rgba(148,163,184,0.15);">Item</th>
                            <th style="text-align:center;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.15em;padding-bottom:12px;border-bottom:1px solid rgba(148,163,184,0.15);">Qty</th>
                            <th style="text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.15em;padding-bottom:12px;border-bottom:1px solid rgba(148,163,184,0.15);">Price</th>
                          </tr>
                          ${itemsHtml}
                          <tr>
                            <td colspan="2" style="padding:10px 0 4px;font-size:13px;color:#94a3b8;">Shipping</td>
                            <td style="padding:10px 0 4px;text-align:right;font-size:13px;color:${order.shipping_pence === 0 ? '#6ee7b7' : '#e2e8f0'};">${order.shipping_pence === 0 ? 'Free' : '&pound;' + (order.shipping_pence / 100).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding:12px 0 0;border-top:1px solid rgba(148,163,184,0.2);font-size:16px;font-weight:700;color:#f8fafc;">Total</td>
                            <td style="padding:12px 0 0;border-top:1px solid rgba(148,163,184,0.2);text-align:right;font-size:18px;font-weight:700;color:#f8fafc;">&pound;${(order.total_pence / 100).toFixed(2)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${order.shipping_address ? `
              <tr>
                <td style="padding:0 28px 24px;">
                  <div style="padding:16px 18px;border-radius:18px;background:rgba(15,23,42,0.7);border:1px solid rgba(148,163,184,0.15);font-size:13px;color:#cbd5f5;">
                    <p style="margin:0 0 8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.15em;">Shipping to</p>
                    <p style="margin:0;color:#e2e8f0;font-weight:600;">${order.customer_name}</p>
                    <p style="margin:4px 0 0;">${order.shipping_address}</p>
                  </div>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:0 28px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.2em;">
                        ForgeRealm Lab &middot; Leeds, UK
                      </td>
                      <td style="text-align:right;font-size:11px;color:#94a3b8;">
                        Questions? Reply to this email.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 28px;">
                  <div style="border-top:1px solid rgba(148,163,184,0.2);padding-top:16px;font-size:12px;color:#cbd5f5;">
                    <p style="margin:0 0 6px;">info@forgerealm.co.uk</p>
                    <p style="margin:0;">Leeds, United Kingdom</p>
                  </div>
                </td>
              </tr>
            </table>
            <p style="margin:18px 0 0;font-size:11px;color:#64748b;text-align:center;">
              You received this email because you placed an order at ForgeRealm.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;

  await sendBrevoEmail({
    to: order.customer_email,
    toName: order.customer_name,
    subject: `Order #${String(order.id).padStart(5, '0')} confirmed - ForgeRealm`,
    htmlContent,
  });
};

module.exports = { sendBrevoEmail, sendOrderConfirmation };
