import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {  roomName } = await req.json();
const link ="https://livestream-delta-nine.vercel.app/watch/2"
    if (!link) {
      return NextResponse.json({ error: "Link is required" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("Telegram credentials not configured");
      return NextResponse.json({ error: "Telegram credentials not configured" }, { status: 500 });
    }

    const message = `🔴 <b>Трансляция ${roomName || "Stream"} уже началась!</b> \n<a href="${link}">Нажми здесь, чтобы присоединиться!</a>`;

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Telegram API Error:", errorText);
      return NextResponse.json({ error: "Failed to send to Telegram" }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Share Telegram Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
