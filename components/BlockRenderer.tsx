import { BlockConfig } from "@/lib/sections";
import { HeatmapGrid } from "@/components/HeatmapGrid";
import { MealLog } from "@/components/MealLog";
import { FinanceTracker } from "@/components/FinanceTracker";
import { NetWorthTracker } from "@/components/NetWorthTracker";
import { LogBlock } from "@/components/LogBlock";
import { ListBlock } from "@/components/ListBlock";
import { RitualBlock } from "@/components/RitualBlock";
import { DynamicHabits } from "@/components/DynamicHabits";
import { PersonalContentEditor } from "@/components/PersonalContentEditor";

export function BlockRenderer({ block }: { block: BlockConfig }) {
  switch (block.kind) {
    case "habit":
      return <HeatmapGrid habitKey={block.habitKey} />;
    case "meals":
      return <MealLog />;
    case "finance":
      return <FinanceTracker scope={block.scope} title={block.title} />;
    case "networth":
      return <NetWorthTracker />;
    case "ritual":
      return <RitualBlock ritualKey={block.ritualKey} />;
    case "dynamic-habits":
      return <DynamicHabits area={block.area} dimension={block.dimension} />;
    case "personal-content":
      return <PersonalContentEditor mode={block.mode} />;
    case "log":
      return (
        <LogBlock
          blockKey={block.blockKey}
          title={block.title}
          categorias={block.categorias}
          trackMonto={block.trackMonto}
          placeholder={block.placeholder}
        />
      );
    case "list":
      return (
        <ListBlock
          blockKey={block.blockKey}
          title={block.title}
          allowAssign={block.allowAssign}
          itemLabel={block.itemLabel}
        />
      );
    default:
      return null;
  }
}
