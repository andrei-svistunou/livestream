import { Controller, getSessionFromReq } from "@/lib/controller";

export async function POST(req: Request) {
  const controller = new Controller();

  try {
    const session = getSessionFromReq(req);
    await controller.stopRecording(session);
    return new Response("Recording stopped", { status: 200 });
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }
    return new Response(null, { status: 500 });
  }
}
