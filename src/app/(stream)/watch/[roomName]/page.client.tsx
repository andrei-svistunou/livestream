"use client";

import { Chat } from "@/components/chat";
import { ReactionBar } from "@/components/reaction-bar";
import { Spinner } from "@/components/spinner";
import { StreamPlayer } from "@/components/stream-player";
import { TokenContext } from "@/components/token-context";
import { JoinStreamResponse } from "@/lib/controller";
import { cn } from "@/lib/utils";
import { LiveKitRoom } from "@livekit/components-react";
import {
  ArrowRightIcon,
  ChatBubbleIcon,
  Cross1Icon,
  PersonIcon,
} from "@radix-ui/react-icons";
import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const AVATAR_EMOJIS = [
  "😀",
  "😎",
  "🤠",
  "🦊",
  "🐱",
  "🐶",
  "🦁",
  "🐼",
  "🦄",
  "🐲",
  "🤖",
  "👽",
  "⚽️",
  "🥅",
  "👟",
  "🧤",
  "🧦",
  "🏟️",
  "🏈",
  "🏀",
  "🏐",
  "🎾",
  "🏓",
];

type PageState = "checking" | "not_active" | "join_form" | "connected";

function StreamView({
  serverUrl,
  roomToken,
  authToken,
}: {
  serverUrl: string;
  roomToken: string;
  authToken: string;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

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
      <LiveKitRoom
        serverUrl={serverUrl}
        token={roomToken}
        onDisconnected={() => router.push("/")}
      >
        <div className="relative w-full h-screen overflow-hidden">
          <Flex direction="column" className="w-full h-full">
            <Box className="flex-1 bg-gray-1 min-h-0">
              <StreamPlayer />
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

export default function WatchPage({
  roomName,
  serverUrl,
}: {
  roomName: string;
  serverUrl: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [roomToken, setRoomToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>("checking");
  const [error, setError] = useState("");

  const checkStream = useCallback(async () => {
    setPageState("checking");
    try {
      const res = await fetch(
        `/api/check_stream?room_name=${encodeURIComponent(roomName)}`,
      );
      const data = await res.json();
      setPageState(data.active ? "join_form" : "not_active");
    } catch {
      setPageState("not_active");
    }
  }, [roomName]);

  useEffect(() => {
    checkStream();
  }, [checkStream]);

  const onJoin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/join_stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_name: roomName,
          identity: name,
          avatar_emoji: selectedAvatar || undefined,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to join stream");
      }

      const {
        auth_token,
        connection_details: { token },
      } = (await res.json()) as JoinStreamResponse;

      setAuthToken(auth_token);
      setRoomToken(token);
      setPageState("connected");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join");
      setLoading(false);
    }
  };

  if (pageState === "connected" && authToken && roomToken) {
    return (
      <StreamView
        serverUrl={serverUrl}
        roomToken={roomToken}
        authToken={authToken}
      />
    );
  }

  if (pageState === "checking") {
    return (
      <Flex align="center" justify="center" className="min-h-screen">
        <Flex direction="column" align="center" gap="3">
          <Spinner />
          <Text size="2" className="text-gray-11">
            Checking stream status...
          </Text>
        </Flex>
      </Flex>
    );
  }

  if (pageState === "not_active") {
    return (
      <Flex align="center" justify="center" className="min-h-screen p-4">
        <Card className="p-6 w-full max-w-[420px]">
          <Flex direction="column" align="center" gap="4">
            <Text size="6">📡</Text>
            <Heading size="4">Stream not available</Heading>
            <Text size="2" className="text-gray-11 text-center">
              The stream &quot;{decodeURI(roomName)}&quot; hasn&apos;t started
              yet or has ended.
            </Text>
            <Flex gap="3" mt="2">
              <Button
                variant="soft"
                color="gray"
                onClick={() => router.push("/")}
              >
                Go home
              </Button>
              <Button onClick={checkStream}>Check again</Button>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    );
  }

  // join_form state
  return (
    <Flex align="center" justify="center" className="min-h-screen p-4">
      <Card className="p-4 sm:p-6 w-full max-w-[420px]">
        <Heading size="4" className="mb-4">
          Join {decodeURI(roomName)}
        </Heading>

        <Flex direction="column" gap="4">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Your name
            </Text>
            <TextField.Root>
              <TextField.Slot>
                {selectedAvatar ? (
                  <Text size="2">{selectedAvatar}</Text>
                ) : (
                  <Avatar
                    size="1"
                    radius="full"
                    fallback={name ? name[0] : <PersonIcon />}
                  />
                )}
              </TextField.Slot>
              <TextField.Input
                placeholder="Enter your name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === "Enter" && name) {
                    onJoin();
                  }
                }}
              />
            </TextField.Root>
          </label>

          <div>
            <Text as="div" size="2" mb="2" weight="bold">
              Choose avatar
            </Text>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() =>
                    setSelectedAvatar(emoji === selectedAvatar ? "" : emoji)
                  }
                  className={cn(
                    "text-xl p-2 rounded-xl border transition-colors",
                    selectedAvatar === emoji
                      ? "border-accent-9 bg-accent-3"
                      : "border-transparent hover:bg-accent-2",
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <Text size="2" color="red">
              {error}
            </Text>
          )}

          <Flex gap="3" justify="between" align="center">
            <Button
              variant="soft"
              color="gray"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
            <Button disabled={!name || loading} onClick={onJoin}>
              {loading ? (
                <Flex gap="2" align="center">
                  <Spinner />
                  <Text>Joining...</Text>
                </Flex>
              ) : (
                <>
                  Join stream{" "}
                  <ArrowRightIcon className={cn(name && "animate-wiggle")} />
                </>
              )}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
