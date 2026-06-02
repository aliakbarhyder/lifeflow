import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  Quote,
  CheckSquare,
  BookOpen,
  Archive,
} from 'lucide-react';
import { Card, Button, Input, Textarea, Modal } from '@/components';
import { notesOps } from '@/store/db';
import type { Note } from '@/types';
import { generateId, formatDate, formatTimeAgo } from '@/utils/helpers';

export function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<Note['type'] | 'all'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const allNotes = await notesOps.getAll();
    setNotes(allNotes.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ));
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || note.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    await notesOps.delete(id);
    loadNotes();
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    if (editingNote) {
      const updated: Note = {
        ...editingNote,
        ...noteData,
        updatedAt: new Date(),
      };
      await notesOps.update(updated);
    } else {
      const newNote: Note = {
        id: generateId(),
        title: noteData.title || 'Untitled',
        content: noteData.content || '',
        type: noteData.type || 'note',
        tags: noteData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await notesOps.add(newNote);
    }
    setIsCreating(false);
    setEditingNote(null);
    loadNotes();
  };

  const typeIcons = {
    note: <Edit2 size={16} />,
    quote: <Quote size={16} />,
    highlight: <BookOpen size={16} />,
    task: <CheckSquare size={16} />,
  };

  const typeColors = {
    note: 'text-blue-400 bg-blue-400/10',
    quote: 'text-purple-400 bg-purple-400/10',
    highlight: 'text-yellow-400 bg-yellow-400/10',
    task: 'text-green-400 bg-green-400/10',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notes</h2>
          <p className="text-gray-400 text-sm">Capture your thoughts and ideas</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => setIsCreating(true)}
        >
          New Note
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            icon={<Search size={18} />}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'note', 'quote', 'highlight', 'task'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterType === type
                  ? 'bg-crimson text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <BookOpen size={32} className="text-gray-500" />
            </div>
            <div>
              <p className="text-lg font-medium">No notes yet</p>
              <p className="text-gray-400">Create your first note to get started</p>
            </div>
            <Button
              variant="secondary"
              icon={<Plus size={18} />}
              onClick={() => setIsCreating(true)}
            >
              Create Note
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card
                  className="h-full cursor-pointer group"
                  onClick={() => {
                    setEditingNote(note);
                    setIsCreating(true);
                  }}
                >
                  {/* Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${typeColors[note.type]}`}>
                      {typeIcons[note.type]}
                      {note.type}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1">{note.title}</h3>

                  {/* Content Preview */}
                  <p className="text-sm text-gray-400 line-clamp-3 mb-4">{note.content}</p>

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-white/10">
                    <span>{formatDate(note.updatedAt)}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(note.updatedAt)}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreating}
        onClose={() => {
          setIsCreating(false);
          setEditingNote(null);
        }}
        title={editingNote ? 'Edit Note' : 'New Note'}
        size="lg"
      >
        <NoteForm
          note={editingNote}
          onSave={handleSaveNote}
          onCancel={() => {
            setIsCreating(false);
            setEditingNote(null);
          }}
        />
      </Modal>
    </div>
  );
}

interface NoteFormProps {
  note: Note | null;
  onSave: (data: Partial<Note>) => void;
  onCancel: () => void;
}

function NoteForm({ note, onSave, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [type, setType] = useState<Note['type']>(note?.type || 'note');
  const [tags, setTags] = useState<string[]>(note?.tags || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, content, type, tags });
  };

  const noteTypes = [
    { value: 'note', label: 'Note', icon: <Edit2 size={16} /> },
    { value: 'quote', label: 'Quote', icon: <Quote size={16} /> },
    { value: 'highlight', label: 'Highlight', icon: <BookOpen size={16} /> },
    { value: 'task', label: 'Task', icon: <CheckSquare size={16} /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selector */}
      <div className="grid grid-cols-4 gap-2">
        {noteTypes.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value as Note['type'])}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              type === t.value
                ? 'bg-crimson text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            {t.icon}
            <span className="text-xs">{t.label}</span>
          </button>
        ))}
      </div>

      <Input
        label="Title"
        placeholder="Enter note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Textarea
        label="Content"
        placeholder="Write your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Tags</label>
        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-crimson/20 text-crimson text-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tag..."
            className="flex-1 min-w-[100px] bg-transparent outline-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = (e.target as HTMLInputElement).value.trim();
                if (value && !tags.includes(value)) {
                  setTags([...tags, value]);
                }
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          {note ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}