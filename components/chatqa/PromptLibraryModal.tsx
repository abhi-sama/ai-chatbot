'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BarChart3, Code, FileText, GripVertical, Lightbulb, MessageSquare,
  Pencil, Pin, PinOff, Plus, Search, Trash2, TrendingUp,
} from 'lucide-react';
import type { Prompt } from '@/types/chatqa';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  pinnedPrompts: Prompt[];
  onCreate: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'isDefault' | 'usageCount'>) => void;
  onUpdate: (id: string, updates: Partial<Prompt>) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onReorder?: (newOrder: string[]) => void;
}

const CATEGORIES = ['Analysis', 'Writing', 'Code', 'Research', 'Data', 'Creative'] as const;
const ICON_OPTIONS = [
  { name: 'BarChart3', component: BarChart3 },
  { name: 'FileText', component: FileText },
  { name: 'Code', component: Code },
  { name: 'Search', component: Search },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'Lightbulb', component: Lightbulb },
  { name: 'MessageSquare', component: MessageSquare },
] as const;

function getIcon(name: string) {
  return ICON_OPTIONS.find((i) => i.name === name)?.component ?? MessageSquare;
}

interface PromptForm {
  title: string; description: string; content: string;
  category: string; icon: string; isPinned: boolean;
}
const emptyForm: PromptForm = {
  title: '', description: '', content: '',
  category: 'Analysis', icon: 'MessageSquare', isPinned: false,
};

// ─── Draggable Pinned Row ───────────────────────────────────────────────────

