import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  CheckCircle,
  Circle,
  Calendar,
  Flag,
  Trash2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Card, Button, Input, Modal } from '@/components';
import { tasksOps } from '@/store/db';
import type { Task, SubTask } from '@/types';
import { generateId, formatDate } from '@/utils/helpers';

interface TasksPanelProps {
  onUpdate?: () => void;
}

export function TasksPanel({ onUpdate }: TasksPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const allTasks = await tasksOps.getAll();
    setTasks(allTasks.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const toggleTask = async (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    await tasksOps.update(updated);
    loadTasks();
    onUpdate?.();
  };

  const toggleSubtask = async (task: Task, subtaskId: string) => {
    const updated = {
      ...task,
      subtasks: task.subtasks?.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      ),
    };
    await tasksOps.update(updated);
    loadTasks();
    onUpdate?.();
  };

  const deleteTask = async (id: string) => {
    await tasksOps.delete(id);
    loadTasks();
    onUpdate?.();
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      const updated: Task = {
        ...editingTask,
        ...taskData,
        updatedAt: new Date(),
      };
      await tasksOps.update(updated);
    } else {
      const newTask: Task = {
        id: generateId(),
        title: taskData.title || 'Untitled Task',
        description: taskData.description,
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate,
        completed: false,
        subtasks: taskData.subtasks || [],
        tags: taskData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await tasksOps.add(newTask);
    }
    setIsCreating(false);
    setEditingTask(null);
    loadTasks();
    onUpdate?.();
  };

  const priorityColors = {
    low: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Low' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Medium' },
    high: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'High' },
    urgent: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Urgent' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-gray-400 text-sm">
            {pendingCount} pending • {completedCount} completed
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => setIsCreating(true)}
        >
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-crimson text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <CheckCircle size={32} className="text-gray-500" />
            </div>
            <div>
              <p className="text-lg font-medium">No tasks</p>
              <p className="text-gray-400">Create a task to stay productive</p>
            </div>
            <Button
              variant="secondary"
              icon={<Plus size={18} />}
              onClick={() => setIsCreating(true)}
            >
              Create Task
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card
                  className={`transition-all ${task.completed ? 'opacity-60' : ''}`}
                  hover={!task.completed}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTask(task)}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-500 hover:border-crimson'
                      }`}
                    >
                      {task.completed && <CheckCircle size={14} className="text-white" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Priority Badge */}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text}`}>
                            {priorityColors[task.priority].label}
                          </span>

                          {/* Expand/Collapse */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <button
                              onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <ChevronDown
                                size={16}
                                className={`transition-transform ${expandedTask === task.id ? 'rotate-180' : ''}`}
                              />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle size={12} />
                            {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}
                          </span>
                        )}
                      </div>

                      {/* Subtasks */}
                      <AnimatePresence>
                        {expandedTask === task.id && task.subtasks && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 pl-4 space-y-2 border-l-2 border-white/10"
                          >
                            {task.subtasks.map((subtask) => (
                              <div
                                key={subtask.id}
                                className="flex items-center gap-3"
                              >
                                <button
                                  onClick={() => toggleSubtask(task, subtask.id)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    subtask.completed
                                      ? 'bg-green-500 border-green-500'
                                      : 'border-gray-500'
                                  }`}
                                >
                                  {subtask.completed && <CheckCircle size={10} className="text-white" />}
                                </button>
                                <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                                  {subtask.title}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Task' : 'New Task'}
        size="lg"
      >
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
          onCancel={() => {
            setIsCreating(false);
            setEditingTask(null);
          }}
        />
      </Modal>
    </div>
  );
}

interface TaskFormProps {
  task: Task | null;
  onSave: (data: Partial<Task>) => void;
  onCancel: () => void;
}

function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>(
    task?.subtasks || []
  );
  const [newSubtask, setNewSubtask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      subtasks,
    });
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        { id: generateId(), title: newSubtask.trim(), completed: false },
      ]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        placeholder="Enter task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          placeholder="Add description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-crimson/50"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">Priority</label>
          <div className="grid grid-cols-2 gap-2">
            {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  priority === p
                    ? 'bg-crimson text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {/* Subtasks */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Subtasks</label>
        <div className="space-y-2">
          {subtasks.map((st) => (
            <div
              key={st.id}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/5"
            >
              <span className="flex-1 text-sm">{st.title}</span>
              <button
                type="button"
                onClick={() => removeSubtask(st.id)}
                className="p-1 rounded hover:bg-red-500/20 text-red-400"
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add subtask..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSubtask();
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none"
            />
            <Button type="button" variant="ghost" size="sm" onClick={addSubtask}>
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          {task ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}