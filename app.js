document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const notesGrid = document.getElementById('notes-grid');
    const addNoteBtn = document.getElementById('add-note-btn');
    const noteModal = document.getElementById('note-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelNoteBtn = document.getElementById('cancel-note');
    const saveNoteBtn = document.getElementById('save-note');
    const modalTitle = document.getElementById('modal-title');
    const noteTitleInput = document.getElementById('note-title-input');
    const noteContentInput = document.getElementById('note-content-input');
    const noteIdInput = document.getElementById('note-id-input');

    // State
    let notes = JSON.parse(localStorage.getItem('nebula-notes')) || [];

    // Initialize App
    renderNotes();

    // Event Listeners
    addNoteBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelNoteBtn.addEventListener('click', closeModal);
    saveNoteBtn.addEventListener('click', saveNote);
    
    // Close modal on outside click
    noteModal.addEventListener('click', (e) => {
        if (e.target === noteModal) {
            closeModal();
        }
    });

    // Functions
    function renderNotes() {
        notesGrid.innerHTML = '';

        if (notes.length === 0) {
            notesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-feather"></i>
                    <p>It's quiet here. Create a note to get started.</p>
                </div>
            `;
            return;
        }

        // Sort notes by date descending
        const sortedNotes = [...notes].sort((a, b) => b.timestamp - a.timestamp);

        // Palette colors
        const colors = ['#99CDD8', '#DAEBE3', '#FDE8D3', '#F3C3B2', '#CFD6C4'];

        sortedNotes.forEach((note, index) => {
            const noteEl = document.createElement('div');
            noteEl.className = 'note-card';
            
            // Assign a color based on the id so it stays consistent
            const colorIndex = note.id ? note.id.charCodeAt(0) % colors.length : index % colors.length;
            noteEl.style.backgroundColor = colors[colorIndex];
            noteEl.style.animationDelay = `${index * 0.05}s`;
            
            const date = new Date(note.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });

            noteEl.innerHTML = `
                <div class="note-header">
                    <h3 class="note-title">${escapeHTML(note.title) || 'Untitled'}</h3>
                </div>
                <div class="note-content">${escapeHTML(note.content).replace(/\n/g, '<br>')}</div>
                <div class="note-footer">
                    <span class="note-date">${date}</span>
                    <div class="note-actions">
                        <button class="icon-btn edit-btn" title="Edit"><i class="fas fa-pen"></i></button>
                        <button class="icon-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;

            // Note Card Click -> Edit
            noteEl.addEventListener('click', (e) => {
                // Ignore if clicked on action buttons
                if (!e.target.closest('.note-actions')) {
                    openModal(note);
                }
            });

            // Action Buttons
            const editBtn = noteEl.querySelector('.edit-btn');
            const deleteBtn = noteEl.querySelector('.delete-btn');

            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(note);
            });

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteNote(note.id);
            });

            notesGrid.appendChild(noteEl);
        });
    }

    function openModal(note = null) {
        if (note) {
            modalTitle.textContent = 'Edit Note';
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            noteIdInput.value = note.id;
        } else {
            modalTitle.textContent = 'Create Note';
            noteTitleInput.value = '';
            noteContentInput.value = '';
            noteIdInput.value = '';
        }
        
        noteModal.classList.add('active');
        // Small timeout to allow transition to start before focusing
        setTimeout(() => {
            noteTitleInput.focus();
        }, 100);
    }

    function closeModal() {
        noteModal.classList.remove('active');
    }

    function saveNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        const id = noteIdInput.value;

        if (!title && !content) {
            // Don't save completely empty notes
            closeModal();
            return;
        }

        if (id) {
            // Update existing note
            const noteIndex = notes.findIndex(n => n.id === id);
            if (noteIndex > -1) {
                notes[noteIndex] = {
                    ...notes[noteIndex],
                    title,
                    content,
                    timestamp: Date.now() // Update timestamp on edit
                };
            }
        } else {
            // Create new note
            const newNote = {
                id: generateId(),
                title,
                content,
                timestamp: Date.now()
            };
            notes.push(newNote);
        }

        saveToLocalStorage();
        renderNotes();
        closeModal();
    }

    function deleteNote(id) {
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(n => n.id !== id);
            saveToLocalStorage();
            renderNotes();
        }
    }

    function saveToLocalStorage() {
        localStorage.setItem('nebula-notes', JSON.stringify(notes));
    }

    function generateId() {
        return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
