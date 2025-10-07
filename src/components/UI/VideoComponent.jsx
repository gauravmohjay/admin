import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  TrackToggle,
  useTracks,
  ConnectionStateToast,
  FocusLayout,
  GridLayout, // Import GridLayout for the default view
  useLocalParticipant,
} from "@livekit/components-react";
import { Track, Room } from "livekit-client";
import "@livekit/components-styles";

function DynamicVideoLayout() {
  // Use a single `useTracks` call to get all camera and screen share tracks.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const screenShareTrack = tracks.find(
    (track) => track.source === Track.Source.ScreenShare
  );

  // Filter for only camera tracks to pass to the grid layout
  const cameraTracks = tracks.filter(
    (track) => track.source === Track.Source.Camera
  );

  // If a screen is being shared, render the presentation/focus layout.
  if (screenShareTrack) {
    return (
      <div className="flex h-full flex-col gap-2 p-2 md:flex-row">
        {/* Main Focus Area for Screen Share */}
        <div className="flex-1">
          <FocusLayout trackRef={screenShareTrack} className="h-full w-full" />
        </div>

        {/* Responsive Participant Sidebar */}
        <div className="flex h-32 w-full flex-row gap-2 md:h-full md:w-48 md:flex-col">
          {cameraTracks.map((track) => (
            <ParticipantTile
              key={track.participant.identity}
              trackRef={track}
              className="h-full w-32 flex-shrink-0 rounded-lg bg-zinc-800 md:h-24 md:w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  // Otherwise, render the standard Google Meet-style grid layout.
  return (
    <div className="h-[90vh] p-2">
      <GridLayout tracks={cameraTracks}>
        {/* The ParticipantTile component is used as a template for each participant in the grid. */}
        <ParticipantTile className="rounded-lg bg-zinc-800" />
      </GridLayout>
    </div>
  );
}

// Custom Control Bar (No changes needed, remains as is)
function CustomControlBar({
  role,
  onStartScreenRecording,
  onStopScreenRecording,
  onStartRoomRecording,
  onStopRoomRecording,
  isScreenRecording,
  isRoomRecording,
  isScreenSharing,
}) {
  const { localParticipant } = useLocalParticipant();
  const isMuted = !localParticipant?.isMicrophoneEnabled;
  const isCameraOff = !localParticipant?.isCameraEnabled;

  const baseButtonStyles =
    "flex flex-col items-center gap-1 rounded-lg p-3 text-xs font-medium text-white transition-all duration-200 min-w-[80px] hover:bg-white/20 hover:-translate-y-px";

  return (
    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
      <div className="flex gap-2">
        <TrackToggle
          source={Track.Source.Microphone}
          className={`${baseButtonStyles} ${
            isMuted ? "bg-red-500" : "bg-white/10"
          }`}
        >
          <span className="text-xs">{isMuted ? "Unmute" : "Mute"}</span>
        </TrackToggle>
        <TrackToggle
          source={Track.Source.Camera}
          className={`${baseButtonStyles} ${
            isCameraOff ? "bg-red-500" : "bg-white/10"
          }`}
        >
          <span className="text-xs">
            {isCameraOff ? "Start Cam" : "Stop Cam"}
          </span>
        </TrackToggle>
        <TrackToggle
          source={Track.Source.ScreenShare}
          className={`${baseButtonStyles} ${
            isScreenSharing ? "bg-blue-500" : "bg-white/10"
          }`}
        >
          <span className="text-xs">
            {isScreenSharing ? "Stop Share" : "Share Screen"}
          </span>
        </TrackToggle>
      </div>
      {role === "host" && (
        <div className="flex gap-2">
          <button
            onClick={
              isScreenRecording ? onStopScreenRecording : onStartScreenRecording
            }
            disabled={!isScreenSharing}
            className={`${baseButtonStyles} ${
              isScreenRecording ? "bg-red-600" : "bg-white/10"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span>{isScreenRecording ? "Stop Record" : "Record Screen"}</span>
          </button>
          <button
            onClick={
              isRoomRecording ? onStopRoomRecording : onStartRoomRecording
            }
            className={`${baseButtonStyles} ${
              isRoomRecording ? "bg-red-600" : "bg-white/10"
            }`}
          >
            <span>{isRoomRecording ? "Stop Record" : "Record Room"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Main Video Component Wrapper (No logical changes, just uses the new layout)
const VideoComponent = forwardRef(
  ({ socket, scheduleId, role, occurrenceId, userId, username }, ref) => {
    const [room] = useState(
      () =>
        new Room({
          autoSubscribe: true,
          videoCaptureDefaults: {
            resolution: { width: 1920, height: 1080 },
            frameRate: 30,
          },
          publishDefaults: {
            videoEncoding: {
              maxBitrate: 3_000_000,
              maxFramerate: 30,
            },
            videoSimulcastLayers: [
              {
                width: 1280,
                height: 720,
                encoding: { maxBitrate: 1_500_000 },
              },
              {
                width: 640,
                height: 360,
                encoding: { maxBitrate: 500_000 },
              },
            ],
          },
        })
    );

    const [token, setToken] = useState(null);
    const [url, setUrl] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isScreenRecording, setIsScreenRecording] = useState(false);
    const [isRoomRecording, setIsRoomRecording] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [error, setError] = useState(null);
    const connectionAttempted = useRef(false);

    // ... (All your useEffect hooks for socket events, token requests, and room events remain unchanged and are correct)
    useEffect(() => {
      if (!socket) return;

      const handleLivekitAuth = ({ url, token }) => {
        setUrl(url);
        setToken(token);
      };

      const handleScreenRecordingStarted = (result) => {
        setIsScreenRecording(true);
        alert(`Screen recording started: ${result.filename}`);
      };

      const handleScreenRecordingStopped = (result) => {
        setIsScreenRecording(false);
        alert(`Screen recording saved as: ${result.filename}`);
      };

      const handleRecordingError = (error) => {
        alert(`Recording error: ${error.message}`);
        setIsScreenRecording(false);
      };

      const handleRoomRecordingStarted = (result) => {
        setIsRoomRecording(true);
        alert(`Room recording started: ${result.filename}`);
      };

      const handleRoomRecordingStopped = (result) => {
        setIsRoomRecording(false);
        alert(`Room recording saved as: ${result.filename}`);
      };

      socket.on("livekit-auth", handleLivekitAuth);
      socket.on("screenRecordingStarted", handleScreenRecordingStarted);
      socket.on("screenRecordingStopped", handleScreenRecordingStopped);
      socket.on("recordingError", handleRecordingError);
      socket.on("roomRecordingStarted", handleRoomRecordingStarted);
      socket.on("roomRecordingStopped", handleRoomRecordingStopped);

      return () => {
        socket.off("livekit-auth", handleLivekitAuth);
        socket.off("screenRecordingStarted", handleScreenRecordingStarted);
        socket.off("screenRecordingStopped", handleScreenRecordingStopped);
        socket.off("recordingError", handleRecordingError);
        socket.off("roomRecordingStarted", handleRoomRecordingStarted);
        socket.off("roomRecordingStopped", handleRoomRecordingStopped);
      };
    }, [socket]);

    useEffect(() => {
      if (!socket || !scheduleId || connectionAttempted.current) return;
      connectionAttempted.current = true;
      socket.emit("request-livekit-token", {
        scheduleId,
        occurrenceId,
        userId,
        username,
        role,
        platformId: "miskills",
      });
    }, [socket, scheduleId, occurrenceId, userId, username, role]);

    useEffect(() => {
      if (!room) return;
      const handleTrackPublished = (pub, participant) => {
        if (
          participant.identity === room.localParticipant.identity &&
          pub.source === "screen_share"
        ) {
          setIsScreenSharing(true);
        }
      };
      const handleTrackUnpublished = (pub, participant) => {
        if (
          participant.identity === room.localParticipant.identity &&
          pub.source === "screen_share"
        ) {
          setIsScreenSharing(false);
        }
      };

      const handleConnected = () => {
        setIsConnected(true);
        setError(null);
      };

      const handleDisconnected = () => {
        setIsConnected(false);
      };

      const handleError = (error) => {
        setError(`Room error: ${error.message}`);
      };
      room.on("trackPublished", handleTrackPublished);
      room.on("trackUnpublished", handleTrackUnpublished);
      room.on("connected", handleConnected);
      room.on("disconnected", handleDisconnected);
      room.on("error", handleError);
      return () => {
        room.off("trackPublished", handleTrackPublished);
        room.off("trackUnpublished", handleTrackUnpublished);
        room.off("connected", handleConnected);
        room.off("disconnected", handleDisconnected);
        room.off("error", handleError);
      };
    }, [room]);

    const startScreenRecording = () => {
      if (role !== "host" || !socket) return;
      if (!isScreenSharing) {
        alert(
          "Please start screen sharing first before recording your screen."
        );
        return;
      }
      socket.emit("startScreenRecording", {
        occurrenceId,
        scheduleId,
        userId,
        username,
        role,
      });
    };

    const stopScreenRecording = () => {
      if (role !== "host" || !socket) return;
      socket.emit("stopScreenRecording", {
        scheduleId,
        occurrenceId,
        userId,
        username,
        role,
      });
    };

    const startRoomRecording = () => {
      if (role !== "host" || !socket) return;
      socket.emit("startRoomRecording", {
        occurrenceId,
        scheduleId,
        userId,
        username,
        role,
      });
    };

    const stopRoomRecording = () => {
      if (role !== "host" || !socket) return;
      socket.emit("stopRoomRecording", {
        scheduleId,
        occurrenceId,
        userId,
        username,
        role,
      });
    };
    useImperativeHandle(ref, () => ({
      startScreenRecording,
      stopScreenRecording,
      startRoomRecording,
      stopRoomRecording,
      toggleMic: () => {
        room.localParticipant.setMicrophoneEnabled(
          !room.localParticipant.isMicrophoneEnabled
        );
      },
      toggleCamera: () => {
        room.localParticipant.setCameraEnabled(
          !room.localParticipant.isCameraEnabled
        );
      },
      toggleScreenShare: () => {
        room.localParticipant.setScreenShareEnabled(
          !room.localParticipant.isScreenShareEnabled
        );
      },
    }));

    // Loading and Error states (remain unchanged)
    if (!token || !url) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-center text-white">
          <div>
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-green-500"></div>
            <p>Connecting to video call...</p>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-center text-white">
          <div className="rounded-lg bg-zinc-800 p-8">
            <h3 className="mb-2 text-lg font-bold text-red-500">
              Connection Error
            </h3>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-zinc-900">
        {(isScreenRecording || isRoomRecording) && (
          <div
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-white ${
              isRoomRecording ? "bg-green-600" : "bg-violet-600"
            }`}
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
            <span>
              {isRoomRecording ? "Room Recording" : "Screen Recording"} in
              progress...
            </span>
          </div>
        )}

        <LiveKitRoom
          room={room}
          token={token}
          serverUrl={url}
          connect={true}
          className="flex h-full flex-col"
        >
          <ConnectionStateToast />
          <div className="min-h-0 flex-1">
            {/* Use the new dynamic layout component */}
            <DynamicVideoLayout />
          </div>
          {/* <div className="border-t border-zinc-800 bg-black/50 p-4">
            <CustomControlBar
              role={role}
              onStartScreenRecording={startScreenRecording}
              onStopScreenRecording={stopScreenRecording}
              onStartRoomRecording={startRoomRecording}
              onStopRoomRecording={stopRoomRecording}
              isScreenRecording={isScreenRecording}
              isRoomRecording={isRoomRecording}
              isScreenSharing={isScreenSharing}
            />
          </div> */}
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    );
  }
);

export default VideoComponent;
