"use client";

import { Chat } from "@/components/chat";
import { ReactionBar } from "@/components/reaction-bar";
import { StreamPlayer } from "@/components/stream-player";
import { TokenContext } from "@/components/token-context";
import { cn } from "@/lib/utils";
import { LiveKitRoom } from "@livekit/components-react";
import { ChatBubbleIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Box, Flex } from "@radix-ui/themes";
import { useCallback, useState } from "react";

export default function HostPage({
  authToken,
  roomToken,
  serverUrl,
}: {
  authToken: string;
  roomToken: string;
  serverUrl: string;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNewMessage = useCallback(() => {
    if (!chatOpen) {
      setUnreadCount((c) => c + 1);
    }
  }, [chatOpen]);

  const handleOpenChat = () => {
    setChatOpen(!chatOpen);
    if (!chatOpen) setUnreadCount(0);
  };

  return (
    <TokenContext.Provider value={authToken}>
      <LiveKitRoom serverUrl={serverUrl} token={roomToken}>
        <div className="relative w-full h-screen overflow-hidden">
          <Flex direction="column" className="w-full h-full">
            <Box className="flex-1 bg-gray-1 min-h-0">
              <StreamPlayer isHost />
            </Box>
            <ReactionBar />
          </Flex>

          {/* Chat toggle button */}
          <button
            onClick={handleOpenChat}
            className={cn(
              "fixed top-1/2 -translate-y-1/2 z-30 bg-accent-3 border border-accent-5 p-3 rounded-l-xl transition-all duration-300 cursor-pointer",
              chatOpen ? "right-[calc(100%-16px)] sm:right-[340px]" : "right-0",
            )}
          >
            <div className="relative">
              {chatOpen ? <Cross1Icon /> : <ChatBubbleIcon />}
              {!chatOpen && unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-9 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
          </button>

          {/* Chat panel */}
          <div
            className={cn(
              "fixed right-0 top-0 h-full w-full sm:w-[340px] z-20 bg-accent-2 border-l border-accent-5 transition-transform duration-300",
              chatOpen ? "translate-x-0" : "translate-x-full",
            )}
          >
            <Chat onNewMessage={handleNewMessage} />
          </div>
        </div>
      </LiveKitRoom>
    </TokenContext.Provider>
  );
}