function DraggablePinnedRow({ prompt, onUnpin }: { prompt: Prompt; onUnpin: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: prompt.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined, opacity: isDragging ? 0.7 : 1 };
  const Icon = getIcon(prompt.icon);

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-chatqa-surface ${isDragging ? 'shadow-lg bg-chatqa-surface' : ''}`}>
      <button ref={setActivatorNodeRef} {...attributes} {...listeners} className="shrink-0 cursor-grab rounded p-1 text-chatqa-muted hover:text-chatqa-text active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chatqa-accent/10">
        <Icon className="h-4 w-4 text-chatqa-accent" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-chatqa-text">{prompt.title}</span>
        <span className="truncate text-xs text-chatqa-muted">{prompt.description}</span>
      </div>
      <button onClick={() => onUnpin(prompt.id)} className="shrink-0 rounded-md p-1.5 text-chatqa-accent hover:text-red-500 transition-colors" title="Unpin">
        <PinOff className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Prompt Row (All Prompts tab) ───────────────────────────────────────────

function PromptRow({
  prompt, onTogglePin, onEdit, onDelete, deletingId, setDeletingId,
}: {
  prompt: Prompt; onTogglePin: (id: string) => void; onEdit: (p: Prompt) => void;
  onDelete: (id: string) => void; deletingId: string | null; setDeletingId: (id: string | null) => void;
}) {
  const Icon = getIcon(prompt.icon);
  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-chatqa-surface">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chatqa-accent/10">
        <Icon className="h-4 w-4 text-chatqa-accent" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-chatqa-text">{prompt.title}</span>
        <span className="truncate text-xs text-chatqa-muted">{prompt.description}</span>
      </div>
      <span className="shrink-0 rounded-md bg-chatqa-surface px-2 py-0.5 text-[10px] font-medium text-chatqa-text-secondary">{prompt.category}</span>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={() => onTogglePin(prompt.id)} className={`rounded-md p-1.5 transition-colors ${prompt.isPinned ? 'text-chatqa-accent' : 'text-chatqa-muted hover:text-chatqa-text'}`} title={prompt.isPinned ? 'Unpin' : 'Pin to home'}>
          {prompt.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>
        <button onClick={() => onEdit(prompt)} className="rounded-md p-1.5 text-chatqa-muted transition-colors hover:text-chatqa-text" title="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {!prompt.isDefault && (
          deletingId === prompt.id ? (
            <span className="flex items-center gap-1.5 text-xs ml-1">
              <button onClick={() => { onDelete(prompt.id); setDeletingId(null); }} className="font-medium text-red-500 hover:text-red-400">Delete</button>
              <button onClick={() => setDeletingId(null)} className="text-chatqa-muted hover:text-chatqa-text">Cancel</button>
            </span>
          ) : (
            <button onClick={() => setDeletingId(prompt.id)} className="rounded-md p-1.5 text-chatqa-muted transition-colors hover:text-red-500" title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── Form ───────────────────────────────────────────────────────────────────

function PromptFormPanel({ form, setForm, onSave, onCancel }: {
  form: PromptForm; setForm: (f: PromptForm) => void; onSave: () => void; onCancel: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
      <div className="rounded-xl border border-chatqa-border bg-chatqa-surface p-5 space-y-3">
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-chatqa-border bg-chatqa-bg px-3 py-2 text-sm text-chatqa-text placeholder:text-chatqa-muted outline-none focus:border-chatqa-accent transition-colors" />
        <textarea placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-chatqa-border bg-chatqa-bg px-3 py-2 text-sm text-chatqa-text placeholder:text-chatqa-muted outline-none focus:border-chatqa-accent transition-colors resize-none" />
        <textarea placeholder="Prompt content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} className="w-full rounded-lg border border-chatqa-border bg-chatqa-bg px-3 py-2 text-sm text-chatqa-text placeholder:text-chatqa-muted outline-none focus:border-chatqa-accent transition-colors resize-none" />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-chatqa-muted">Category</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${form.category === cat ? 'bg-chatqa-accent text-white shadow-sm' : 'bg-chatqa-bg text-chatqa-muted border border-chatqa-border hover:text-chatqa-text'}`}>{cat}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-chatqa-muted">Icon</label>
          <div className="flex gap-1.5">
            {ICON_OPTIONS.map(({ name, component: Ic }) => (
              <button key={name} type="button" onClick={() => setForm({ ...form, icon: name })} className={`rounded-lg p-2 transition-all ${form.icon === name ? 'bg-chatqa-accent text-white shadow-sm' : 'bg-chatqa-bg text-chatqa-muted border border-chatqa-border hover:text-chatqa-text'}`}><Ic className="h-4 w-4" /></button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-chatqa-muted hover:text-chatqa-text transition-colors">Cancel</button>
          <button type="button" onClick={onSave} disabled={!form.title.trim() || !form.content.trim()} className="rounded-lg bg-chatqa-accent px-4 py-2 text-sm font-medium text-white hover:bg-chatqa-accent-hover transition-colors disabled:opacity-40">Save</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────────

export function PromptLibraryModal({
  isOpen, onClose, prompts, pinnedPrompts, onCreate, onUpdate, onDelete, onTogglePin, onReorder,
}: PromptLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'pinned'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<PromptForm>(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function cancelForm() { setIsCreating(false); setEditingId(null); setForm(emptyForm); }
  function startCreate() { setEditingId(null); setForm(emptyForm); setIsCreating(true); }
  function startEdit(prompt: Prompt) {
    setIsCreating(false); setEditingId(prompt.id);
    setForm({ title: prompt.title, description: prompt.description, content: prompt.content, category: prompt.category, icon: prompt.icon, isPinned: prompt.isPinned });
  }
  function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return;
    if (isCreating) {
      onCreate({ title: form.title, description: form.description, content: form.content, category: form.category, icon: form.icon, isPinned: form.isPinned, userId: undefined, updatedAt: undefined });
    } else if (editingId) {
      onUpdate(editingId, { title: form.title, description: form.description, content: form.content, category: form.category, icon: form.icon });
    }
    cancelForm();
  }

  const showForm = isCreating || editingId !== null;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = pinnedPrompts.map((p) => p.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    onReorder?.(arrayMove(ids, oldIdx, newIdx));
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); cancelForm(); } }}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden border-chatqa-border bg-chatqa-bg p-0">
        <div className="px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-chatqa-text">Prompt Library</DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex rounded-xl bg-chatqa-surface p-1">
            {([['all', 'All Prompts'], ['pinned', `Pinned (${pinnedPrompts.length})`]] as const).map(([tab, label]) => (
              <button key={tab} type="button" onClick={() => { setActiveTab(tab as 'all' | 'pinned'); cancelForm(); }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === tab ? 'bg-chatqa-bg text-chatqa-text shadow-sm' : 'text-chatqa-muted hover:text-chatqa-text'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto chatqa-scroll px-6 pb-6">

          {/* ── All Prompts Tab ── */}
          {activeTab === 'all' && (
            <>
              {/* Add new — button at top, form appears at top only when creating */}
              {!isCreating && (
                <button type="button" onClick={startCreate} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-chatqa-border py-3 text-sm text-chatqa-muted transition-colors hover:border-chatqa-accent hover:text-chatqa-accent">
                  <Plus className="h-4 w-4" /> Add New Prompt
                </button>
              )}

              <AnimatePresence>{isCreating && <PromptFormPanel form={form} setForm={setForm} onSave={handleSave} onCancel={cancelForm} />}</AnimatePresence>

              {/* List with inline edit form below the row being edited */}
              <div className="space-y-0.5">
                {prompts.map((prompt) => (
                  <div key={prompt.id}>
                    {editingId !== prompt.id && (
                      <PromptRow prompt={prompt} onTogglePin={onTogglePin} onEdit={startEdit} onDelete={onDelete} deletingId={deletingId} setDeletingId={setDeletingId} />
                    )}
                    <AnimatePresence>
                      {editingId === prompt.id && (
                        <PromptFormPanel form={form} setForm={setForm} onSave={handleSave} onCancel={cancelForm} />
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Pinned Order Tab ── */}
          {activeTab === 'pinned' && (
            <>
              {pinnedPrompts.length === 0 ? (
                <div className="py-12 text-center">
                  <Pin className="mx-auto h-8 w-8 text-chatqa-muted mb-3" />
                  <p className="text-sm text-chatqa-muted">No pinned prompts</p>
                  <p className="mt-1 text-xs text-chatqa-muted">Pin prompts from the &quot;All Prompts&quot; tab to show them on the home screen</p>
                </div>
              ) : (
                <>
                  <p className="mb-3 text-xs text-chatqa-muted">Drag to reorder. These prompts appear on the home screen.</p>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={pinnedPrompts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-0.5">
                        {pinnedPrompts.map((prompt) => (
                          <DraggablePinnedRow key={prompt.id} prompt={prompt} onUnpin={onTogglePin} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
