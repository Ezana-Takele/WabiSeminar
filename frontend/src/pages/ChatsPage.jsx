import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import '../App.css'
import './ChatsPage.css'

function ChatsPage() {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)


  /*
   * ========================================
   * LOAD SAVED CHATS
   *
   * Only conversations connected to a real
   * meeting are allowed here.
   * ========================================
   */

  useEffect(() => {

    const savedChats =
      JSON.parse(
        localStorage.getItem('wabiChats')
      ) || []


    /*
     * Remove old/invalid chats that were
     * created by the previous chat system.
     *
     * A saved chat must have a meetingId.
     */

    const validChats =
      savedChats.filter(
        (chat) =>
          chat &&
          chat.meetingId !== undefined &&
          chat.meetingId !== null &&
          String(chat.meetingId).trim() !== ''
      )


    /*
     * Clean localStorage too, so invalid
     * conversations do not come back.
     */

    localStorage.setItem(
      'wabiChats',
      JSON.stringify(validChats)
    )


    setChats(validChats)


    /*
     * Select the newest saved conversation.
     */

    if (validChats.length > 0) {

      setSelectedChat(
        validChats[validChats.length - 1]
      )

    } else {

      setSelectedChat(null)

    }

  }, [])


  /*
   * ========================================
   * SELECT CHAT
   * ========================================
   */

  const handleSelectChat = (chat) => {
    setSelectedChat(chat)
  }


  /*
   * ========================================
   * FORMAT SAVED DATE
   * ========================================
   */

  const formatSavedDate = (date) => {

    if (!date) {
      return ''
    }


    const parsedDate =
      new Date(date)


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return date

    }


    return parsedDate.toLocaleDateString(
      [],
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    )

  }


  /*
   * ========================================
   * RENDER
   * ========================================
   */

  return (
    <DashboardLayout>


        {/* ======================================
            HEADER
        ====================================== */}

        <header className="topbar">

          <div>

            <h1>
              Saved Chats
            </h1>

            <p>
              View conversations from your
              previous meetings.
            </p>

          </div>

        </header>


        {/* ======================================
            SAVED CHATS CONTAINER
        ====================================== */}

        <section className="chats-container">


          {/* ====================================
              SAVED CHAT LIST
          ==================================== */}

          <aside className="chat-list-panel">

            <div className="chat-list-header">

              <div>

                <h2>
                  Meeting Conversations
                </h2>

                <span>
                  {chats.length}{' '}

                  {chats.length === 1
                    ? 'saved chat'
                    : 'saved chats'}
                </span>

              </div>

            </div>


            {/* ==================================
                EMPTY STATE
            ================================== */}

            {chats.length === 0 ? (

              <div className="chat-list-empty">

                <div className="chat-empty-icon">
                  💬
                </div>

                <h3>
                  No saved chats
                </h3>

                <p>
                  Your meeting conversations
                  will appear here after you
                  leave a meeting.
                </p>

                <NavLink
                  to="/meetings"
                  className="empty-action"
                >
                  View Meetings
                </NavLink>

              </div>

            ) : (


              /* ==================================
                 CHAT LIST
              ================================== */

              <div className="chat-list">

                {chats
                  .slice()
                  .reverse()
                  .map((chat) => (

                    <button
                      type="button"
                      key={chat.id}
                      className={`chat-list-item ${
                        selectedChat?.id ===
                        chat.id
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        handleSelectChat(chat)
                      }
                    >


                      {/* AVATAR */}

                      <div className="chat-avatar">

                        {chat.initials ||
                          'WS'}

                      </div>


                      {/* INFORMATION */}

                      <div className="chat-list-info">

                        <div className="chat-list-top">

                          <strong>
                            {chat.name ||
                              'Meeting Conversation'}
                          </strong>

                          <span>
                            {chat.lastTime ||
                              ''}
                          </span>

                        </div>


                        <p>
                          {chat.lastMessage ||
                            'No messages'}
                        </p>


                        <div className="saved-chat-meta">

                          <span>

                            {(
                              chat.messages ||
                              []
                            ).length}{' '}

                            {(
                              chat.messages ||
                              []
                            ).length === 1
                              ? 'message'
                              : 'messages'}

                          </span>


                          {chat.meetingDate && (

                            <span>
                              {chat.meetingDate}
                            </span>

                          )}

                        </div>

                      </div>

                    </button>

                  ))}

              </div>

            )}

          </aside>


          {/* ====================================
              ACTIVE SAVED CHAT
          ==================================== */}

          <section className="active-chat-panel">

            {!selectedChat ? (

              <div className="no-chat-selected">

                <div className="no-chat-icon">
                  💬
                </div>

                <h2>
                  No saved conversation
                </h2>

                <p>
                  Conversations from completed
                  meetings will appear here.
                </p>

              </div>

            ) : (

              <>


                {/* ==================================
                    CHAT HEADER
                ================================== */}

                <header className="active-chat-header">

                  <div className="active-chat-user">

                    <div className="chat-avatar">

                      {selectedChat.initials ||
                        'WS'}

                    </div>

                    <div>

                      <h2>
                        {selectedChat.name ||
                          'Meeting Conversation'}
                      </h2>

                      <span>
                        Saved conversation
                      </span>

                    </div>

                  </div>


                  {/* MEETING INFORMATION */}

                  <div className="saved-chat-header-info">

                    {selectedChat.meetingDate && (

                      <span>
                        📅{' '}
                        {selectedChat.meetingDate}
                      </span>

                    )}

                    {selectedChat.meetingTime && (

                      <span>
                        🕐{' '}
                        {selectedChat.meetingTime}
                      </span>

                    )}

                  </div>

                </header>


                {/* ==================================
                    SAVED MESSAGES
                ================================== */}

                <div className="active-chat-messages">

                  {(selectedChat.messages || [])
                    .length === 0 ? (

                    <div className="conversation-empty">

                      <div>
                        💬
                      </div>

                      <h3>
                        No messages
                      </h3>

                      <p>
                        No messages were sent
                        during this meeting.
                      </p>

                    </div>

                  ) : (

                    selectedChat.messages.map(
                      (item) => (

                        <div
                          className={`message-row ${
                            item.sender === 'You'
                              ? 'message-you'
                              : ''
                          }`}
                          key={item.id}
                        >


                          {/* AVATAR */}

                          <div className="message-avatar">

                            {item.sender === 'You'
                              ? 'TZ'
                              : selectedChat.initials ||
                                'WS'}

                          </div>


                          {/* MESSAGE */}

                          <div className="message-content">

                            <div className="message-meta">

                              <strong>
                                {item.sender}
                              </strong>

                              <span>
                                {item.time || ''}
                              </span>

                            </div>

                            <div className="message-bubble">
                              {item.text}
                            </div>

                          </div>

                        </div>

                      )
                    )

                  )}

                </div>


                {/* ==================================
                    SAVED CHAT FOOTER
                ================================== */}

                <div className="saved-chat-footer">

                  <span>
                    🔒 This conversation is saved
                    from a completed meeting.
                  </span>


                  {selectedChat.savedAt && (

                    <span>
                      Saved{' '}
                      {formatSavedDate(
                        selectedChat.savedAt
                      )}
                    </span>

                  )}

                </div>

              </>

            )}

          </section>

        </section>

    </DashboardLayout>
  )
}

export default ChatsPage