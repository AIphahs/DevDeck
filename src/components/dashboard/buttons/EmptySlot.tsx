import { Plus } from "lucide-react";

interface Props {
  col: number;
  row: number;
  isEditing: boolean;
  onAdd: (col: number, row: number) => void;
}

export function EmptySlot({ col, row, isEditing, onAdd }: Props) {
  if (!isEditing) {
    return <div className="h-full w-full rounded-xl border border-dashed border-border/30" />;
  }

  return (
    <button
      onClick={() => onAdd(col, row)}
      className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-border hover:border-primary hover:bg-accent/50 transition-colors group"
    >
      <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
    </button>
  );
}
