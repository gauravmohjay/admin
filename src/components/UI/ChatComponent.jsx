import React, { useEffect, useRef, useState } from "react";

const ChatComponent = ({
  socket,
  scheduleId,
  occurrenceId,
  userId,
  username,
  role,
  platformId = "miskills", // required by backend joinRoom
}) => {
  const [messages, setMessages] = useState([]);

  const [polls, setPolls] = useState([]);
  const [raisedHands, setRaisedHands] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [handRaised, setHandRaised] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [oldestTimestamp, setOldestTimestamp] = useState(null);
  const messagesEndRef = useRef(null);
  const handRaiseTimerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Reset local state when switching rooms/occurrences
  useEffect(() => {
    setMessages([]);
    setPolls([]);
    setRaisedHands([]);
    setHandRaised(false);
    setRoomClosed(false);
    setHasMoreMessages(false);
    setOldestTimestamp(null);
    if (handRaiseTimerRef.current) {
      clearTimeout(handRaiseTimerRef.current);
      handRaiseTimerRef.current = null;
    }
  }, [scheduleId, occurrenceId]);

  const startHandRaiseTimer = () => {
    if (handRaiseTimerRef.current) {
      clearTimeout(handRaiseTimerRef.current);
    }
    handRaiseTimerRef.current = setTimeout(() => {
      if (handRaised) {
        socket.emit("lowerHand", { scheduleId, occurrenceId });
      }
    }, 30000);
  };

  const clearHandRaiseTimer = () => {
    if (handRaiseTimerRef.current) {
      clearTimeout(handRaiseTimerRef.current);
      handRaiseTimerRef.current = null;
    }
  };
  const setPollStatus = (occurrenceId, scheduleId, pollId, isActive) => {
    if (roomClosed) return;
    socket.emit("changePollStatus", {
      scheduleId,
      occurrenceId,
      pollId,
      isActive,
    });
  };

  // Ensure poll belongs to current room scope
  const isThisRoomPoll = (p) =>
    p &&
    p.scheduleId === scheduleId &&
    (p.occurrenceId == null || p.occurrenceId === occurrenceId);

  // Upsert a poll by id
  const upsertPoll = (incoming) => {
    setPolls((prev) => {
      const exists = prev.find((p) => p.id === incoming.id);
      if (!exists) return [...prev, incoming];
      return prev.map((p) => (p.id === incoming.id ? incoming : p));
    });
  };

  useEffect(() => {
    if (!socket || !scheduleId || !occurrenceId || !userId || !platformId)
      return;

    // Register listeners only (no joinRoom emit here)
    const onNewChat = (msg) => {
      // Handle both old format (direct message) and new format (with createdAtISO)
      const formattedMsg = {
        ...msg,
        // Ensure we have timestamp for sorting/pagination
        timestamp:
          msg.timestamp ||
          (msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now()),
      };
      setMessages((prev) => [...prev, formattedMsg]);
    };

    // In ChatComponent.jsx, replace the onChatHistory function:
    const onChatHistory = (payload) => {
      console.log("Raw chatHistory payload:", payload);

      // Extract messages array from payload
      const messages = payload?.messages || [];

      // Normalize timestamps: server uses 'timeStamp', we need 'timestamp'
      const normalized = messages.map((msg) => ({
        ...msg,
        timestamp:
          msg.timeStamp ??
          msg.timestamp ??
          (msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now()),
      }));

      // Sort chronologically for display
      normalized.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

      console.log("Normalized messages:", normalized);

      setMessages(normalized);
      setHasMoreMessages(payload?.hasMore ?? false);
      setOldestTimestamp(payload?.oldestTimestamp ?? null);
    };

    const onPollEvent = (event) => {
      if (
        isThisRoomPoll(event) &&
        (event.type === "pollCreated" || event.type === "pollUpdate")
      ) {
        upsertPoll(event);
      }
    };

    const onVoteEvent = (event) => {
      if (isThisRoomPoll(event) && event.type === "pollUpdate") {
        upsertPoll(event);
      }
    };

    const onPollHistory = (history) => {
      const filtered = Array.isArray(history)
        ? history.filter(isThisRoomPoll)
        : [];
      const byId = new Map();
      for (const p of filtered) byId.set(p.id, p);
      const deduped = Array.from(byId.values()).sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );
      setPolls(deduped);
    };
const updatePollStatusLocal = (payload) => {
  const { pollId, isActive } = payload;
  console.log("pollStatusUpdate received:", pollId, isActive);

  setPolls((prev) =>
    prev.map((p) =>
      p.id === pollId ? { ...p, isActive } : p
    )
  );
};


    const onHandEvent = (event) => {
      // Updated to handle new event structure with scheduleId and occurrenceId
      if (event.type === "handRaised") {
        // Verify this event is for the current room
        if (
          event.scheduleId === scheduleId &&
          event.occurrenceId === occurrenceId
        ) {
          setRaisedHands((prev) => [
            ...prev.filter((h) => h.userId !== event.userId),
            {
              userId: event.userId,
              username: event.username,
              scheduleId: event.scheduleId,
              occurrenceId: event.occurrenceId,
            },
          ]);
        }
      } else if (event.type === "handLowered") {
        // Verify this event is for the current room
        if (
          event.scheduleId === scheduleId &&
          event.occurrenceId === occurrenceId
        ) {
          setRaisedHands((prev) =>
            prev.filter((h) => h.userId !== event.userId)
          );
          if (event.userId === userId) {
            setHandRaised(false);
            clearHandRaiseTimer();
          }
        }
      }
    };

    const onHandRaiseList = (list) =>
      setRaisedHands(Array.isArray(list) ? list : []);
    const onError = (error) =>
      alert(`Error: ${error?.message || "Unknown error"}`);

    const onMessageAck = (ack) => {
      console.log("Message delivered:", ack);
      // Handle new ack structure with tempId, status
      if (ack.status === "delivered") {
        // Message successfully delivered
      }
    };

    const onCreatePollAck = (ack) => {
      console.log("Poll created:", ack);
      // Handle new ack structure with pollId, status
      if (ack.status === "created") {
        setPollQuestion("");
        setPollOptions(["", ""]);
      }
    };

    const onVoteAck = (ack) => {
      console.log("Vote recorded:", ack);
      // Handle new ack structure with pollId, optionIndex, status, votes
    };

    const onHandRaiseAck = (ack) => {
      console.log("Hand raised:", ack);
      if (ack.status === "raised") {
        setHandRaised(true);
        startHandRaiseTimer();
      }
    };

    const onHandLowerAck = (ack) => {
      console.log("Hand lowered:", ack);
      if (ack.status === "lowered") {
        setHandRaised(false);
        clearHandRaiseTimer();
      }
    };

    const onJoinDenied = (payload) => {
      alert(`Join denied: ${payload?.reason || payload?.code || "Unknown"}`);
    };

    const onRoomClosed = () => {
      setRoomClosed(true);
      alert("Room closed by host");
    };

    socket.on("newChat", onNewChat);
    socket.on("chatHistory", onChatHistory);
    socket.on("pollEvent", onPollEvent);
    socket.on("voteEvent", onVoteEvent);
    socket.on("pollHistory", onPollHistory);
    socket.on("pollStatusUpdate", updatePollStatusLocal);
    socket.on("handEvent", onHandEvent);
    socket.on("handRaiseList", onHandRaiseList);
    socket.on("error", onError);
    socket.on("messageAck", onMessageAck);
    socket.on("createPollAck", onCreatePollAck);
    socket.on("voteAck", onVoteAck);
    socket.on("handRaiseAck", onHandRaiseAck);
    socket.on("handLowerAck", onHandLowerAck);
    socket.on("joinDenied", onJoinDenied);
    socket.on("roomClosed", onRoomClosed);

    return () => {
      clearHandRaiseTimer();
      // No leaveRoom here—App.js handles that
      socket.off("newChat", onNewChat);
      socket.off("chatHistory", onChatHistory);
      socket.off("pollEvent", onPollEvent);
      socket.off("voteEvent", onVoteEvent);
      socket.off("pollHistory", onPollHistory);
      socket.off("pollStatusUpdate", updatePollStatusLocal);
      socket.off("handEvent", onHandEvent);
      socket.off("handRaiseList", onHandRaiseList);
      socket.off("error", onError);
      socket.off("messageAck", onMessageAck);
      socket.off("createPollAck", onCreatePollAck);
      socket.off("voteAck", onVoteAck);
      socket.off("handRaiseAck", onHandRaiseAck);
      socket.off("handLowerAck", onHandLowerAck);
      socket.off("joinDenied", onJoinDenied);
      socket.off("roomClosed", onRoomClosed);
    };
  }, [socket, userId, username, role, platformId, scheduleId, occurrenceId]);

  const sendMessage = () => {
    if (!messageText.trim() || roomClosed) return;
    socket.emit("chatMessage", { scheduleId, occurrenceId, text: messageText });
    setMessageText("");
  };

  const createPoll = () => {
    if (roomClosed) return;
    const cleaned = pollOptions.filter((opt) => opt.trim());
    if (!pollQuestion.trim() || cleaned.length < 2) {
      alert("Please enter a question and at least 2 options");
      return;
    }
    socket.emit("createPoll", {
      scheduleId,
      occurrenceId,
      question: pollQuestion,
      options: cleaned,
    });
  };

  const votePoll = (pollId, optionIndex) => {
    if (roomClosed) return;
    socket.emit("votePoll", { pollId, optionIndex });
  };

  const raiseHand = () => {
    if (roomClosed) return;
    socket.emit("raiseHand", { scheduleId, occurrenceId });
  };
  // Host toggle
  const togglePollStatus = (poll) => {
    if (roomClosed) return;
    const newStatus = !poll.isActive;
    socket.emit("changePollStatus", {
      scheduleId: poll.scheduleId,
      occurrenceId: poll.occurrenceId,
      pollId: poll.id,
      isActive: newStatus,
    });

    // Optimistic UI update (optional)
    setPolls((prev) =>
      prev.map((p) => (p.id === poll.id ? { ...p, isActive: newStatus } : p))
    );
  };

  const lowerHand = () => {
    if (roomClosed) return;
    socket.emit("lowerHand", { scheduleId, occurrenceId });
  };

  const addPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  // Helper function to format message timestamp
  // Also update formatMessageTime to handle server timeStamp:
  const formatMessageTime = (msg) => {
    try {
      const time =
        msg.timestamp ??
        msg.timeStamp ?? // server field
        (msg.createdAt ? new Date(msg.createdAt).getTime() : null);

      if (!time) return "";
      const date = new Date(time);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  return (
    <div
      style={{
        height: "600px",
        border: "1px solid #ccc",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
       
        opacity: roomClosed ? 0.6 : 1,
      }}
    >
      {/* <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
        Chat & Interactions {roomClosed ? "(Room Closed)" : ""}
      </h3> */}

      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          border: "1px solid #eee",
          borderRadius: "6px",
          padding: "8px",
          marginBottom: "8px",
          overflow: "auto",
          backgroundColor: "#fafafa",
        }}
      >
        <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}>
          Messages
          {hasMoreMessages && (
            <span
              style={{ fontSize: "12px", marginLeft: "8px", color: "#999" }}
            >
              (More messages available)
            </span>
          )}
        </h4>

        {messages?.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: "6px",
              fontSize: "13px",
              padding: "4px 6px",
              backgroundColor: "white",
              borderRadius: "4px",
              border: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <strong style={{ color: "#333" }}>{msg.senderName}:</strong>
                <span style={{ marginLeft: "6px" }}>{msg.text}</span>
              </div>
              <span
                style={{ fontSize: "11px", color: "#999", marginLeft: "8px" }}
              >
                {formatMessageTime(msg)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          gap: "6px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "20px",
            fontSize: "14px",
            outline: "none",
            backgroundColor: "white",
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={roomClosed}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "18px",
            fontSize: "13px",
            cursor: roomClosed ? "not-allowed" : "pointer",
            fontWeight: "500",
          }}
          disabled={roomClosed}
        >
          Send
        </button>
      </div>

      {/* Hand Raise */}
      <div style={{ marginBottom: "10px", fontSize: "14px" }}>
        <button
          onClick={handRaised ? lowerHand : raiseHand}
          style={{
            padding: "6px 12px",
            backgroundColor: handRaised ? "#dc3545" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "12px",
            cursor: roomClosed ? "not-allowed" : "pointer",
            marginRight: "8px",
          }}
          disabled={roomClosed}
        >
          {handRaised ? "Lower Hand" : "Raise Hand"}
        </button>
        {handRaised && (
          <span style={{ fontSize: "11px", color: "#666" }}>
            (Auto-lowers in 30s)
          </span>
        )}
        {raisedHands.length > 0 && (
          <span style={{ fontSize: "12px", color: "#666", marginLeft: "8px" }}>
            Raised: {raisedHands.map((h) => h.username).join(", ")}
          </span>
        )}
      </div>

      {/* Poll Creation (Host Only) */}
      {role === "host" && (
        <div
          style={{
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Create Poll</h4>
          <input
            type="text"
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            placeholder="Poll question..."
            style={{
              width: "100%",
              marginBottom: "6px",
              padding: "6px 8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px",
            }}
            disabled={roomClosed}
          />
          {pollOptions.map((option, index) => (
            <div
              key={index}
              style={{ marginBottom: "4px", display: "flex", gap: "4px" }}
            >
              <input
                type="text"
                value={option}
                onChange={(e) => updatePollOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                style={{
                  flex: 1,
                  padding: "4px 6px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
                disabled={roomClosed}
              />
              {pollOptions.length > 2 && (
                <button
                  onClick={() => removePollOption(index)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "11px",
                    cursor: roomClosed ? "not-allowed" : "pointer",
                  }}
                  disabled={roomClosed}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
            <button
              onClick={addPollOption}
              style={{
                padding: "4px 8px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: roomClosed ? "not-allowed" : "pointer",
              }}
              disabled={roomClosed || pollOptions.length >= 10}
            >
              Add Option
            </button>
            <button
              onClick={createPoll}
              style={{
                padding: "4px 12px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: roomClosed ? "not-allowed" : "pointer",
              }}
              disabled={roomClosed}
            >
              Create Poll
            </button>
          </div>
        </div>
      )}

      {/* Active Polls */}
      {/* Active Polls */}
      <div style={{ overflow: "auto", flex: "0 0 auto", maxHeight: "120px" }}>
        <h4 style={{ margin: "0 0 6px 0", fontSize: "14px" }}>Polls</h4>
        {polls.map((poll) => (
          <div
            key={poll.id}
            style={{
              border: "1px solid #eee",
              borderRadius: "4px",
              padding: "6px",
              marginBottom: "6px",
              fontSize: "12px",
              backgroundColor: "white",
              opacity: poll.isActive ? 1 : 0.6, // dim closed polls
              transition: "opacity 0.3s",
            }}
          >
            <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>
              {poll.question}
            </p>

            {/* Poll status label */}
            <p
              style={{
                color: poll.isActive ? "#28a745" : "#dc3545",
                fontSize: "11px",
                margin: "0 0 4px 0",
                fontWeight: "500",
              }}
            >
              Status: {poll.isActive ? "Active" : "Closed"}
            </p>

            {poll.options.map((option, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "2px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <button
                  onClick={() => votePoll(poll.id, index)}
                  style={{
                    padding: "2px 6px",
                    fontSize: "10px",
                    backgroundColor: poll.isActive ? "#007bff" : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    cursor:
                      poll.isActive && !roomClosed ? "pointer" : "not-allowed",
                    transition: "background-color 0.3s",
                  }}
                  disabled={!poll.isActive || roomClosed}
                >
                  Vote
                </button>
                <span>
                  {option.text} ({option.votes} votes)
                </span>
              </div>
            ))}

            {/* Host only toggle button */}
            {role === "host" && (
              <button
                onClick={() => togglePollStatus(poll)}
                style={{
                  marginTop: "6px",
                  padding: "4px 8px",
                  backgroundColor: poll.isActive ? "#dc3545" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: roomClosed ? "not-allowed" : "pointer",
                  transition: "background-color 0.3s",
                }}
                disabled={roomClosed}
              >
                {poll.isActive ? "Close Poll" : "Activate Poll"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatComponent;
