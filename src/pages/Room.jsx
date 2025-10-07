// Room.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import {
  MessageSquare,
  Users,
  LogOut,
  Power,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Cast,
  X,
  Video,
  MonitorDot,
} from "lucide-react";
import VideoComponent from "../components/UI/VideoComponent";
import ChatComponent from "../components/UI/ChatComponent";

function IconButton({ onClick, icon: Icon, label, className = "", disabled, active }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2
        p-2 sm:p-3 ${className} ${active ? "ring-2 ring-white/40" : ""}`}
      title={label}
      aria-label={label}
      disabled={disabled}
      type="button"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

export default function Room() {
  const location = useLocation();
  const { scheduleId, occurrenceId, userId, username, role } = location.state || {};

  const videoRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isParticipantsVisible, setIsParticipantsVisible] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // ----- Socket Connection -----
  useEffect(() => {
    if (!scheduleId || !userId || !username) return;

    const newSocket = io("http://localhost:3000/video-calling", {
      auth: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiZGV2ZWxvcGVyIiwiZ2VuZXJhdGVkIjoiMjAyNS0wOC0yMVQxMTo0NjozMy41NDBaIiwidGltZXN0YW1wIjoxNzU1Nzc2NzkzNTQwLCJpYXQiOjE3NTU3NzY3OTMsImV4cCI6MTc4NzMxMjc5M30.ryYJdQysqHDBnDrFjBABz6vNYhHuipcD8zDkDng-U9I",
      },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => console.log("✅ Connected to server"));
    newSocket.on("disconnect", () => console.log("❌ Disconnected"));
    newSocket.on("error", (error) => alert(`Error: ${error.message}`));

    newSocket.emit("joinRoom", {
      scheduleId,
      occurrenceId,
      userId,
      username,
      role,
      platformId: "miskills",
    });

    newSocket.on("active-participants", (users) => setParticipants(users));
    newSocket.on("new-participant", (user) => {
      setParticipants((prev) => [...prev, user]);
    });
    newSocket.on("userLeft", (user) => {
      setParticipants((prev) => prev.filter((u) => u.userId !== user.userId));
    });
    newSocket.on("kicked", (data) => {
      alert(data.reason || "You have been removed from the meeting");
    });

    return () => newSocket.disconnect();
  }, [scheduleId, occurrenceId, userId, username, role]);

  // ----- Controls -----
  const handleToggleMic = () => {
    videoRef.current?.toggleMic();
    setIsMicOn((prev) => !prev);
  };

  const handleToggleCamera = () => {
    videoRef.current?.toggleCamera();
    setIsCamOn((prev) => !prev);
  };

  const handleToggleScreenShare = () => {
    videoRef.current?.toggleScreenShare();
    setIsScreenSharing((prev) => !prev);
  };

  const leaveRoom = () => {
    socket?.emit("leaveRoom", {
      platformId: "miskills",
      username,
      scheduleId,
      userId,
      role,
      occurrenceId,
    });
    window.history.back(); // navigate away
  };

  const endRoom = () => {
    if (role === "host") {
      socket?.emit("endRoom", {
        platformId: "miskills",
        username,
        scheduleId,
        userId,
        role,
        occurrenceId,
      });
    }
  };

  const kickUser = (targetUserId, targetUsername) => {
    if (role !== "host") return;
    socket?.emit("kickUser", {
      scheduleId,
      occurrenceId,
      platformId: "miskills",
      userId,
      targetUserId,
      targetUsername,
    });
  };

  const toggleChat = () => setIsChatVisible((v) => !v);
  const toggleParticipants = () => setIsParticipantsVisible((v) => !v);

  // ----- UI -----
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Main video area */}
      <div className="flex-1 relative">
        <div className="h-full bg-black border border-gray-800 rounded-none">
          <VideoComponent
            ref={videoRef}
            socket={socket}
            scheduleId={scheduleId}
            occurrenceId={occurrenceId}
            userId={userId}
            username={username}
            role={role}
          />
        </div>

        {/* Desktop Chat Drawer */}
        <div
          className={`hidden md:block fixed top-0 right-0 w-[24rem] h-full bg-white text-black shadow-lg transition-transform duration-300 z-40 ${
            isChatVisible
              ? "translate-x-0"
              : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between p-2 border-b">
            <div className="font-semibold">Chat</div>
            <button onClick={toggleChat} className="p-2 rounded-md bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <ChatComponent
            socket={socket}
            scheduleId={scheduleId}
            occurrenceId={occurrenceId}
            userId={userId}
            username={username}
            role={role}
          />
        </div>

        {/* Mobile Chat Sheet */}
        <div
          className={`md:hidden fixed inset-0 z-50 transition-transform duration-300 ${
            isChatVisible
              ? "translate-y-0 pointer-events-auto"
              : "translate-y-full pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 bg-black/50" onClick={toggleChat} />
          <div className="absolute bottom-0 left-0 right-0 bg-white text-black rounded-t-2xl shadow-lg max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="font-semibold">Chat</div>
              <button onClick={toggleChat} className="p-2 rounded-md bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ChatComponent
              socket={socket}
              scheduleId={scheduleId}
              occurrenceId={occurrenceId}
              userId={userId}
              username={username}
              role={role}
            />
          </div>
        </div>

        {/* Participants Drawer */}
        {isParticipantsVisible && (
          <div className="hidden md:block fixed top-8 left-8 w-72 max-h-[70vh] bg-white text-black rounded-xl shadow-lg overflow-auto z-40 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                Participants ({participants.length})
              </h3>
              <button onClick={toggleParticipants} className="p-1 rounded-md bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            {participants.length === 0 ? (
              <p className="text-sm text-gray-600">No participants yet</p>
            ) : (
              participants.map((p) => (
                <div key={p.userId} className="flex items-center justify-between">
                  <div className="truncate">{p.username}</div>
                  {role === "host" && p.userId !== userId && (
                    <button
                      onClick={() => kickUser(p.userId, p.username)}
                      className="text-sm px-2 py-1 rounded bg-red-500 text-white"
                    >
                      Kick
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div
        className="fixed z-50 bottom-0 md:bottom-6 left-1/2 -translate-x-1/2 w-full px-4 lg:w-auto"
        style={{ pointerEvents: "none" }}
      >
        <div className="max-w-3xl mx-auto" style={{ pointerEvents: "auto" }}>
          <div className="bg-black bg-opacity-80 rounded-t-xl md:rounded-3xl px-4 py-3 flex items-center justify-center md:justify-between gap-4">
            {/* Info */}
            <div className="hidden sm:flex flex-col min-w-[180px]">
              <span className="font-semibold text-sm">
                Meeting <span className="text-gray-300 font-normal">#{scheduleId}</span>
              </span>
              <span className="text-xs text-gray-400 truncate">
                {username} • {role}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <IconButton
                onClick={toggleChat}
                icon={MessageSquare}
                label="Chat"
                className="bg-gray-800 hover:bg-gray-700 text-white"
                active={isChatVisible}
              />
              <div className="relative">
                <IconButton
                  onClick={toggleParticipants}
                  icon={Users}
                  label="Participants"
                  className="bg-gray-800 hover:bg-gray-700 text-white"
                  active={isParticipantsVisible}
                />
                {participants.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-[11px] leading-none px-1.5 py-0.5 rounded-full bg-white text-black border border-gray-200 shadow-sm">
                    {participants.length}
                  </span>
                )}
              </div>
              <IconButton
                onClick={handleToggleMic}
                icon={isMicOn ? Mic : MicOff}
                label={isMicOn ? "Mute" : "Unmute"}
                className={`${
                  isMicOn ? "bg-gray-800 hover:bg-gray-700" : "bg-red-600 hover:bg-red-700"
                } text-white`}
              />
              <IconButton
                onClick={handleToggleCamera}
                icon={isCamOn ? Camera : CameraOff}
                label={isCamOn ? "Camera Off" : "Camera On"}
                className={`${
                  isCamOn ? "bg-gray-800 hover:bg-gray-700" : "bg-red-600 hover:bg-red-700"
                } text-white`}
              />
              <IconButton
                onClick={handleToggleScreenShare}
                icon={isScreenSharing ? X : Cast}
                label={isScreenSharing ? "Stop Sharing" : "Share Screen"}
                className={`${
                  isScreenSharing
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-800 hover:bg-gray-700"
                } text-white`}
              />
              {role === "host" && (
                <>
                  {/* <IconButton
                    onClick={() => videoRef.current?.startScreenRecording()}
                    icon={MonitorDot}
                    label="Record Screen"
                    className="bg-gray-800 hover:bg-gray-700 text-white"
                  />
                  <IconButton
                    onClick={() => videoRef.current?.startRoomRecording()}
                    icon={Video}
                    label="Record Room"
                    className="bg-gray-800 hover:bg-gray-700 text-white"
                  /> */}
                </>
              )}
              <IconButton
                onClick={leaveRoom}
                icon={LogOut}
                label="Leave"
                className="bg-red-600 hover:bg-red-700 text-white"
              />
              {role === "host" && (
                <IconButton
                  onClick={endRoom}
                  icon={Power}
                  label="End"
                  className="bg-red-800 hover:bg-red-900 text-white"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
