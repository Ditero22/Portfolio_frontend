import { ArrowDown, ArrowUp, Eye, Pencil, Trash2 } from "lucide-react";

import type { Experience } from "@/features/public/experience/types/experience";
import { experiencePeriod } from "@/features/public/experience/utils/experiencePeriod";
import {
  AdminIconAction,
  AdminStatusBadge,
  Table,
} from "@/shared/components/ui";

interface Props {
  orderedItems: Experience[];
  isSubmitting: boolean;
  updatingVisibility: string | null;
  moveExperience: (index: number, direction: number) => void;
  onView: (item: Experience) => void;
  onEdit: (item: Experience) => void;
  onVisibility: (item: Experience) => void;
  onDelete: (item: Experience) => void;
}

function OrderControls({
  item,
  index,
  length,
  disabled,
  onMove,
}: {
  item: Experience;
  index: number;
  length: number;
  disabled: boolean;
  onMove: (index: number, direction: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="min-w-6 text-center font-mono text-xs tabular-nums text-ink/55">
        {String(index + 1).padStart(2, "0")}
      </span>
      <AdminIconAction
        icon={<ArrowUp size={15} aria-hidden="true" />}
        label={`Move ${item.company} up`}
        title="Move up"
        disabled={index === 0 || disabled}
        onClick={() => onMove(index, -1)}
      />
      <AdminIconAction
        icon={<ArrowDown size={15} aria-hidden="true" />}
        label={`Move ${item.company} down`}
        title="Move down"
        disabled={index === length - 1 || disabled}
        onClick={() => onMove(index, 1)}
      />
    </div>
  );
}

function VisibilityControl({
  item,
  onRequestChange,
  compact = false,
}: {
  item: Experience;
  onRequestChange: () => void;
  compact?: boolean;
}) {
  const nextStatus = item.published ? "hide" : "publish";

  return (
    <button
      type="button"
      aria-label={`${nextStatus === "hide" ? "Hide" : "Publish"} ${item.company}; currently ${item.published ? "public" : "hidden"}`}
      title={item.published ? "Public — click to hide" : "Hidden — click to publish"}
      onClick={onRequestChange}
      className={`inline-flex min-h-9 items-center gap-2 rounded-lg p-1.5 text-xs text-ink/65 transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-500 ${compact ? "flex-col gap-1" : ""}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${item.published ? "bg-teal-600" : "bg-ink/25"}`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${item.published ? "translate-x-4" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}

export default function ExperienceTable({
  orderedItems,
  isSubmitting,
  updatingVisibility,
  moveExperience,
  onView,
  onEdit,
  onVisibility,
  onDelete,
}: Props) {
  const movementDisabled = isSubmitting || updatingVisibility !== null;

  return (
    <Table<Experience>
      ariaLabel="Experience entries"
      className="mt-8"
      data={orderedItems}
      emptyMessage="No experience entries yet. Add your first role to start building this section."
      getRowKey={(item) => item.id}
      minWidthClassName="min-w-[880px]"
      columns={[
        {
          key: "order",
          label: "Order",
          headerClassName: "w-36 text-center",
          cellClassName: "w-36",
          render: (item, index) => (
            <OrderControls
              item={item}
              index={index}
              length={orderedItems.length}
              disabled={movementDisabled}
              onMove={moveExperience}
            />
          ),
        },
        {
          key: "company",
          label: "Company",
          headerClassName: "w-[22%]",
          cellClassName: "max-w-56 whitespace-normal break-words [overflow-wrap:anywhere] font-medium text-ink",
          render: (item) => item.company,
        },
        {
          key: "role",
          label: "Role",
          headerClassName: "w-[22%]",
          cellClassName: "max-w-56 whitespace-normal break-words [overflow-wrap:anywhere] text-ink/65",
          render: (item) => item.role,
        },
        {
          key: "dates",
          label: "Dates",
          headerClassName: "w-44",
          cellClassName: "whitespace-nowrap text-ink/60",
          render: (item) => experiencePeriod(item),
        },
        {
          key: "visibility",
          label: "Visibility",
          headerClassName: "w-28",
          render: (item) => (
            <AdminStatusBadge variant={item.published ? "public" : "quiet"}>
              {item.published ? "Public" : "Hidden"}
            </AdminStatusBadge>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          headerClassName: "w-48 text-center",
          cellClassName: "whitespace-nowrap",
          render: (item) => (
            <fieldset
              disabled={updatingVisibility !== null}
              className="flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <legend className="sr-only">Actions for {item.company}</legend>
              <AdminIconAction
                icon={<Eye size={17} aria-hidden="true" />}
                label={`View ${item.company}`}
                title="View experience"
                hasDialog
                onClick={() => onView(item)}
              />
              <AdminIconAction
                icon={<Pencil size={17} aria-hidden="true" />}
                label={`Edit ${item.company}`}
                title="Edit experience"
                hasDialog
                onClick={() => onEdit(item)}
              />
              <VisibilityControl
                item={item}
                compact
                onRequestChange={() => onVisibility(item)}
              />
              <AdminIconAction
                icon={<Trash2 size={17} aria-hidden="true" />}
                label={`Delete ${item.company}`}
                title="Delete experience"
                variant="danger"
                hasDialog
                onClick={() => onDelete(item)}
              />
            </fieldset>
          ),
        },
      ]}
      renderMobileItem={(item, index) => (
        <article className="rounded-2xl border border-ink/12 bg-surface p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words font-semibold text-ink [overflow-wrap:anywhere]">
                {item.company}
              </h2>
              <p className="mt-1 break-words text-sm text-ink/65 [overflow-wrap:anywhere]">
                {item.role}
              </p>
            </div>
            <AdminStatusBadge variant={item.published ? "public" : "quiet"}>
              {item.published ? "Public" : "Hidden"}
            </AdminStatusBadge>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3">
            <span className="text-xs text-ink/55">{experiencePeriod(item)}</span>
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                Order
              </span>
              <OrderControls
                item={item}
                index={index}
                length={orderedItems.length}
                disabled={movementDisabled}
                onMove={moveExperience}
              />
            </div>
          </div>
          <fieldset
            disabled={updatingVisibility !== null}
            className="mt-3 grid grid-cols-4 gap-1 border-t border-ink/10 pt-3 disabled:opacity-50"
          >
            <legend className="sr-only">Actions for {item.company}</legend>
            <button
              type="button"
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-ink/65 transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-teal-500"
              aria-label={`View ${item.company}`}
              onClick={() => onView(item)}
            >
              <Eye size={17} aria-hidden="true" />
              <span className="text-[10px]">View</span>
            </button>
            <button
              type="button"
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-ink/65 transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-teal-500"
              aria-label={`Edit ${item.company}`}
              onClick={() => onEdit(item)}
            >
              <Pencil size={17} aria-hidden="true" />
              <span className="text-[10px]">Edit</span>
            </button>
            <VisibilityControl
              item={item}
              compact
              onRequestChange={() => onVisibility(item)}
            />
            <button
              type="button"
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-red-600/75 transition hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-500"
              aria-label={`Delete ${item.company}`}
              onClick={() => onDelete(item)}
            >
              <Trash2 size={17} aria-hidden="true" />
              <span className="text-[10px]">Delete</span>
            </button>
          </fieldset>
        </article>
      )}
    />
  );
}
