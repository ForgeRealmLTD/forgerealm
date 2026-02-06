const { ApiError, asyncHandler } = require('../utils/errors');

const addSubscriber = asyncHandler(async (req, res) => {
  const { email, firstName, lastName, company } = req.body;
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_SUBSCRIBE_LIST_ID || '7';

  if (!apiKey) {
    throw new ApiError(500, 'BREVO_API_KEY is not configured');
  }
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const payload = {
    email,
    attributes: {
      FIRSTNAME: firstName || '',
      LASTNAME: lastName || '',
      COMPANY: company || '',
    },
    updateEnabled: true,
    listIds: [Number(listId)],
  };

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(502, body.message || 'Failed to add subscriber');
  }

  res.json({ success: true });
});

module.exports = { addSubscriber };
