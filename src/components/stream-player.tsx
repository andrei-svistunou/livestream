import { useCopyToClipboard } from "@/lib/clipboard";
import { ParticipantMetadata, RoomMetadata } from "@/lib/controller";
import {
  AudioTrack,
  StartAudio,
  VideoTrack,
  useDataChannel,
  useLocalParticipant,
  useMediaDeviceSelect,
  useParticipants,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import {
  CopyIcon,
  ExitIcon,
  EyeClosedIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import { Avatar, Badge, Button, Flex, Grid, Text } from "@radix-ui/themes";
import Confetti from "js-confetti";
import {
  ConnectionState,
  LocalVideoTrack,
  TrackProcessor,
  VideoProcessorOptions,
  Track,
} from "livekit-client";
import type { MutableRefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MediaDeviceSettings } from "./media-device-settings";
import { PresenceDialog } from "./presence-dialog";
import { useAuthToken } from "./token-context";

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createZoomVideoProcessor(
  zoomRef: MutableRefObject<number>,
): TrackProcessor<Track.Kind> {
  let videoEl: HTMLVideoElement | undefined;
  let canvasEl: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null | undefined;
  let rafId: number | undefined;
  let processedTrack: MediaStreamTrack | undefined;
  let destroyed = false;

  const stopLoop = () => {
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId);
      rafId = undefined;
    }
  };

  const cleanup = async () => {
    stopLoop();
    processedTrack?.stop();
    processedTrack = undefined;
    if (videoEl) {
      try {
        videoEl.pause();
      } catch {
        // ignore
      }
      videoEl.srcObject = null;
    }
    videoEl = undefined;
    canvasEl = undefined;
    ctx = undefined;
  };

  const startLoop = () => {
    if (!videoEl || !canvasEl || !ctx || destroyed) return;

    const draw = () => {
      if (!videoEl || !canvasEl || !ctx || destroyed) return;
      const vw = videoEl.videoWidth;
      const vh = videoEl.videoHeight;
      if (!vw || !vh) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      if (canvasEl.width !== vw || canvasEl.height !== vh) {
        canvasEl.width = vw;
        canvasEl.height = vh;
      }

      const zoom = clampNumber(zoomRef.current || 1, 1, 3);
      const srcW = vw / zoom;
      const srcH = vh / zoom;
      const sx = (vw - srcW) / 2;
      const sy = (vh - srcH) / 2;

      ctx.drawImage(videoEl, sx, sy, srcW, srcH, 0, 0, vw, vh);
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
  };

  const processor: TrackProcessor<Track.Kind> = {
    name: "zoom",
    processedTrack,
    init: async (opts) => {
      destroyed = false;
      await cleanup();

      const videoOpts = opts as VideoProcessorOptions;

      videoEl = document.createElement("video");
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.autoplay = true;

      canvasEl = document.createElement("canvas");
      ctx = canvasEl.getContext("2d");
      if (!ctx) {
        throw new Error(
          "Unable to create 2D canvas context for zoom processor",
        );
      }

      videoEl.srcObject = new MediaStream([videoOpts.track]);

      try {
        await videoEl.play();
      } catch {
        // If autoplay is blocked, LiveKit's processor element will still be playing.
        // We'll keep the loop running and draw once frames are available.
      }

      const stream = canvasEl.captureStream(30);
      processedTrack = stream.getVideoTracks()[0];
      processor.processedTrack = processedTrack;

      startLoop();
    },
    restart: async (opts) => {
      await processor.init(opts);
    },
    destroy: async () => {
      destroyed = true;
      await cleanup();
    },
  };

  return processor;
}

function ConfettiCanvas() {
  const [confetti, setConfetti] = useState<Confetti>();
  const [decoder] = useState(() => new TextDecoder());
  const canvasEl = useRef<HTMLCanvasElement>(null);
  useDataChannel("reactions", (data) => {
    const options: { emojis?: string[]; confettiNumber?: number } = {};

    if (decoder.decode(data.payload) !== "🎉") {
      options.emojis = [decoder.decode(data.payload)];
      options.confettiNumber = 12;
    }

    confetti?.addConfetti(options);
  });

  useEffect(() => {
    setConfetti(new Confetti({ canvas: canvasEl?.current ?? undefined }));
  }, []);

  return <canvas ref={canvasEl} className="absolute h-full w-full" />;
}

export function StreamPlayer({ isHost = false }) {
  const [_, copy] = useCopyToClipboard();
  const router = useRouter();

  const [cameraZoom, setCameraZoom] = useState(1);
  const cameraZoomRef = useRef(1);
  const streamAreaRef = useRef<HTMLDivElement>(null);
  const [pipActive, setPipActive] = useState(false);

  useEffect(() => {
    cameraZoomRef.current = cameraZoom;
  }, [cameraZoom]);

  const room = useRoomContext();
  const { metadata, name: roomName, state: roomState } = room;
  const roomMetadata = (metadata && JSON.parse(metadata)) as RoomMetadata;
  const { localParticipant } = useLocalParticipant();
  const localMetadata = (localParticipant.metadata &&
    JSON.parse(localParticipant.metadata)) as ParticipantMetadata;
  const localAvatarFallback =
    localMetadata?.avatar_emoji ?? localParticipant.identity[0] ?? "?";
  const canHost =
    isHost || (localMetadata?.invited_to_stage && localMetadata?.hand_raised);
  const participants = useParticipants();
  const showNotification = isHost
    ? participants.some((p) => {
        const metadata = (p.metadata &&
          JSON.parse(p.metadata)) as ParticipantMetadata;
        return metadata?.hand_raised && !metadata?.invited_to_stage;
      })
    : localMetadata?.invited_to_stage && !localMetadata?.hand_raised;

  const { activeDeviceId: activeCameraDeviceId } = useMediaDeviceSelect({
    kind: "videoinput",
  });

  useEffect(() => {
    if (!canHost) return;

    const cameraPub = localParticipant.getTrack(Track.Source.Camera);
    const cameraTrack = cameraPub?.track;
    if (!(cameraTrack instanceof LocalVideoTrack)) return;

    if (cameraPub?.isMuted) {
      void cameraTrack.stopProcessor();
      return;
    }

    const processor = createZoomVideoProcessor(cameraZoomRef);
    void cameraTrack.setProcessor(processor, true);

    return () => {
      void cameraTrack.stopProcessor();
    };
  }, [activeCameraDeviceId, canHost, localParticipant]);

  const localCameraTrack = useTracks([Track.Source.Camera]).find(
    (t) => t.participant.identity === localParticipant.identity,
  );

  const remoteVideoTracks = useTracks([Track.Source.Camera]).filter(
    (t) => t.participant.identity !== localParticipant.identity,
  );

  const remoteAudioTracks = useTracks([Track.Source.Microphone]).filter(
    (t) => t.participant.identity !== localParticipant.identity,
  );

  const authToken = useAuthToken();
  const [stoppingStream, setStoppingStream] = useState(false);

  const onStopStream = async () => {
    if (stoppingStream) return;
    setStoppingStream(true);
    try {
      const res = await fetch("/api/stop_stream", {
        method: "POST",
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to stop stream");
      }

      room.disconnect();
      router.push("/");
    } finally {
      setStoppingStream(false);
    }
  };

  const onLeaveStage = async () => {
    await fetch("/api/remove_from_stage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify({
        identity: localParticipant.identity,
      }),
    });
  };

  const onExitStream = () => {
    room.disconnect();
    router.push("/");
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setPipActive(false);
      } else if (streamAreaRef.current) {
        const videos = streamAreaRef.current.querySelectorAll("video");
        // Prefer the last video (usually the remote/main stream)
        const video = videos[videos.length - 1] || videos[0];
        if (video && document.pictureInPictureEnabled) {
          await video.requestPictureInPicture();
          setPipActive(true);
          video.addEventListener(
            "leavepictureinpicture",
            () => setPipActive(false),
            { once: true },
          );
        }
      }
    } catch {
      // PiP might not be supported
    }
  };

  return (
    <div ref={streamAreaRef} className="relative h-full w-full bg-black">
      <Grid className="w-full h-full absolute" gap="2">
        {canHost && (
          <div className="relative">
            <Flex
              className="absolute w-full h-full"
              align="center"
              justify="center"
            >
              <Avatar
                size="9"
                src={localMetadata?.avatar_image}
                fallback={localAvatarFallback}
                radius="full"
              />
            </Flex>
            {localParticipant.isCameraEnabled && localCameraTrack && (
              <VideoTrack
                trackRef={localCameraTrack}
                className="absolute w-full h-full object-contain -scale-x-100 bg-transparent"
              />
            )}
            <div className="absolute w-full h-full">
              <Badge
                variant="outline"
                color="gray"
                className="absolute bottom-2 right-2"
              >
                {localParticipant.identity} (you)
              </Badge>
            </div>
          </div>
        )}
        {remoteVideoTracks.map((t) => (
          <div key={t.participant.identity} className="relative">
            <Flex
              className="absolute w-full h-full"
              align="center"
              justify="center"
            >
              {(() => {
                let remoteMeta: ParticipantMetadata | undefined;
                try {
                  remoteMeta = (t.participant.metadata &&
                    JSON.parse(t.participant.metadata)) as ParticipantMetadata;
                } catch {
                  remoteMeta = undefined;
                }

                return (
                  <Avatar
                    size="9"
                    src={remoteMeta?.avatar_image}
                    fallback={
                      remoteMeta?.avatar_emoji ??
                      t.participant.identity[0] ??
                      "?"
                    }
                    radius="full"
                  />
                );
              })()}
            </Flex>
            <VideoTrack
              trackRef={t}
              className="absolute w-full h-full bg-transparent"
            />
            <div className="absolute w-full h-full">
              <Badge
                variant="outline"
                color="gray"
                className="absolute bottom-2 right-2"
              >
                {t.participant.identity}
              </Badge>
            </div>
          </div>
        ))}
      </Grid>
      {remoteAudioTracks.map((t) => (
        <AudioTrack trackRef={t} key={t.participant.identity} />
      ))}
      <ConfettiCanvas />
      <StartAudio
        label="Click to allow audio playback"
        className="absolute top-0 h-full w-full bg-gray-2-translucent text-white"
      />
      <div className="absolute top-0 w-full p-2">
        <Flex justify="between" align="start" wrap="wrap" gap="2">
          <Flex gap="2" justify="center" align="center" wrap="wrap">
            <Button
              size="1"
              variant="soft"
              className="cursor-pointer"
              disabled={!Boolean(roomName)}
              onClick={() =>
                copy(`${window.location.origin}/watch/${roomName}`)
              }
            >
              {roomState === ConnectionState.Connected ? (
                <>
                  {roomName} <CopyIcon />
                </>
              ) : (
                "Loading..."
              )}
            </Button>
            {roomName && canHost && (
              <Flex gap="2">
                <MediaDeviceSettings />
                <Flex gap="1" align="center">
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() =>
                      setCameraZoom(
                        (z) => Math.round(clampNumber(z - 0.1, 1, 3) * 10) / 10,
                      )
                    }
                    disabled={cameraZoom <= 1}
                  >
                    -
                  </Button>
                  <Text
                    size="1"
                    className="text-gray-11 min-w-[3.2rem] text-center"
                  >
                    {cameraZoom.toFixed(1)}x
                  </Text>
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() =>
                      setCameraZoom(
                        (z) => Math.round(clampNumber(z + 0.1, 1, 3) * 10) / 10,
                      )
                    }
                    disabled={cameraZoom >= 3}
                  >
                    +
                  </Button>
                </Flex>
                {roomMetadata?.creator_identity !==
                  localParticipant.identity && (
                  <Button size="1" onClick={onLeaveStage}>
                    Leave stage
                  </Button>
                )}
                {isHost &&
                  roomMetadata?.creator_identity ===
                    localParticipant.identity && (
                    <Button
                      size="1"
                      color="red"
                      variant="soft"
                      disabled={
                        roomState !== ConnectionState.Connected ||
                        stoppingStream
                      }
                      onClick={onStopStream}
                    >
                      {stoppingStream ? "Stopping..." : "Stop stream"}
                    </Button>
                  )}
              </Flex>
            )}
          </Flex>
          <Flex gap="2" align="center" wrap="wrap">
            {roomState === ConnectionState.Connected && (
              <Flex gap="1" align="center">
                <div className="rounded-6 bg-red-9 w-2 h-2 animate-pulse" />
                <Text size="1" className="uppercase text-accent-11">
                  Live
                </Text>
              </Flex>
            )}
            <PresenceDialog isHost={isHost}>
              <div className="relative">
                {showNotification && (
                  <div className="absolute flex h-3 w-3 -top-1 -right-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-6 bg-accent-11 opacity-75"></span>
                    <span className="relative inline-flex rounded-6 h-3 w-3 bg-accent-11"></span>
                  </div>
                )}
                <Button
                  size="1"
                  variant="soft"
                  disabled={roomState !== ConnectionState.Connected}
                >
                  {roomState === ConnectionState.Connected ? (
                    <EyeOpenIcon />
                  ) : (
                    <EyeClosedIcon />
                  )}
                  {roomState === ConnectionState.Connected
                    ? participants.length
                    : ""}
                </Button>
              </div>
            </PresenceDialog>
            {document.pictureInPictureEnabled && (
              <Button
                size="1"
                variant={pipActive ? "solid" : "soft"}
                onClick={togglePiP}
              >
                PiP
              </Button>
            )}
            {!isHost && (
              <Button
                size="1"
                color="red"
                variant="soft"
                onClick={onExitStream}
              >
                <ExitIcon /> Exit
              </Button>
            )}
          </Flex>
        </Flex>
      </div>
    </div>
  );
}
