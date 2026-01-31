import { NextResponse } from "next/server";

function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

export async function POST(request: Request) {
  try {
    let payload: any = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else {
      const form = await request.formData();
      payload = {
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        email: form.get("email"),
        company: form.get("company"),
      };
    }

    const email = String(payload.email || "");
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const listId = process.env.BREVO_SUBSCRIBE_LIST_ID || "7";

    if (!apiKey) {
      return NextResponse.json(
        { message: "Brevo env vars are not configured" },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email,
        updateEnabled: true,
        listIds: [Number(listId)],
        attributes: {
          FIRSTNAME: payload.firstName || "",
          LASTNAME: payload.lastName || "",
          COMPANY: payload.company || "",
        },
      }),
      cache: "no-store",
    });

    if (res.ok) {
      return NextResponse.json({ ok: true });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { message: data?.message || "Brevo error" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

