'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useTreePath } from 'fumadocs-ui/contexts/tree';
import { ChevronRight } from 'lucide-react';
import type { Folder } from 'fumadocs-core/page-tree';
// Fumadocs owns the tree, active path and drawer; native disclosure defers closed lists.
export function SidebarFolder({ item, children }: { item: Folder; children: ReactNode }) {
  const active = useTreePath().includes(item);
  const [open, setOpen] = useState(active);
  useEffect(() => { if (active) setOpen(true); }, [active]);
  return <details className="native-doc-folder" open={open} onToggle={e => setOpen(e.currentTarget.open)}><summary>{item.icon}<span>{item.name}</span><ChevronRight size={13} /></summary>{open && <div className="native-doc-folder-content">{children}</div>}</details>;
}
