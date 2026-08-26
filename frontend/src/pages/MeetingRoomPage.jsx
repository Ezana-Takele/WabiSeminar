import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import '../App.css'

function MeetingRoomPage() {
  const { meetingId } = useParams()
  const navigate = useNavigate()

  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [handRaised, setHandRaised] = useState(false)

  const [reaction, setReaction] = useState('')
  const [showReactionMenu, setShowReactionMenu] = useState(false)

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])

  const [meeting, setMeeting] = useState(null)

  /* ========================================
     MEETING TOOLS
  ======================================== */

  const [activeTool, setActiveTool] = useState(null)

  /* NOTES */

  const [meetingNote, setMeetingNote] = useState('')

  /* POLLS */

  const [polls, setPolls] = useState([])
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptionOne, setPollOptionOne] = useState('')
  const [pollOptionTwo, setPollOptionTwo] = useState('')

  /* FILES */

  const [meetingFiles, setMeetingFiles] = useState([])

  /* AGENDA */

  const [agendaItems, setAgendaItems] = useState([])
  const [agendaText, setAgendaText] = useState('')


  /* ========================================
     LOAD MEETING
  ======================================== */

  useEffect(() => {
    const meetings =
      JSON.parse(
        localStorage.getItem('wabiMeetings')
      ) || []

    const foundMeeting =
      meetings.find(
        (item) =>
          String(item.id) ===
          String(meetingId)
      )

    setMeeting(foundMeeting || null)
  }, [meetingId])


  /* ========================================
     LOAD MEETING DATA
  ======================================== */

  useEffect(() => {
    if (!meeting) {
      return
    }

    /* ========================================
       CHAT
    ======================================== */

    const savedChats =
      JSON.parse(
        localStorage.getItem('wabiChats')
      ) || []

    const existingChat =
      savedChats.find(
        (chat) =>
          String(chat.meetingId) ===
          String(meeting.id)
      )

    if (existingChat) {
      setMessages(
        existingChat.messages || []
      )
    } else {
      setMessages(
        meeting.messages || []
      )
    }


    /* ========================================
       NOTES
    ======================================== */

    const savedNotes =
      JSON.parse(
        localStorage.getItem('wabiMeetingNotes')
      ) || {}

    /*
      Load the note belonging to THIS meeting.
      If there is no saved note, use the note
      stored directly on the meeting if available.
    */

    const savedNote =
      savedNotes[meeting.id]

    if (
      savedNote !== undefined &&
      savedNote !== null
    ) {
      setMeetingNote(savedNote)
    } else {
      setMeetingNote(
        meeting.meetingNote ||
        meeting.note ||
        ''
      )
    }


    /* ========================================
       POLLS
    ======================================== */

    const savedPolls =
      JSON.parse(
        localStorage.getItem('wabiMeetingPolls')
      ) || {}

    setPolls(
      savedPolls[meeting.id] || []
    )


    /* ========================================
       FILES
    ======================================== */

    const savedFiles =
      JSON.parse(
        localStorage.getItem('wabiMeetingFiles')
      ) || {}

    setMeetingFiles(
      savedFiles[meeting.id] || []
    )


    /* ========================================
       AGENDA
    ======================================== */

    const savedAgenda =
      JSON.parse(
        localStorage.getItem('wabiMeetingAgenda')
      ) || {}

    setAgendaItems(
      savedAgenda[meeting.id] || []
    )

  }, [meeting])


  /* ========================================
     AUTO-SAVE MEETING NOTE
  ======================================== */

  useEffect(() => {
    if (!meeting) {
      return
    }

    /*
      Save notes automatically whenever the
      note changes.

      This fixes the problem where the note
      disappears after leaving and re-entering
      the meeting.
    */

    const savedNotes =
      JSON.parse(
        localStorage.getItem('wabiMeetingNotes')
      ) || {}

    savedNotes[meeting.id] =
      meetingNote

    localStorage.setItem(
      'wabiMeetingNotes',
      JSON.stringify(savedNotes)
    )

  }, [meeting, meetingNote])


  /* ========================================
     SAVE MEETING CHAT
  ======================================== */

  const saveMeetingChat = (finalMessages) => {
    if (!meeting) {
      return
    }

    const savedChats =
      JSON.parse(
        localStorage.getItem('wabiChats')
      ) || []

    const lastMessage =
      finalMessages.length > 0
        ? finalMessages[
            finalMessages.length - 1
          ]
        : null

    const chatData = {
      id: meeting.id,

      meetingId: meeting.id,

      name:
        meeting.title ||
        'Meeting Conversation',

      initials:
        meeting.initials ||
        'WS',

      status: 'Saved',

      meetingDate:
        meeting.date || '',

      meetingTime:
        meeting.time || '',

      lastMessage:
        lastMessage
          ? lastMessage.text
          : 'No messages',

      lastTime:
        lastMessage
          ? lastMessage.time
          : '',

      messages: finalMessages,

      savedAt:
        new Date().toISOString(),
    }

    const existingIndex =
      savedChats.findIndex(
        (chat) =>
          String(chat.meetingId) ===
          String(meeting.id)
      )

    let updatedChats

    if (existingIndex !== -1) {
      updatedChats =
        savedChats.map(
          (chat, index) =>
            index === existingIndex
              ? chatData
              : chat
        )
    } else {
      updatedChats = [
        ...savedChats,
        chatData,
      ]
    }

    localStorage.setItem(
      'wabiChats',
      JSON.stringify(updatedChats)
    )
  }


  /* ========================================
     LEAVE MEETING
  ======================================== */

  const handleLeaveMeeting = () => {
    if (!meeting) {
      navigate('/meetings')
      return
    }

    /*
      Make sure the latest note is saved before
      leaving the meeting.
    */

    const savedNotes =
      JSON.parse(
        localStorage.getItem('wabiMeetingNotes')
      ) || {}

    savedNotes[meeting.id] =
      meetingNote

    localStorage.setItem(
      'wabiMeetingNotes',
      JSON.stringify(savedNotes)
    )

    saveMeetingChat(messages)

    const meetings =
      JSON.parse(
        localStorage.getItem('wabiMeetings')
      ) || []

    const updatedMeetings =
      meetings.map((item) => {
        if (
          String(item.id) ===
          String(meetingId)
        ) {
          return {
            ...item,

            completed: true,

            joined: true,

            completedAt:
              new Date().toISOString(),

            messages,

            meetingNote:
              meetingNote,
          }
        }

        return item
      })

    localStorage.setItem(
      'wabiMeetings',
      JSON.stringify(updatedMeetings)
    )

    navigate('/meetings')
  }


  /* ========================================
     SEND MESSAGE
  ======================================== */

  const handleSendMessage = (e) => {
    e.preventDefault()

    const cleanMessage =
      message.trim()

    if (!cleanMessage || !meeting) {
      return
    }

    const newMessage = {
      id: Date.now(),

      text: cleanMessage,

      sender: 'You',

      initials: 'TZ',

      time:
        new Date().toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
          }
        ),
    }

    const updatedMessages = [
      ...messages,
      newMessage,
    ]

    setMessages(updatedMessages)

    saveMeetingChat(updatedMessages)

    const meetings =
      JSON.parse(
        localStorage.getItem('wabiMeetings')
      ) || []

    const updatedMeetings =
      meetings.map((item) => {
        if (
          String(item.id) ===
          String(meeting.id)
        ) {
          return {
            ...item,
            messages: updatedMessages,
          }
        }

        return item
      })

    localStorage.setItem(
      'wabiMeetings',
      JSON.stringify(updatedMeetings)
    )

    setMessage('')
  }


  /* ========================================
     REACTION
  ======================================== */

  const handleReaction = (emoji) => {
    setShowReactionMenu(false)

    setReaction(emoji)

    setTimeout(() => {
      setReaction('')
    }, 1800)
  }


  /* ========================================
     OPEN TOOL
  ======================================== */

  const openTool = (tool) => {
    setActiveTool(tool)
    setShowReactionMenu(false)
  }


  /* ========================================
     CLOSE TOOL
  ======================================== */

  const closeTool = () => {
    setActiveTool(null)
  }


  /* ========================================
     SAVE MEETING NOTE
  ======================================== */

  const saveMeetingNote = () => {
    if (!meeting) {
      return
    }

    const savedNotes =
      JSON.parse(
        localStorage.getItem('wabiMeetingNotes')
      ) || {}

    savedNotes[meeting.id] =
      meetingNote

    localStorage.setItem(
      'wabiMeetingNotes',
      JSON.stringify(savedNotes)
    )
  }


  /* ========================================
     CREATE POLL
  ======================================== */

  const createPoll = (e) => {
    e.preventDefault()

    const question =
      pollQuestion.trim()

    const optionOne =
      pollOptionOne.trim()

    const optionTwo =
      pollOptionTwo.trim()

    if (
      !question ||
      !optionOne ||
      !optionTwo ||
      !meeting
    ) {
      return
    }

    const newPoll = {
      id: Date.now(),

      question,

      options: [
        {
          id: 1,
          text: optionOne,
          votes: 0,
        },
        {
          id: 2,
          text: optionTwo,
          votes: 0,
        },
      ],

      createdAt:
        new Date().toISOString(),

      voted: false,
    }

    const updatedPolls = [
      newPoll,
      ...polls,
    ]

    setPolls(updatedPolls)

    const savedPolls =
      JSON.parse(
        localStorage.getItem('wabiMeetingPolls')
      ) || {}

    savedPolls[meeting.id] =
      updatedPolls

    localStorage.setItem(
      'wabiMeetingPolls',
      JSON.stringify(savedPolls)
    )

    setPollQuestion('')
    setPollOptionOne('')
    setPollOptionTwo('')
  }


  /* ========================================
     VOTE ON POLL
  ======================================== */

  const votePoll = (pollId, optionId) => {
    if (!meeting) {
      return
    }

    const updatedPolls =
      polls.map((poll) => {
        if (
          poll.id !== pollId ||
          poll.voted
        ) {
          return poll
        }

        return {
          ...poll,

          voted: true,

          options:
            poll.options.map(
              (option) =>
                option.id === optionId
                  ? {
                      ...option,
                      votes:
                        option.votes + 1,
                    }
                  : option
            ),
        }
      })

    setPolls(updatedPolls)

    const savedPolls =
      JSON.parse(
        localStorage.getItem('wabiMeetingPolls')
      ) || {}

    savedPolls[meeting.id] =
      updatedPolls

    localStorage.setItem(
      'wabiMeetingPolls',
      JSON.stringify(savedPolls)
    )
  }


  /* ========================================
     ADD AGENDA ITEM
  ======================================== */

  const addAgendaItem = (e) => {
    e.preventDefault()

    const cleanText =
      agendaText.trim()

    if (!cleanText || !meeting) {
      return
    }

    const newItem = {
      id: Date.now(),

      text: cleanText,

      completed: false,
    }

    const updatedAgenda = [
      ...agendaItems,
      newItem,
    ]

    setAgendaItems(updatedAgenda)

    const savedAgenda =
      JSON.parse(
        localStorage.getItem('wabiMeetingAgenda')
      ) || {}

    savedAgenda[meeting.id] =
      updatedAgenda

    localStorage.setItem(
      'wabiMeetingAgenda',
      JSON.stringify(savedAgenda)
    )

    setAgendaText('')
  }


  /* ========================================
     TOGGLE AGENDA ITEM
  ======================================== */

  const toggleAgendaItem = (itemId) => {
    if (!meeting) {
      return
    }

    const updatedAgenda =
      agendaItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed:
                !item.completed,
            }
          : item
      )

    setAgendaItems(updatedAgenda)

    const savedAgenda =
      JSON.parse(
        localStorage.getItem('wabiMeetingAgenda')
      ) || {}

    savedAgenda[meeting.id] =
      updatedAgenda

    localStorage.setItem(
      'wabiMeetingAgenda',
      JSON.stringify(savedAgenda)
    )
  }


  /* ========================================
     REMOVE AGENDA ITEM
  ======================================== */

  const removeAgendaItem = (itemId) => {
    if (!meeting) {
      return
    }

    const updatedAgenda =
      agendaItems.filter(
        (item) =>
          item.id !== itemId
      )

    setAgendaItems(updatedAgenda)

    const savedAgenda =
      JSON.parse(
        localStorage.getItem('wabiMeetingAgenda')
      ) || {}

    savedAgenda[meeting.id] =
      updatedAgenda

    localStorage.setItem(
      'wabiMeetingAgenda',
      JSON.stringify(savedAgenda)
    )
  }


  /* ========================================
     ADD FILE
  ======================================== */

  const handleFileSelect = (e) => {
    const selectedFiles =
      Array.from(
        e.target.files || []
      )

    if (
      selectedFiles.length === 0 ||
      !meeting
    ) {
      return
    }

    const newFiles =
      selectedFiles.map((file) => ({
        id: Date.now() + Math.random(),

        name: file.name,

        size: file.size,

        type:
          file.type ||
          'Unknown file',

        addedAt:
          new Date().toISOString(),
      }))

    const updatedFiles = [
      ...meetingFiles,
      ...newFiles,
    ]

    setMeetingFiles(updatedFiles)

    const savedFiles =
      JSON.parse(
        localStorage.getItem('wabiMeetingFiles')
      ) || {}

    savedFiles[meeting.id] =
      updatedFiles

    localStorage.setItem(
      'wabiMeetingFiles',
      JSON.stringify(savedFiles)
    )

    e.target.value = ''
  }


  /* ========================================
     REMOVE FILE
  ======================================== */

  const removeFile = (fileId) => {
    if (!meeting) {
      return
    }

    const updatedFiles =
      meetingFiles.filter(
        (file) =>
          file.id !== fileId
      )

    setMeetingFiles(updatedFiles)

    const savedFiles =
      JSON.parse(
        localStorage.getItem('wabiMeetingFiles')
      ) || {}

    savedFiles[meeting.id] =
      updatedFiles

    localStorage.setItem(
      'wabiMeetingFiles',
      JSON.stringify(savedFiles)
    )
  }


  /* ========================================
     FORMAT FILE SIZE
  ======================================== */

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return '0 KB'
    }

    if (bytes < 1024) {
      return `${bytes} B`
    }

    if (bytes < 1024 * 1024) {
      return `${Math.round(
        bytes / 1024
      )} KB`
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`
  }


  /* ========================================
     FORMAT DATE
  ======================================== */

  const formatDate = (date) => {
    if (!date) {
      return ''
    }

    return new Date(
      date
    ).toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    )
  }


  /* ========================================
     MEETING NOT FOUND
  ======================================== */

  if (!meeting) {
    return (
      <div className="meeting-room-page">

        <header className="meeting-room-header">

          <div className="meeting-room-brand">
            <h2>WabiSeminar</h2>
          </div>

          <div className="meeting-room-title">

            <strong>
              Meeting
            </strong>

            <span>
              Meeting room
            </span>

          </div>

          <NavLink
            to="/meetings"
            className="meeting-room-exit"
          >
            Leave
          </NavLink>

        </header>

        <main className="meeting-not-found">

          <div className="meeting-not-found-card">

            <div className="not-found-icon">
              !
            </div>

            <h2>
              Meeting not found
            </h2>

            <p>
              This meeting may have been
              deleted or the meeting link
              is invalid.
            </p>

            <NavLink
              to="/meetings"
              className="back-meetings-button"
            >
              Back to Meetings
            </NavLink>

          </div>

        </main>

      </div>
    )
  }


  return (
    <div className="meeting-room-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="meeting-room-header">

        <div className="meeting-room-brand">
          <h2>WabiSeminar</h2>
        </div>

        <div className="meeting-room-title">

          <strong>
            {meeting.title}
          </strong>

          <span>
            Meeting ID: {meeting.id}
          </span>

        </div>

        <button
          type="button"
          className="meeting-room-exit"
          onClick={handleLeaveMeeting}
        >
          Leave
        </button>

      </header>


      {/* ========================================
          MAIN LAYOUT
      ======================================== */}

      <main className="meeting-room-layout">


        {/* ========================================
            LEFT SIDEBAR
        ======================================== */}

        <aside className="meeting-sidebar">

          <div className="meeting-sidebar-header">

            <div>

              <span className="meeting-label">
                MEETING
              </span>

              <h3>
                {meeting.title}
              </h3>

            </div>

            <span className="live-indicator">
              LIVE
            </span>

          </div>


          <div className="meeting-details-list">

            <div className="meeting-detail-card">

              <div className="detail-icon">
                📅
              </div>

              <div className="detail-content">

                <span>
                  Date
                </span>

                <strong>
                  {meeting.date}
                </strong>

              </div>

            </div>


            <div className="meeting-detail-card">

              <div className="detail-icon">
                🕐
              </div>

              <div className="detail-content">

                <span>
                  Time
                </span>

                <strong>
                  {meeting.time}
                </strong>

              </div>

            </div>


            <div className="meeting-detail-card">

              <div className="detail-icon">
                ⏱
              </div>

              <div className="detail-content">

                <span>
                  Duration
                </span>

                <strong>
                  {meeting.duration} minutes
                </strong>

              </div>

            </div>


            <div className="meeting-detail-card">

              <div className="detail-icon">
                👥
              </div>

              <div className="detail-content">

                <span>
                  Participants
                </span>

                <strong>
                  1 participant
                </strong>

              </div>

            </div>

          </div>


          {/* DESCRIPTION */}

          {meeting.description && (

            <div className="meeting-description-box">

              <span>
                Description
              </span>

              <p>
                {meeting.description}
              </p>

            </div>

          )}


          {/* ========================================
              MEETING TOOLS
          ======================================== */}

          <div className="meeting-tools">

            <div className="meeting-tools-title">
              Meeting tools
            </div>

            <div className="meeting-tools-list">

              <button
                type="button"
                className={`meeting-tool-button ${
                  activeTool === 'notes'
                    ? 'tool-active'
                    : ''
                }`}
                onClick={() =>
                  openTool('notes')
                }
              >
                <span>
                  📝
                </span>

                <span>
                  Notes
                </span>
              </button>


              <button
                type="button"
                className={`meeting-tool-button ${
                  activeTool === 'polls'
                    ? 'tool-active'
                    : ''
                }`}
                onClick={() =>
                  openTool('polls')
                }
              >
                <span>
                  📊
                </span>

                <span>
                  Polls
                </span>
              </button>


              <button
                type="button"
                className={`meeting-tool-button ${
                  activeTool === 'files'
                    ? 'tool-active'
                    : ''
                }`}
                onClick={() =>
                  openTool('files')
                }
              >
                <span>
                  📁
                </span>

                <span>
                  Files
                </span>
              </button>


              <button
                type="button"
                className={`meeting-tool-button ${
                  activeTool === 'agenda'
                    ? 'tool-active'
                    : ''
                }`}
                onClick={() =>
                  openTool('agenda')
                }
              >
                <span>
                  📋
                </span>

                <span>
                  Agenda
                </span>
              </button>

            </div>

          </div>

        </aside>


        {/* ========================================
            CENTER
        ======================================== */}

        <section className="meeting-center">


          {/* VIDEO */}

          <div className="meeting-video-area">

            <div className="main-video">

              {cameraOn ? (

                <div className="camera-placeholder">

                  <div className="camera-avatar">
                    TZ
                  </div>

                  <span>
                    Your camera preview
                  </span>

                </div>

              ) : (

                <div className="camera-off">

                  <div className="camera-off-icon">
                    📹
                  </div>

                  <span>
                    Camera is off
                  </span>

                </div>

              )}

              <div className="video-name">
                You
              </div>

              <div className="video-mic">
                {micOn
                  ? '🎤'
                  : '🔇'}
              </div>

            </div>


            <div className="participant-video-card">

              <div className="participant-avatar">
                W
              </div>

              <span>
                Waiting for
                <br />
                participants...
              </span>

            </div>


            {reaction && (

              <div className="floating-reaction">
                {reaction}
              </div>

            )}

          </div>


          {/* ========================================
              CONTROLS
          ======================================== */}

          <div className="meeting-center-controls">


            <button
              type="button"
              className={`meeting-control ${
                !micOn
                  ? 'control-off'
                  : ''
              }`}
              onClick={() =>
                setMicOn(!micOn)
              }
              title={
                micOn
                  ? 'Mute microphone'
                  : 'Turn microphone on'
              }
            >

              <span>
                {micOn
                  ? '🎤'
                  : '🔇'}
              </span>

              <small>
                {micOn
                  ? 'Mute'
                  : 'Unmute'}
              </small>

            </button>


            <button
              type="button"
              className={`meeting-control ${
                !cameraOn
                  ? 'control-off'
                  : ''
              }`}
              onClick={() =>
                setCameraOn(!cameraOn)
              }
              title={
                cameraOn
                  ? 'Turn camera off'
                  : 'Turn camera on'
              }
            >

              <span>
                {cameraOn
                  ? '📹'
                  : '🚫'}
              </span>

              <small>
                {cameraOn
                  ? 'Camera'
                  : 'Camera Off'}
              </small>

            </button>


            <button
              type="button"
              className={`meeting-control ${
                sharing
                  ? 'control-active'
                  : ''
              }`}
              onClick={() =>
                setSharing(!sharing)
              }
              title="Share screen"
            >

              <span>
                🖥️
              </span>

              <small>
                {sharing
                  ? 'Sharing'
                  : 'Share'}
              </small>

            </button>


            <button
              type="button"
              className={`meeting-control ${
                handRaised
                  ? 'control-active'
                  : ''
              }`}
              onClick={() =>
                setHandRaised(
                  !handRaised
                )
              }
              title="Raise hand"
            >

              <span>
                ✋
              </span>

              <small>
                {handRaised
                  ? 'Lower Hand'
                  : 'Raise Hand'}
              </small>

            </button>


            <div className="reaction-control">

              {showReactionMenu && (

                <div className="reaction-menu">

                  <button
                    type="button"
                    onClick={() =>
                      handleReaction('👍')
                    }
                  >
                    👍
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleReaction('❤️')
                    }
                  >
                    ❤️
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleReaction('👏')
                    }
                  >
                    👏
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleReaction('😂')
                    }
                  >
                    😂
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleReaction('🎉')
                    }
                  >
                    🎉
                  </button>

                </div>

              )}


              <button
                type="button"
                className={`meeting-control ${
                  showReactionMenu
                    ? 'control-active'
                    : ''
                }`}
                onClick={() =>
                  setShowReactionMenu(
                    !showReactionMenu
                  )
                }
              >

                <span>
                  😊
                </span>

                <small>
                  React
                </small>

              </button>

            </div>

          </div>

        </section>


        {/* ========================================
            RIGHT PANEL
        ======================================== */}

        <aside className="meeting-right-panel">


          {/* PARTICIPANTS */}

          <section className="participants-panel">

            <div className="right-panel-header">

              <div>

                <h3>
                  Participants
                </h3>

                <span>
                  1 participant
                </span>

              </div>

              <span className="participant-count">
                1
              </span>

            </div>


            <div className="participants-list">

              <div className="participant-row">

                <div className="participant-small-avatar">
                  TZ
                </div>

                <div className="participant-info">

                  <strong>
                    You
                  </strong>

                  <span>
                    {micOn
                      ? '🎤 Microphone on'
                      : '🔇 Muted'}
                  </span>

                </div>

                <span className="participant-status">
                  ●
                </span>

              </div>


              <div className="participant-row">

                <div className="participant-small-avatar participant-w">
                  W
                </div>

                <div className="participant-info">

                  <strong>
                    Waiting
                  </strong>

                  <span>
                    Waiting for participant
                  </span>

                </div>

                <span className="participant-status waiting">
                  ○
                </span>

              </div>

            </div>

          </section>


          {/* ========================================
              CHAT
          ======================================== */}

          <section className="right-chat-panel">

            <div className="meeting-chat-header">

              <div className="meeting-chat-title">

                <div className="meeting-chat-icon">
                  💬
                </div>

                <div>

                  <h3>
                    Meeting Chat
                  </h3>

                  <span>
                    Messages in this meeting
                  </span>

                </div>

              </div>

              <span className="chat-online-dot">
                ●
              </span>

            </div>


            <div className="chat-messages">

              {messages.length === 0 ? (

                <div className="chat-empty-state">

                  <div className="chat-empty-icon">
                    💬
                  </div>

                  <h4>
                    No messages yet
                  </h4>

                  <p>
                    Start the conversation with
                    everyone in the meeting.
                  </p>

                </div>

              ) : (

                messages.map((item) => {

                  const isYou =
                    item.sender === 'You'

                  return (

                    <div
                      className={`chat-message-row ${
                        isYou
                          ? 'chat-message-you'
                          : 'chat-message-other'
                      }`}
                      key={item.id}
                    >

                      {!isYou && (

                        <div className="chat-message-avatar">

                          {selectedInitials(
                            item,
                            meeting
                          )}

                        </div>

                      )}


                      <div className="chat-message-wrapper">

                        <div className="chat-message-meta">

                          <strong>
                            {isYou
                              ? 'You'
                              : item.sender}
                          </strong>

                          {item.time && (

                            <span>
                              {item.time}
                            </span>

                          )}

                        </div>


                        <div className="chat-message-bubble">
                          {item.text}
                        </div>

                      </div>


                      {isYou && (

                        <div className="chat-message-avatar your-chat-avatar">
                          TZ
                        </div>

                      )}

                    </div>

                  )

                })

              )}

            </div>


            <form
              className="chat-message-form"
              onSubmit={handleSendMessage}
            >

              <input
                type="text"
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                placeholder="Write a message..."
                aria-label="Write a message"
              />

              <button
                type="submit"
                disabled={!message.trim()}
                aria-label="Send message"
              >
                <span>
                  ➤
                </span>
              </button>

            </form>


            <div className="chat-saved-note">
              Messages will be saved with this meeting
            </div>

          </section>

        </aside>

      </main>


      {/* ========================================
          TOOL OVERLAY
      ======================================== */}

      {activeTool && (

        <div
          className="meeting-tool-overlay"
          onClick={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              closeTool()
            }
          }}
        >

          <div className="meeting-tool-modal">


            {/* ========================================
                TOOL HEADER
            ======================================== */}

            <div className="meeting-tool-modal-header">

              <div className="meeting-tool-modal-title">

                <div className="meeting-tool-modal-icon">

                  {activeTool === 'notes' && '📝'}
                  {activeTool === 'polls' && '📊'}
                  {activeTool === 'files' && '📁'}
                  {activeTool === 'agenda' && '📋'}

                </div>

                <div>

                  <span>
                    MEETING TOOL
                  </span>

                  <h2>

                    {activeTool === 'notes' &&
                      'Meeting Notes'}

                    {activeTool === 'polls' &&
                      'Polls'}

                    {activeTool === 'files' &&
                      'Meeting Files'}

                    {activeTool === 'agenda' &&
                      'Meeting Agenda'}

                  </h2>

                </div>

              </div>


              <button
                type="button"
                className="meeting-tool-close"
                onClick={closeTool}
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {/* ========================================
                NOTES
            ======================================== */}

            {activeTool === 'notes' && (

              <div className="meeting-tool-content">

                <div className="tool-description">

                  <strong>
                    Keep notes for this meeting
                  </strong>

                  <span>
                    Your notes are saved automatically
                    as you type.
                  </span>

                </div>


                <textarea
                  className="meeting-notes-textarea"
                  value={meetingNote}
                  onChange={(e) =>
                    setMeetingNote(
                      e.target.value
                    )
                  }
                  placeholder="Write meeting notes, decisions, ideas, action items..."
                />


                <div className="meeting-tool-footer">

                  <span>
                    {meetingNote.length} characters
                  </span>

                  <button
                    type="button"
                    className="meeting-tool-primary"
                    onClick={saveMeetingNote}
                  >
                    Save Notes
                  </button>

                </div>

              </div>

            )}


            {/* ========================================
                POLLS
            ======================================== */}

            {activeTool === 'polls' && (

              <div className="meeting-tool-content">

                <form
                  className="poll-create-form"
                  onSubmit={createPoll}
                >

                  <div className="tool-description">

                    <strong>
                      Create a quick poll
                    </strong>

                    <span>
                      Ask the participants a question
                      and collect their choice.
                    </span>

                  </div>


                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) =>
                      setPollQuestion(
                        e.target.value
                      )
                    }
                    placeholder="Ask a question..."
                  />


                  <div className="poll-options-row">

                    <input
                      type="text"
                      value={pollOptionOne}
                      onChange={(e) =>
                        setPollOptionOne(
                          e.target.value
                        )
                      }
                      placeholder="Option 1"
                    />

                    <input
                      type="text"
                      value={pollOptionTwo}
                      onChange={(e) =>
                        setPollOptionTwo(
                          e.target.value
                        )
                      }
                      placeholder="Option 2"
                    />

                  </div>


                  <button
                    type="submit"
                    className="meeting-tool-primary"
                  >
                    Create Poll
                  </button>

                </form>


                <div className="poll-list">

                  {polls.length === 0 ? (

                    <div className="tool-empty-state">

                      <div>
                        📊
                      </div>

                      <strong>
                        No polls yet
                      </strong>

                      <span>
                        Create a poll above to get
                        feedback from participants.
                      </span>

                    </div>

                  ) : (

                    polls.map((poll) => {

                      const totalVotes =
                        poll.options.reduce(
                          (
                            total,
                            option
                          ) =>
                            total +
                            option.votes,
                          0
                        )

                      return (

                        <div
                          className="poll-card"
                          key={poll.id}
                        >

                          <div className="poll-card-question">
                            {poll.question}
                          </div>


                          <div className="poll-options">

                            {poll.options.map(
                              (option) => {

                                const percentage =
                                  totalVotes > 0
                                    ? Math.round(
                                        (
                                          option.votes /
                                          totalVotes
                                        ) *
                                        100
                                      )
                                    : 0

                                return (

                                  <button
                                    type="button"
                                    className={`poll-option ${
                                      poll.voted
                                        ? 'poll-voted'
                                        : ''
                                    }`}
                                    key={option.id}
                                    onClick={() =>
                                      votePoll(
                                        poll.id,
                                        option.id
                                      )
                                    }
                                    disabled={
                                      poll.voted
                                    }
                                  >

                                    <span>
                                      {option.text}
                                    </span>

                                    {poll.voted && (

                                      <span>
                                        {percentage}%
                                      </span>

                                    )}

                                  </button>

                                )

                              }
                            )}

                          </div>


                          <div className="poll-total">

                            {totalVotes}{' '}

                            {totalVotes === 1
                              ? 'vote'
                              : 'votes'}

                            {poll.voted &&
                              ' · You voted'}

                          </div>

                        </div>

                      )

                    })

                  )}

                </div>

              </div>

            )}


            {/* ========================================
                FILES
            ======================================== */}

            {activeTool === 'files' && (

              <div className="meeting-tool-content">

                <div className="tool-description">

                  <strong>
                    Share files with this meeting
                  </strong>

                  <span>
                    Select files from your computer
                    to keep a record of what was shared.
                  </span>

                </div>


                <label className="meeting-file-upload">

                  <input
                    type="file"
                    multiple
                    onChange={
                      handleFileSelect
                    }
                  />

                  <span className="file-upload-icon">
                    ＋
                  </span>

                  <strong>
                    Add files
                  </strong>

                  <small>
                    Click to select files
                  </small>

                </label>


                <div className="meeting-file-list">

                  {meetingFiles.length === 0 ? (

                    <div className="tool-empty-state">

                      <div>
                        📁
                      </div>

                      <strong>
                        No files shared
                      </strong>

                      <span>
                        Files you add to this meeting
                        will appear here.
                      </span>

                    </div>

                  ) : (

                    meetingFiles.map((file) => (

                      <div
                        className="meeting-file-item"
                        key={file.id}
                      >

                        <div className="meeting-file-icon">
                          📄
                        </div>

                        <div className="meeting-file-info">

                          <strong>
                            {file.name}
                          </strong>

                          <span>
                            {formatFileSize(
                              file.size
                            )}
                            {' · '}
                            {formatDate(
                              file.addedAt
                            )}
                          </span>

                        </div>


                        <button
                          type="button"
                          className="meeting-file-remove"
                          onClick={() =>
                            removeFile(
                              file.id
                            )
                          }
                          aria-label={`Remove ${file.name}`}
                        >
                          ×
                        </button>

                      </div>

                    ))

                  )}

                </div>

              </div>

            )}


            {/* ========================================
                AGENDA
            ======================================== */}

            {activeTool === 'agenda' && (

              <div className="meeting-tool-content">

                <form
                  className="agenda-create-form"
                  onSubmit={addAgendaItem}
                >

                  <div className="tool-description">

                    <strong>
                      Keep the meeting on track
                    </strong>

                    <span>
                      Add topics you want to discuss
                      during this meeting.
                    </span>

                  </div>


                  <div className="agenda-input-row">

                    <input
                      type="text"
                      value={agendaText}
                      onChange={(e) =>
                        setAgendaText(
                          e.target.value
                        )
                      }
                      placeholder="Add an agenda item..."
                    />

                    <button
                      type="submit"
                      className="meeting-tool-primary"
                    >
                      Add
                    </button>

                  </div>

                </form>


                <div className="agenda-list">

                  {agendaItems.length === 0 ? (

                    <div className="tool-empty-state">

                      <div>
                        📋
                      </div>

                      <strong>
                        No agenda items
                      </strong>

                      <span>
                        Add the topics you want to
                        discuss in this meeting.
                      </span>

                    </div>

                  ) : (

                    agendaItems.map(
                      (item, index) => (

                        <div
                          className={`agenda-item ${
                            item.completed
                              ? 'agenda-completed'
                              : ''
                          }`}
                          key={item.id}
                        >

                          <button
                            type="button"
                            className="agenda-check"
                            onClick={() =>
                              toggleAgendaItem(
                                item.id
                              )
                            }
                          >
                            {item.completed
                              ? '✓'
                              : ''}
                          </button>


                          <div className="agenda-item-number">
                            {index + 1}
                          </div>


                          <span className="agenda-item-text">
                            {item.text}
                          </span>


                          <button
                            type="button"
                            className="agenda-remove"
                            onClick={() =>
                              removeAgendaItem(
                                item.id
                              )
                            }
                            aria-label="Remove agenda item"
                          >
                            ×
                          </button>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  )
}


/* ========================================
   GET MESSAGE AVATAR
======================================== */

function selectedInitials(item, meeting) {

  if (item.initials) {
    return item.initials
  }

  if (meeting?.initials) {
    return meeting.initials
  }

  if (item.sender) {

    const words =
      item.sender
        .trim()
        .split(' ')
        .filter(Boolean)

    if (words.length >= 2) {

      return (
        words[0][0] +
        words[words.length - 1][0]
      ).toUpperCase()

    }

    return item.sender
      .slice(0, 2)
      .toUpperCase()
  }

  return 'WS'
}


export default MeetingRoomPage