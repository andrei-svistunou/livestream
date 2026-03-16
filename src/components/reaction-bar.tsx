"use client";

import { useChat, useDataChannel } from "@livekit/components-react";
import { Button, Flex, Tooltip } from "@radix-ui/themes";
import { DataPacket_Kind } from "livekit-client";
import { useState } from "react";

export function ReactionBar() {
  const [encoder] = useState(() => new TextEncoder());
  const { send } = useDataChannel("reactions");
  const { send: sendChat } = useChat();

  const onSend = (emoji: string) => {
    send(encoder.encode(emoji), { kind: DataPacket_Kind.LOSSY });
    if (sendChat) {
      sendChat(emoji);
    }
  };

  return (
    <Flex
      gap="2"
      justify="center"
      align="center"
      className="border-t border-accent-5 bg-accent-3 h-[60px] sm:h-[80px] text-center px-2"
    >
      <Tooltip content="Fire" delayDuration={0}>
        <Button size="3" variant="outline" onClick={() => onSend("🔥")}>
          🔥
        </Button>
      </Tooltip>
      <Tooltip content="Applause">
        <Button size="3" variant="outline" onClick={() => onSend("👏")}>
          👏
        </Button>
      </Tooltip>
      <Tooltip content="LOL">
        <Button size="3" variant="outline" onClick={() => onSend("🤣")}>
          🤣
        </Button>
      </Tooltip>
      <Tooltip content="Love">
        <Button size="3" variant="outline" onClick={() => onSend("❤️")}>
          ❤️
        </Button>
      </Tooltip>
      <Tooltip content="Confetti">
        <Button size="3" variant="outline" onClick={() => onSend("🎉")}>
          🎉
        </Button>
      </Tooltip>
    </Flex>
  );
}
