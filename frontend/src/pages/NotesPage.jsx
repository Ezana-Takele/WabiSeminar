import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import './NotesPage.css'

function NotesPage() {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  /* ========================================
     LOAD NOTES
  ======================================== */

  useEffect(() => {
    const savedNotes =
      JSON.parse(localStorage.getItem('wabiNotes')) || []

    setNotes(savedNotes)

    if (savedNotes.length > 0) {
      const firstNote = savedNotes[0]

      setSelectedNote(firstNote)
      setTitle(firstNote.title)
      setContent(firstNote.content)
    }
  }, [])

  /* ========================================
     SAVE NOTES TO LOCAL STORAGE
  ======================================== */

  const saveNotes = (updatedNotes) => {
    setNotes(updatedNotes)

    localStorage.setItem(
      'wabiNotes',
      JSON.stringify(updatedNotes)
    )
  }

  /* ========================================
     CREATE NOTE
  ======================================== */

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
      updatedAt: new Date().toISOString(),
    }

    const updatedNotes = [
      newNote,
      ...notes,
    ]

    saveNotes(updatedNotes)

    setSelectedNote(newNote)
    setTitle(newNote.title)
    setContent(newNote.content)
  }

  /* ========================================
     SELECT NOTE
  ======================================== */

  const selectNote = (note) => {
    setSelectedNote(note)
    setTitle(note.title || 'Untitled Note')
    setContent(note.content || '')
  }

  /* ========================================
     SAVE CURRENT NOTE
  ======================================== */

  const handleSave = () => {
    if (!selectedNote) {
      return
    }

    const updatedNote = {
      ...selectedNote,
      title: title.trim() || 'Untitled Note',
      content,
      updatedAt: new Date().toISOString(),
    }

    const updatedNotes = notes.map((note) =>
      note.id === selectedNote.id
        ? updatedNote
        : note
    )

    saveNotes(updatedNotes)

    setSelectedNote(updatedNote)
    setTitle(updatedNote.title)
    setContent(updatedNote.content)
  }

  /* ========================================
     DELETE NOTE
  ======================================== */

  const deleteNote = () => {
    if (!selectedNote) {
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this note?'
    )

    if (!confirmed) {
      return
    }

    const updatedNotes = notes.filter(
      (note) => note.id !== selectedNote.id
    )

    saveNotes(updatedNotes)

    if (updatedNotes.length > 0) {
      const nextNote = updatedNotes[0]

      setSelectedNote(nextNote)
      setTitle(nextNote.title || 'Untitled Note')
      setContent(nextNote.content || '')
    } else {
      setSelectedNote(null)
      setTitle('')
      setContent('')
    }
  }

  /* ========================================
     FORMAT DATE
  ======================================== */

  const formatDate = (date) => {
    if (!date) {
      return ''
    }

    return new Date(date).toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    )
  }

  return (
    <DashboardLayout>
      <div className="notes-main">

        {/* HEADER */}

        <header className="notes-header">

          <div>
            <h1>
              Notes
            </h1>

            <p>
              Keep your ideas, meeting notes, and
              important information organized.
            </p>

          </div>

          <button
            type="button"
            className="notes-new-button"
            onClick={createNote}
          >
            <span>＋</span>
            New Note
          </button>

        </header>


        {/* ========================================
            NOTES WORKSPACE
        ======================================== */}

        <section className="notes-workspace">

          {/* ======================================
              NOTES LIST
          ====================================== */}

          <aside className="notes-list-panel">

            <div className="notes-list-top">

              <div>

                <h2>
                  My Notes
                </h2>

                <span>
                  {notes.length}{' '}
                  {notes.length === 1
                    ? 'note'
                    : 'notes'}
                </span>

              </div>

              <button
                type="button"
                className="notes-add-small"
                onClick={createNote}
                title="New note"
              >
                ＋
              </button>

            </div>


            {notes.length === 0 ? (

              <div className="notes-list-empty">

                <div className="notes-empty-icon">
                  📝
                </div>

                <h3>
                  No notes yet
                </h3>

                <p>
                  Create your first note to get
                  started.
                </p>

                <button
                  type="button"
                  onClick={createNote}
                  className="notes-create-empty"
                >
                  Create Note
                </button>

              </div>

            ) : (

              <div className="notes-list">

                {notes.map((note) => (

                  <button
                    type="button"
                    key={note.id}
                    className={`note-item ${
                      selectedNote?.id === note.id
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() =>
                      selectNote(note)
                    }
                  >

                    <div className="note-item-icon">
                      📝
                    </div>

                    <div className="note-item-content">

                      <strong>
                        {note.title ||
                          'Untitled Note'}
                      </strong>

                      <p>
                        {note.content
                          ? note.content
                              .replace(/\n/g, ' ')
                              .substring(0, 60)
                          : 'No content yet'}
                      </p>

                      <span>
                        {formatDate(
                          note.updatedAt
                        )}
                      </span>

                    </div>

                  </button>

                ))}

              </div>

            )}

          </aside>


          {/* ======================================
              NOTE EDITOR
          ====================================== */}

          <section className="note-editor">

            {!selectedNote ? (

              <div className="note-editor-empty">

                <div className="note-editor-empty-icon">
                  📝
                </div>

                <h2>
                  No note selected
                </h2>

                <p>
                  Select a note from the left or
                  create a new one.
                </p>

                <button
                  type="button"
                  className="notes-create-empty"
                  onClick={createNote}
                >
                  ＋ New Note
                </button>

              </div>

            ) : (

              <>

                {/* EDITOR HEADER */}

                <div className="note-editor-header">

                  <div className="note-editor-title-area">

                    <span>
                      NOTE
                    </span>

                    <input
                      type="text"
                      value={title}
                      onChange={(e) =>
                        setTitle(e.target.value)
                      }
                      placeholder="Note title"
                    />

                  </div>

                  <div className="note-editor-actions">

                    <button
                      type="button"
                      className="note-delete-button"
                      onClick={deleteNote}
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      className="note-save-button"
                      onClick={handleSave}
                    >
                      Save
                    </button>

                  </div>

                </div>


                {/* EDITOR */}

                <div className="note-editor-content">

                  <textarea
                    value={content}
                    onChange={(e) =>
                      setContent(e.target.value)
                    }
                    placeholder="Start writing your notes..."
                  />

                </div>


                {/* FOOTER */}

                <div className="note-editor-footer">

                  <span>
                    Last updated{' '}
                    {formatDate(
                      selectedNote.updatedAt
                    )}
                  </span>

                  <span>
                    {content.length} characters
                  </span>

                </div>

              </>

            )}

          </section>

        </section>

      </div>

    </DashboardLayout>
  )
}

export default NotesPage