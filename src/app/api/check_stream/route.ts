import { Controller } from "@/lib/controller";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const roomName = url.searchParams.get("room_name");

  if (!roomName) {
    return Response.json({ error: "room_name is required" }, { status: 400 });
  }

  const controller = new Controller();
  try {
    const active = await controller.checkStream(roomName);
    return Response.json({ active, room_name: roomName });
  } catch {
    return Response.json({ active: false, room_name: roomName });
  }
}
