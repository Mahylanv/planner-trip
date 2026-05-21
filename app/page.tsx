"use client";

import {
  Bus,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Edit3,
  ExternalLink,
  Footprints,
  GripVertical,
  Link2,
  MapPin,
  Plane,
  Plus,
  RotateCcw,
  Sailboat,
  Save,
  Search,
  Trash2,
  Train,
  WalletCards,
  Waves,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { RealMap, RealMapMarker } from "./components/RealMap";
import { initialItinerary, TravelLink, TravelNode, TravelStatus, TravelTransport } from "./data/itinerary";

type EditorState = {
  mode: "create" | "edit";
  parentId: string | null;
  node?: TravelNode;
};

type NodeFormState = {
  title: string;
  duration: string;
  budget: string;
  emoji: string;
  time: string;
  provider: string;
  notes: string;
  status: TravelStatus;
  transport: TravelTransport;
  linksText: string;
};

type ViewMode = "detail" | "map" | "frise" | "grid";

type CountryTheme = {
  code: string;
  flag: string;
  label: string;
  accent: string;
  accentSoft: string;
  image: string;
};

type TimelineEntry = {
  node: TravelNode;
  depth: number;
  countryTitle: string;
  countryIndex: number;
  theme: CountryTheme;
};

const storageKey = "amsud-itinerary-v2";
const legacyStorageKeys = ["amsud-itinerary-v1"];

const emptyForm: NodeFormState = {
  title: "",
  duration: "",
  budget: "",
  emoji: "",
  time: "",
  provider: "",
  notes: "",
  status: "planned",
  transport: "",
  linksText: "",
};

const statusLabels: Record<TravelStatus, { emoji: string; label: string }> = {
  planned: { emoji: "🧭", label: "Prévu" },
  booked: { emoji: "🎟️", label: "Réservé" },
  done: { emoji: "✅", label: "Validé" },
  option: { emoji: "💡", label: "Facultative" },
};

const transportLabels: Record<TravelTransport, { emoji: string; label: string }> = {
  "": { emoji: "", label: "Aucun" },
  flight: { emoji: "✈️", label: "Vol" },
  bus: { emoji: "🚌", label: "Bus" },
  walk: { emoji: "🥾", label: "Marche" },
  boat: { emoji: "⛴️", label: "Bateau" },
  car: { emoji: "🚗", label: "Route" },
  train: { emoji: "🚆", label: "Train" },
};

const countryThemes: Record<string, CountryTheme> = {
  "bresil-nord": {
    code: "BR",
    flag: "🇧🇷",
    label: "Dunes, plages et baie tropicale",
    accent: "#138a36",
    accentSoft: "rgba(19, 138, 54, 0.13)",
    image: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1200&q=80",
  },
  guyane: {
    code: "GF",
    flag: "🇬🇫",
    label: "Forêt, fleuves et côte sauvage",
    accent: "#0c7a5b",
    accentSoft: "rgba(12, 122, 91, 0.13)",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80",
  },
  suriname: {
    code: "SR",
    flag: "🇸🇷",
    label: "Jungle intérieure et Paramaribo",
    accent: "#b3264a",
    accentSoft: "rgba(179, 38, 74, 0.12)",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  guyana: {
    code: "GY",
    flag: "🇬🇾",
    label: "Cascades, savanes et expéditions",
    accent: "#d49b16",
    accentSoft: "rgba(212, 155, 22, 0.16)",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
  },
  venezuela: {
    code: "VE",
    flag: "🇻🇪",
    label: "Tepuis et Caraïbes",
    accent: "#d03b2d",
    accentSoft: "rgba(208, 59, 45, 0.12)",
    image: "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?auto=format&fit=crop&w=1200&q=80",
  },
  colombie: {
    code: "CO",
    flag: "🇨🇴",
    label: "Caraïbes, Andes et parcs naturels",
    accent: "#e0a21a",
    accentSoft: "rgba(224, 162, 26, 0.16)",
    image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80",
  },
  equateur: {
    code: "EC",
    flag: "🇪🇨",
    label: "Volcans, marchés et Galápagos",
    accent: "#0b73b7",
    accentSoft: "rgba(11, 115, 183, 0.13)",
    image: "https://images.unsplash.com/photo-1508264165352-258db2ebd59b?auto=format&fit=crop&w=1200&q=80",
  },
  perou: {
    code: "PE",
    flag: "🇵🇪",
    label: "Cordillère, canyons et cités incas",
    accent: "#b92e36",
    accentSoft: "rgba(185, 46, 54, 0.12)",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80",
  },
  bolivie: {
    code: "BO",
    flag: "🇧🇴",
    label: "Altiplano, salars et villes hautes",
    accent: "#567f25",
    accentSoft: "rgba(86, 127, 37, 0.13)",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=80",
  },
  "rio-1": {
    code: "RIO",
    flag: "🇧🇷",
    label: "Pause plage et montagne",
    accent: "#008c9e",
    accentSoft: "rgba(0, 140, 158, 0.13)",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
  },
  uruguay: {
    code: "UY",
    flag: "🇺🇾",
    label: "Atlantique sud et capitales tranquilles",
    accent: "#2c6fb2",
    accentSoft: "rgba(44, 111, 178, 0.13)",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
  paraguay: {
    code: "PY",
    flag: "🇵🇾",
    label: "Chutes, collines et escapades nature",
    accent: "#c23642",
    accentSoft: "rgba(194, 54, 66, 0.12)",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  },
  "rio-2": {
    code: "RIO",
    flag: "🇧🇷",
    label: "Deuxième passage brésilien",
    accent: "#009577",
    accentSoft: "rgba(0, 149, 119, 0.13)",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
  },
  argentine: {
    code: "AR",
    flag: "🇦🇷",
    label: "Patagonie, villes et grands espaces",
    accent: "#4b8ed8",
    accentSoft: "rgba(75, 142, 216, 0.13)",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
  chili: {
    code: "CL",
    flag: "🇨🇱",
    label: "Déserts, fjords et Pacifique",
    accent: "#c54836",
    accentSoft: "rgba(197, 72, 54, 0.12)",
    image: "https://images.unsplash.com/photo-1531799006324-cb6fe6686af0?auto=format&fit=crop&w=1200&q=80",
  },
};

const fallbackThemes: CountryTheme[] = [
  {
    code: "TRIP",
    flag: "🧳",
    label: "Nouvelle destination",
    accent: "#087d8f",
    accentSoft: "rgba(8, 125, 143, 0.13)",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    code: "MAP",
    flag: "🗺️",
    label: "Bloc à organiser",
    accent: "#b0652a",
    accentSoft: "rgba(176, 101, 42, 0.13)",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
  },
  {
    code: "GO",
    flag: "📍",
    label: "Prochaine étape",
    accent: "#7451a9",
    accentSoft: "rgba(116, 81, 169, 0.12)",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
  },
];

const nodeEmojiById: Record<string, string> = {
  "bresil-nord": "🇧🇷",
  guyane: "🇬🇫",
  suriname: "🇸🇷",
  guyana: "🇬🇾",
  venezuela: "🇻🇪",
  colombie: "🇨🇴",
  equateur: "🇪🇨",
  perou: "🇵🇪",
  bolivie: "🇧🇴",
  "rio-1": "🇧🇷",
  uruguay: "🇺🇾",
  paraguay: "🇵🇾",
  "rio-2": "🇧🇷",
  argentine: "🇦🇷",
  chili: "🇨🇱",
  "parque-seminario": "🦎",
  "puerto-el-morro": "🐬",
};

const countryCoordinates: Record<string, [number, number]> = {
  "bresil-nord": [-2.53, -44.3],
  guyane: [4.92, -52.31],
  suriname: [5.85, -55.2],
  guyana: [6.8, -58.16],
  venezuela: [10.48, -66.9],
  colombie: [4.71, -74.07],
  equateur: [-0.18, -78.47],
  perou: [-12.05, -77.04],
  bolivie: [-16.5, -68.15],
  "rio-1": [-22.91, -43.17],
  uruguay: [-34.9, -56.16],
  paraguay: [-25.26, -57.58],
  "rio-2": [-22.91, -43.17],
  argentine: [-34.6, -58.38],
  chili: [-33.45, -70.67],
};

function makeId(title: string) {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "etape"}-${Date.now().toString(36)}`;
}

function getCountryTheme(node: TravelNode, index: number) {
  return countryThemes[node.id] ?? fallbackThemes[index % fallbackThemes.length];
}

function getNodeEmoji(node: TravelNode, theme?: CountryTheme) {
  return node.emoji ?? nodeEmojiById[node.id] ?? theme?.flag ?? "";
}

function nodeToForm(node: TravelNode): NodeFormState {
  return {
    title: node.title,
    duration: node.duration ?? "",
    budget: node.budget ?? "",
    emoji: node.emoji ?? nodeEmojiById[node.id] ?? "",
    time: node.time ?? "",
    provider: node.provider ?? "",
    notes: node.notes ?? "",
    status: node.status,
    transport: node.transport ?? "",
    linksText: (node.links ?? []).map((link) => `${link.label} | ${link.url}`).join("\n"),
  };
}

function parseLinks(value: string): TravelLink[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|").map((part) => part.trim());
      const url = rest.join("|").trim();

      if (!url && label.startsWith("http")) {
        return { label: "Lien", url: label };
      }

      return { label: label || "Lien", url };
    })
    .filter((link) => link.url.startsWith("http"));
}

function formToNode(form: NodeFormState, existing?: TravelNode): TravelNode {
  return {
    id: existing?.id ?? makeId(form.title),
    title: form.title.trim(),
    emoji: form.emoji.trim() || undefined,
    duration: form.duration.trim() || undefined,
    budget: form.budget.trim() || undefined,
    time: form.time.trim() || undefined,
    provider: form.provider.trim() || undefined,
    notes: form.notes.trim() || undefined,
    status: form.status,
    transport: form.transport || undefined,
    links: parseLinks(form.linksText),
    children: existing?.children ?? [],
  };
}

function addNode(nodes: TravelNode[], parentId: string | null, node: TravelNode): TravelNode[] {
  if (!parentId) {
    return [...nodes, node];
  }

  return nodes.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...item.children, node] };
    }

    return { ...item, children: addNode(item.children, parentId, node) };
  });
}

function updateNode(nodes: TravelNode[], node: TravelNode): TravelNode[] {
  return nodes.map((item) => {
    if (item.id === node.id) {
      return node;
    }

    return { ...item, children: updateNode(item.children, node) };
  });
}

function deleteNode(nodes: TravelNode[], nodeId: string): TravelNode[] {
  return nodes
    .filter((item) => item.id !== nodeId)
    .map((item) => ({ ...item, children: deleteNode(item.children, nodeId) }));
}

function hasNode(nodes: TravelNode[], nodeId: string): boolean {
  return nodes.some((node) => node.id === nodeId || hasNode(node.children, nodeId));
}

function mergeMissingSeedNodes(nodes: TravelNode[], seedNodes: TravelNode[]): TravelNode[] {
  const mergedNodes = nodes.map((node) => {
    const seedNode = seedNodes.find((item) => item.id === node.id);

    if (!seedNode) {
      return node;
    }

    return {
      ...node,
      children: mergeMissingSeedNodes(node.children, seedNode.children),
    };
  });

  seedNodes.forEach((seedNode) => {
    if (!hasNode(mergedNodes, seedNode.id)) {
      mergedNodes.push(seedNode);
    }
  });

  return mergedNodes;
}

function migrateItinerary(nodes: TravelNode[]): TravelNode[] {
  if (!hasNode(initialItinerary, "puerto-maldonado")) {
    return nodes;
  }

  return mergeMissingSeedNodes(nodes, initialItinerary);
}

function sumBudget(node: TravelNode): number {
  const ownAmount = Number(node.budget?.match(/\d+/)?.[0] ?? 0);
  return node.children.reduce((sum, child) => sum + sumBudget(child), ownAmount);
}

function countDurations(node: TravelNode): number {
  return (node.duration ? 1 : 0) + node.children.reduce((sum, child) => sum + countDurations(child), 0);
}

function countLinks(node: TravelNode): number {
  return (node.links?.length ?? 0) + node.children.reduce((sum, child) => sum + countLinks(child), 0);
}

function reorderSiblingNodes(nodes: TravelNode[], sourceId: string, targetId: string): TravelNode[] {
  if (sourceId === targetId) {
    return nodes;
  }

  const sourceIndex = nodes.findIndex((node) => node.id === sourceId);
  const targetIndex = nodes.findIndex((node) => node.id === targetId);

  if (sourceIndex >= 0 && targetIndex >= 0) {
    const nextNodes = [...nodes];
    const [movedNode] = nextNodes.splice(sourceIndex, 1);
    const nextTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;

    nextNodes.splice(nextTargetIndex, 0, movedNode);
    return nextNodes;
  }

  return nodes.map((node) => ({
    ...node,
    children: reorderSiblingNodes(node.children, sourceId, targetId),
  }));
}

function flattenNodes(nodes: TravelNode[]): TravelNode[] {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children)]);
}

function flattenTimeline(nodes: TravelNode[]): TimelineEntry[] {
  return nodes.flatMap((country, countryIndex) => {
    const theme = getCountryTheme(country, countryIndex);

    function walk(node: TravelNode, depth: number): TimelineEntry[] {
      return [
        { node, depth, countryTitle: country.title, countryIndex, theme },
        ...node.children.flatMap((child) => walk(child, depth + 1)),
      ];
    }

    return walk(country, 0);
  });
}

function filterNodes(nodes: TravelNode[], query: string): TravelNode[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return nodes;
  }

  return nodes
    .map((node) => {
      const childMatches = filterNodes(node.children, normalized);
      const haystack = [node.title, node.duration, node.budget, node.time, node.provider, node.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (haystack.includes(normalized) || childMatches.length > 0) {
        return { ...node, children: childMatches };
      }

      return null;
    })
    .filter((node): node is TravelNode => Boolean(node));
}

function transportIcon(transport?: TravelTransport) {
  if (transport === "flight") return <Plane aria-hidden="true" />;
  if (transport === "bus") return <Bus aria-hidden="true" />;
  if (transport === "boat") return <Sailboat aria-hidden="true" />;
  if (transport === "car") return <Car aria-hidden="true" />;
  if (transport === "walk") return <Footprints aria-hidden="true" />;
  if (transport === "train") return <Train aria-hidden="true" />;
  return <MapPin aria-hidden="true" />;
}

function NodeEditor({
  state,
  onCancel,
  onSubmit,
}: {
  state: EditorState;
  onCancel: () => void;
  onSubmit: (node: TravelNode, parentId: string | null, mode: EditorState["mode"]) => void;
}) {
  const [form, setForm] = useState<NodeFormState>(() => (state.node ? nodeToForm(state.node) : emptyForm));

  function updateField<Key extends keyof NodeFormState>(key: Key, value: NodeFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    onSubmit(formToNode(form, state.node), state.parentId, state.mode);
  }

  return (
    <div className="editor-backdrop" role="presentation">
      <form className="editor-panel" onSubmit={handleSubmit}>
        <div className="editor-head">
          <div>
            <p className="eyebrow">{state.mode === "create" ? "Nouvelle étape" : "Modifier"}</p>
            <h2>{state.mode === "create" ? "Ajouter au voyage" : state.node?.title}</h2>
          </div>
          <button className="icon-button ghost" type="button" onClick={onCancel} aria-label="Fermer">
            <X aria-hidden="true" />
          </button>
        </div>

        <label>
          Nom
          <input value={form.title} onChange={(event) => updateField("title", event.target.value)} autoFocus />
        </label>

        <div className="form-grid">
          <label>
            Emoji
            <input value={form.emoji} onChange={(event) => updateField("emoji", event.target.value)} placeholder="🇨🇴, 🦎, 🐬..." />
          </label>
          <label>
            Durée
            <input value={form.duration} onChange={(event) => updateField("duration", event.target.value)} placeholder="4j" />
          </label>
          <label>
            Budget
            <input value={form.budget} onChange={(event) => updateField("budget", event.target.value)} placeholder="80€" />
          </label>
          <label>
            Temps
            <input value={form.time} onChange={(event) => updateField("time", event.target.value)} placeholder="6h" />
          </label>
        </div>

        <div className="form-grid">
          <label>
            Source
            <input value={form.provider} onChange={(event) => updateField("provider", event.target.value)} placeholder="GYG" />
          </label>
          <label>
            Statut
            <select value={form.status} onChange={(event) => updateField("status", event.target.value as TravelStatus)}>
              {Object.entries(statusLabels).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.emoji} {meta.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Transport
            <select value={form.transport} onChange={(event) => updateField("transport", event.target.value as TravelTransport)}>
              {Object.entries(transportLabels).map(([value, meta]) => (
                <option key={value || "none"} value={value}>
                  {[meta.emoji, meta.label].filter(Boolean).join(" ")}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Liens
          <textarea
            value={form.linksText}
            onChange={(event) => updateField("linksText", event.target.value)}
            placeholder="Guide | https://..."
            rows={4}
          />
        </label>

        <label>
          Notes
          <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={3} />
        </label>

        <div className="editor-actions">
          <button type="button" className="button secondary" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="button primary">
            <Save aria-hidden="true" />
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

function TravelCard({
  node,
  level,
  countryTheme,
  countryIndex,
  draggedId,
  onAddChild,
  onDragEnd,
  onDragStart,
  onEdit,
  onDelete,
  onReorder,
}: {
  node: TravelNode;
  level: number;
  countryTheme?: CountryTheme;
  countryIndex: number;
  draggedId: string | null;
  onAddChild: (node: TravelNode) => void;
  onDragEnd: () => void;
  onDragStart: (nodeId: string) => void;
  onEdit: (node: TravelNode) => void;
  onDelete: (nodeId: string) => void;
  onReorder: (sourceId: string, targetId: string) => void;
}) {
  const [open, setOpen] = useState(() => node.status !== "done");
  const [isDragOver, setIsDragOver] = useState(false);
  const hasChildren = node.children.length > 0;
  const isCountry = level === 0;
  const theme = countryTheme ?? getCountryTheme(node, countryIndex);
  const nodeEmoji = getNodeEmoji(node, isCountry ? theme : undefined);
  const transportMeta = node.transport ? transportLabels[node.transport] : null;
  const style = {
    "--level": level,
    "--country-accent": theme.accent,
    "--country-accent-soft": theme.accentSoft,
    "--country-image": `url("${theme.image}")`,
  } as React.CSSProperties;

  return (
    <li className={`travel-item ${isCountry ? "country-item" : ""}`} style={style}>
      <article
        className={`travel-card status-${node.status} ${isCountry ? "country-card" : ""} ${draggedId === node.id ? "is-dragging" : ""} ${isDragOver ? "is-drag-over" : ""}`}
        onDragEnter={() => {
          if (draggedId && draggedId !== node.id) {
            setIsDragOver(true);
          }
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDragOver={(event) => {
          if (draggedId && draggedId !== node.id) {
            event.preventDefault();
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          const sourceId = event.dataTransfer.getData("text/plain") || draggedId;

          if (sourceId && sourceId !== node.id) {
            onReorder(sourceId, node.id);
          }
        }}
      >
        {isCountry && (
          <div className="country-cover" aria-hidden="true">
            <span>{theme.flag}</span>
          </div>
        )}
        <button
          className="drag-handle"
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", node.id);
            onDragStart(node.id);
          }}
          onDragEnd={() => {
            setIsDragOver(false);
            onDragEnd();
          }}
          aria-label={`Déplacer ${node.title}`}
          title="Déplacer"
        >
          <GripVertical aria-hidden="true" />
        </button>
        <button
          className="expand-button"
          type="button"
          onClick={() => setOpen((current) => !current)}
          disabled={!hasChildren}
          aria-label={open ? "Replier" : "Déplier"}
        >
          {hasChildren ? open ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" /> : <span />}
        </button>

        <div className="travel-main">
          {isCountry && (
            <div className="country-kicker">
              <span>{theme.flag}</span>
              <p>{theme.label}</p>
            </div>
          )}
          <div className="title-row">
            {nodeEmoji && <span className="node-emoji" aria-hidden="true">{nodeEmoji}</span>}
            {node.transport && <span className="transport-mark">{transportIcon(node.transport)}</span>}
            <h3>{node.title}</h3>
            <span className="status-pill">
              <span aria-hidden="true">{statusLabels[node.status].emoji}</span>
              {statusLabels[node.status].label}
            </span>
          </div>

          <div className="meta-row">
            {transportMeta && (
              <span className="transport-chip">
                <span aria-hidden="true">{transportMeta.emoji}</span>
                {transportMeta.label}
              </span>
            )}
            {node.duration && (
              <span>
                <CalendarDays aria-hidden="true" />
                {node.duration}
              </span>
            )}
            {node.budget && (
              <span>
                <WalletCards aria-hidden="true" />
                {node.budget}
              </span>
            )}
            {node.time && (
              <span>
                <Clock3 aria-hidden="true" />
                {node.time}
              </span>
            )}
            {node.provider && <span className="provider">{node.provider}</span>}
          </div>

          {node.notes && <p className="notes">{node.notes}</p>}

          {(node.links?.length ?? 0) > 0 && (
            <div className="links-row">
              {node.links?.map((link) => (
                <a href={link.url} key={`${node.id}-${link.url}`} target="_blank" rel="noreferrer">
                  <Link2 aria-hidden="true" />
                  {link.label}
                  <ExternalLink aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="card-actions">
          <button className="icon-button" type="button" onClick={() => onAddChild(node)} aria-label={`Ajouter sous ${node.title}`}>
            <Plus aria-hidden="true" />
          </button>
          <button className="icon-button" type="button" onClick={() => onEdit(node)} aria-label={`Modifier ${node.title}`}>
            <Edit3 aria-hidden="true" />
          </button>
          <button className="icon-button danger" type="button" onClick={() => onDelete(node.id)} aria-label={`Supprimer ${node.title}`}>
            <Trash2 aria-hidden="true" />
          </button>
        </div>
      </article>

      {hasChildren && open && (
        <ol className="travel-list nested">
          {node.children.map((child) => (
            <TravelCard
              key={child.id}
              node={child}
              level={level + 1}
              countryTheme={theme}
              countryIndex={countryIndex}
              draggedId={draggedId}
              onAddChild={onAddChild}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              onEdit={onEdit}
              onDelete={onDelete}
              onReorder={onReorder}
            />
          ))}
        </ol>
      )}
    </li>
  );
}

function MapView({
  items,
  onAddChild,
  onEdit,
}: {
  items: TravelNode[];
  onAddChild: (node: TravelNode) => void;
  onEdit: (node: TravelNode) => void;
}) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const selectedCountry = items.find((item) => item.id === selectedId) ?? items[0];
  const selectedIndex = items.findIndex((item) => item.id === selectedCountry?.id);
  const selectedTheme = selectedCountry ? getCountryTheme(selectedCountry, Math.max(selectedIndex, 0)) : fallbackThemes[0];
  const markers: RealMapMarker[] = items.map((item, index) => {
    const theme = getCountryTheme(item, index);

    return {
      id: item.id,
      title: item.title,
      emoji: getNodeEmoji(item, theme),
      code: theme.code,
      accent: theme.accent,
      coordinates: countryCoordinates[item.id] ?? [-15 + index, -60 + index],
    };
  });

  return (
    <div className="map-view">
      <RealMap markers={markers} selectedId={selectedCountry?.id ?? ""} onSelect={setSelectedId} />

      {selectedCountry && (
        <aside
          className="map-detail"
          style={
            {
              "--country-accent": selectedTheme.accent,
              "--country-accent-soft": selectedTheme.accentSoft,
              "--country-image": `url("${selectedTheme.image}")`,
            } as React.CSSProperties
          }
        >
          <div className="map-detail-cover">
            <span>{getNodeEmoji(selectedCountry, selectedTheme)}</span>
          </div>
          <div className="map-detail-body">
            <p className="eyebrow">{selectedTheme.label}</p>
            <h3>{selectedCountry.title}</h3>
            <div className="meta-row">
              {selectedCountry.duration && (
                <span>
                  <CalendarDays aria-hidden="true" />
                  {selectedCountry.duration}
                </span>
              )}
              <span>
                <MapPin aria-hidden="true" />
                {selectedCountry.children.length} étapes
              </span>
              <span className="transport-chip">
                <span aria-hidden="true">{statusLabels[selectedCountry.status].emoji}</span>
                {statusLabels[selectedCountry.status].label}
              </span>
            </div>
            <div className="map-stop-list">
              {selectedCountry.children.slice(0, 6).map((child) => (
                <button key={child.id} className={`status-${child.status}`} type="button" onClick={() => onEdit(child)}>
                  <span>{getNodeEmoji(child) || transportLabels[child.transport ?? ""].emoji || "•"}</span>
                  {child.title}
                </button>
              ))}
            </div>
            <div className="map-detail-actions">
              <button className="button secondary" type="button" onClick={() => onEdit(selectedCountry)}>
                <Edit3 aria-hidden="true" />
                Modifier
              </button>
              <button className="button primary" type="button" onClick={() => onAddChild(selectedCountry)}>
                <Plus aria-hidden="true" />
                Ajouter étape
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

function ContinuousTimelineView({
  entries,
  onAddChild,
  onEdit,
  onDelete,
}: {
  entries: TimelineEntry[];
  onAddChild: (node: TravelNode) => void;
  onEdit: (node: TravelNode) => void;
  onDelete: (nodeId: string) => void;
}) {
  return (
    <ol className="continuous-timeline">
      {entries.map((entry, index) => {
        const { node, theme, depth } = entry;
        const transportMeta = node.transport ? transportLabels[node.transport] : null;
        const style = {
          "--country-accent": theme.accent,
          "--country-accent-soft": theme.accentSoft,
          "--depth": depth,
        } as React.CSSProperties;

        return (
          <li key={`${node.id}-${index}`} className={`frise-step depth-${Math.min(depth, 3)} status-${node.status}`} style={style}>
            <div className="frise-marker">
              <span>{depth === 0 ? getNodeEmoji(node, theme) : transportMeta?.emoji || getNodeEmoji(node) || index + 1}</span>
            </div>
            <article className="frise-card">
              <div className="frise-head">
                <div>
                  <p className="eyebrow">{depth === 0 ? "Pays" : entry.countryTitle}</p>
                  <h3>{node.title}</h3>
                </div>
                <span className="status-pill">
                  <span aria-hidden="true">{statusLabels[node.status].emoji}</span>
                  {statusLabels[node.status].label}
                </span>
              </div>

              <div className="meta-row">
                {transportMeta && (
                  <span className="transport-chip">
                    <span aria-hidden="true">{transportMeta.emoji}</span>
                    {transportMeta.label}
                  </span>
                )}
                {node.duration && (
                  <span>
                    <CalendarDays aria-hidden="true" />
                    {node.duration}
                  </span>
                )}
                {node.budget && (
                  <span>
                    <WalletCards aria-hidden="true" />
                    {node.budget}
                  </span>
                )}
                {node.time && (
                  <span>
                    <Clock3 aria-hidden="true" />
                    {node.time}
                  </span>
                )}
                {node.provider && <span className="provider">{node.provider}</span>}
              </div>

              {(node.links?.length ?? 0) > 0 && (
                <div className="links-row">
                  {node.links?.map((link) => (
                    <a href={link.url} key={`${node.id}-${link.url}`} target="_blank" rel="noreferrer">
                      <Link2 aria-hidden="true" />
                      {link.label}
                      <ExternalLink aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}

              <div className="frise-actions">
                <button className="icon-button" type="button" onClick={() => onAddChild(node)} aria-label={`Ajouter sous ${node.title}`}>
                  <Plus aria-hidden="true" />
                </button>
                <button className="icon-button" type="button" onClick={() => onEdit(node)} aria-label={`Modifier ${node.title}`}>
                  <Edit3 aria-hidden="true" />
                </button>
                <button className="icon-button danger" type="button" onClick={() => onDelete(node.id)} aria-label={`Supprimer ${node.title}`}>
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

function BlocksGridView({
  items,
  onAddChild,
  onEdit,
  onDelete,
  onReorder,
}: {
  items: TravelNode[];
  onAddChild: (node: TravelNode) => void;
  onEdit: (node: TravelNode) => void;
  onDelete: (nodeId: string) => void;
  onReorder: (sourceId: string, targetId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarDraggedId, setSidebarDraggedId] = useState<string | null>(null);
  const [sidebarDragOverId, setSidebarDragOverId] = useState<string | null>(null);
  const countryEntries = useMemo(
    () =>
      items.map((node, index) => ({
        node,
        depth: 0,
        countryTitle: node.title,
        countryIndex: index,
        theme: getCountryTheme(node, index),
      })),
    [items],
  );
  const allEntries = useMemo(() => flattenTimeline(items), [items]);
  const selectedEntry = selectedId ? allEntries.find((entry) => entry.node.id === selectedId) : undefined;

  function renderChildren(node: TravelNode, depth = 0) {
    if (node.children.length === 0) {
      return null;
    }

    return (
      <ol className="grid-child-tree" style={{ "--depth": depth } as React.CSSProperties}>
        {node.children.map((child) => {
          const transportMeta = child.transport ? transportLabels[child.transport] : null;
          const linkCount = countLinks(child);

          return (
            <li
              key={child.id}
              className={sidebarDragOverId === child.id ? "is-drag-over" : ""}
              onDragEnter={() => {
                if (sidebarDraggedId && sidebarDraggedId !== child.id) {
                  setSidebarDragOverId(child.id);
                }
              }}
              onDragLeave={() => setSidebarDragOverId(null)}
              onDragOver={(event) => {
                if (sidebarDraggedId && sidebarDraggedId !== child.id) {
                  event.preventDefault();
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                const sourceId = event.dataTransfer.getData("text/plain") || sidebarDraggedId;
                setSidebarDragOverId(null);
                setSidebarDraggedId(null);

                if (sourceId && sourceId !== child.id) {
                  onReorder(sourceId, child.id);
                }
              }}
            >
              <button type="button" className={`status-${child.status}`} onClick={() => setSelectedId(child.id)}>
                <span
                  className="sidebar-drag-handle"
                  draggable
                  onClick={(event) => event.stopPropagation()}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", child.id);
                    setSidebarDraggedId(child.id);
                  }}
                  onDragEnd={() => {
                    setSidebarDraggedId(null);
                    setSidebarDragOverId(null);
                  }}
                  aria-label={`Déplacer ${child.title}`}
                  role="button"
                  title="Déplacer"
                >
                  <GripVertical aria-hidden="true" />
                </span>
                <span>{getNodeEmoji(child) || transportMeta?.emoji || "•"}</span>
                <strong>{child.title}</strong>
                {child.duration && <small>{child.duration}</small>}
                {child.budget && <small>{child.budget}</small>}
                {linkCount > 0 && <small>{linkCount} lien{linkCount > 1 ? "s" : ""}</small>}
              </button>
              {renderChildren(child, depth + 1)}
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <>
      <div className="blocks-grid">
        {countryEntries.map((entry) => {
          const { node, theme } = entry;
          const budgetTotal = sumBudget(node);
          const durationCount = countDurations(node);
          const linkCount = countLinks(node);
          const style = {
            "--country-accent": theme.accent,
            "--country-accent-soft": theme.accentSoft,
          } as React.CSSProperties;

          return (
            <button
              key={`${entry.countryIndex}-${node.id}`}
              className={`grid-block-card status-${node.status} depth-0`}
              type="button"
              style={style}
              onClick={() => setSelectedId(node.id)}
            >
              <div className="grid-block-top">
                <span className="node-emoji" aria-hidden="true">
                  {getNodeEmoji(node, theme) || "📍"}
                </span>
                <span className="status-pill">
                  <span aria-hidden="true">{statusLabels[node.status].emoji}</span>
                  {statusLabels[node.status].label}
                </span>
              </div>
              <h3>{node.title}</h3>
              <p>{theme.label}</p>
              <div className="meta-row">
                {node.duration && (
                  <span>
                    <CalendarDays aria-hidden="true" />
                    {node.duration}
                  </span>
                )}
                <span>
                  <MapPin aria-hidden="true" />
                  {node.children.length} blocs
                </span>
                {budgetTotal > 0 && (
                  <span>
                    <WalletCards aria-hidden="true" />
                    {budgetTotal}€
                  </span>
                )}
                <span>
                  <CalendarDays aria-hidden="true" />
                  {node.duration ?? `${durationCount} durées`}
                </span>
                {linkCount > 0 && (
                  <span>
                    <Link2 aria-hidden="true" />
                    {linkCount} url{linkCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedEntry && (
        <div className="grid-detail-backdrop" role="presentation" onClick={() => setSelectedId(null)}>
          <aside
            className={`grid-detail-panel status-${selectedEntry.node.status}`}
            style={
              {
                "--country-accent": selectedEntry.theme.accent,
                "--country-accent-soft": selectedEntry.theme.accentSoft,
                "--country-image": `url("${selectedEntry.theme.image}")`,
              } as React.CSSProperties
            }
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid-detail-cover">
              <button className="icon-button ghost" type="button" onClick={() => setSelectedId(null)} aria-label="Fermer">
                <X aria-hidden="true" />
              </button>
              <span>{getNodeEmoji(selectedEntry.node, selectedEntry.depth === 0 ? selectedEntry.theme : undefined) || "📍"}</span>
            </div>
            <div className="grid-detail-content">
              <p className="eyebrow">{selectedEntry.depth === 0 ? "Pays" : selectedEntry.countryTitle}</p>
              <h2>{selectedEntry.node.title}</h2>
              <div className="meta-row">
                <span className="transport-chip">
                  <span aria-hidden="true">{statusLabels[selectedEntry.node.status].emoji}</span>
                  {statusLabels[selectedEntry.node.status].label}
                </span>
                {selectedEntry.node.transport && (
                  <span>
                    <span aria-hidden="true">{transportLabels[selectedEntry.node.transport].emoji}</span>
                    {transportLabels[selectedEntry.node.transport].label}
                  </span>
                )}
                {selectedEntry.node.duration && (
                  <span>
                    <CalendarDays aria-hidden="true" />
                    {selectedEntry.node.duration}
                  </span>
                )}
                {selectedEntry.node.budget && (
                  <span>
                    <WalletCards aria-hidden="true" />
                    {selectedEntry.node.budget}
                  </span>
                )}
                {selectedEntry.node.time && (
                  <span>
                    <Clock3 aria-hidden="true" />
                    {selectedEntry.node.time}
                  </span>
                )}
                {selectedEntry.node.provider && <span className="provider">{selectedEntry.node.provider}</span>}
              </div>

              {selectedEntry.node.notes && <p className="notes">{selectedEntry.node.notes}</p>}

              {(selectedEntry.node.links?.length ?? 0) > 0 && (
                <div className="links-row">
                  {selectedEntry.node.links?.map((link) => (
                    <a href={link.url} key={`${selectedEntry.node.id}-${link.url}`} target="_blank" rel="noreferrer">
                      <Link2 aria-hidden="true" />
                      {link.label}
                      <ExternalLink aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}

              {selectedEntry.node.children.length > 0 && (
                <div className="grid-child-list">
                  <p className="eyebrow">Sous-blocs</p>
                  {renderChildren(selectedEntry.node)}
                </div>
              )}

              <div className="grid-detail-actions">
                <button className="button secondary" type="button" onClick={() => onEdit(selectedEntry.node)}>
                  <Edit3 aria-hidden="true" />
                  Modifier
                </button>
                <button className="button secondary" type="button" onClick={() => onDelete(selectedEntry.node.id)}>
                  <Trash2 aria-hidden="true" />
                  Supprimer
                </button>
                <button className="button primary" type="button" onClick={() => onAddChild(selectedEntry.node)}>
                  <Plus aria-hidden="true" />
                  Ajouter sous-bloc
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default function Home() {
  const [items, setItems] = useState<TravelNode[]>(initialItinerary);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("detail");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) ?? legacyStorageKeys.map((key) => window.localStorage.getItem(key)).find(Boolean);

    if (saved) {
      try {
        const migratedItems = migrateItinerary(JSON.parse(saved) as TravelNode[]);
        // localStorage is the external source of truth after the first visit.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(migratedItems);
        window.localStorage.setItem(storageKey, JSON.stringify(migratedItems));
        legacyStorageKeys.forEach((key) => window.localStorage.removeItem(key));
      } catch {
        window.localStorage.removeItem(storageKey);
        legacyStorageKeys.forEach((key) => window.localStorage.removeItem(key));
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, loaded]);

  const flattened = useMemo(() => flattenNodes(items), [items]);
  const filteredItems = useMemo(() => filterNodes(items, query), [items, query]);
  const timelineEntries = useMemo(() => flattenTimeline(filteredItems), [filteredItems]);
  const totalBudget = useMemo(
    () =>
      flattened.reduce((sum, node) => {
        const firstAmount = node.budget?.match(/\d+/)?.[0];
        return sum + (firstAmount ? Number(firstAmount) : 0);
      }, 0),
    [flattened],
  );

  function handleSubmit(node: TravelNode, parentId: string | null, mode: EditorState["mode"]) {
    setItems((current) => (mode === "create" ? addNode(current, parentId, node) : updateNode(current, node)));
    setEditor(null);
  }

  function handleDelete(nodeId: string) {
    setItems((current) => deleteNode(current, nodeId));
  }

  function handleReorder(sourceId: string, targetId: string) {
    setItems((current) => reorderSiblingNodes(current, sourceId, targetId));
    setDraggedId(null);
  }

  function resetData() {
    setItems(initialItinerary);
    window.localStorage.removeItem(storageKey);
  }

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="brand-line">
            <Waves aria-hidden="true" />
            <span>Amsud Planner</span>
          </div>
          <h1>Voyage Amérique du Sud</h1>
          <p>Organise les pays, villes, activités, options et liens de ton itinéraire dans une arborescence modifiable.</p>
        </div>

        <div className="quick-stats" aria-label="Résumé de l'itinéraire">
          <div>
            <span>{items.length}</span>
            <p>pays / blocs</p>
          </div>
          <div>
            <span>{flattened.length}</span>
            <p>étapes</p>
          </div>
          <div>
            <span>{totalBudget}€</span>
            <p>budget repéré</p>
          </div>
        </div>
      </section>

      <section className="toolbar" aria-label="Actions de voyage">
        <div className="search-box">
          <Search aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une étape, un pays, GYG..." />
        </div>

        <div className="toolbar-actions">
          <div className="view-switch" role="tablist" aria-label="Changer de vue">
            {[
              { value: "detail", label: "Détail" },
              { value: "map", label: "Carte" },
              { value: "frise", label: "Frise" },
              { value: "grid", label: "Grille" },
            ].map((view) => (
              <button
                key={view.value}
                type="button"
                role="tab"
                aria-selected={viewMode === view.value}
                className={viewMode === view.value ? "active" : ""}
                onClick={() => setViewMode(view.value as ViewMode)}
              >
                {view.label}
              </button>
            ))}
          </div>
          <button className="button secondary" type="button" onClick={resetData}>
            <RotateCcw aria-hidden="true" />
            Réinitialiser
          </button>
          <button className="button primary" type="button" onClick={() => setEditor({ mode: "create", parentId: null })}>
            <Plus aria-hidden="true" />
            Ajouter un pays
          </button>
        </div>
      </section>

      {viewMode === "frise" ? (
        <section className="timeline-panel wide-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Frise continue</p>
              <h2>{query ? "Résultats filtrés" : "Ligne de voyage"}</h2>
            </div>
            <span>{timelineEntries.length} étapes</span>
          </div>
          <ContinuousTimelineView
            entries={timelineEntries}
            onAddChild={(node) => setEditor({ mode: "create", parentId: node.id })}
            onEdit={(node) => setEditor({ mode: "edit", parentId: null, node })}
            onDelete={handleDelete}
          />
        </section>
      ) : viewMode === "grid" ? (
        <section className="timeline-panel wide-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Grille des blocs</p>
              <h2>{query ? "Résultats filtrés" : "Tous les blocs"}</h2>
            </div>
            <span>{filteredItems.length} pays</span>
          </div>
          <BlocksGridView
            items={filteredItems}
            onAddChild={(node) => setEditor({ mode: "create", parentId: node.id })}
            onEdit={(node) => setEditor({ mode: "edit", parentId: null, node })}
            onDelete={handleDelete}
            onReorder={handleReorder}
          />
        </section>
      ) : viewMode === "map" ? (
        <section className="timeline-panel wide-panel map-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Carte du parcours</p>
              <h2>{query ? "Résultats filtrés" : "Vue géographique"}</h2>
            </div>
            <span>{filteredItems.length} blocs</span>
          </div>
          <MapView
            items={filteredItems}
            onAddChild={(node) => setEditor({ mode: "create", parentId: node.id })}
            onEdit={(node) => setEditor({ mode: "edit", parentId: null, node })}
          />
        </section>
      ) : (
        <section className="planner-layout">
          <aside className="side-panel">
            <p className="eyebrow">Vue rapide</p>
            <h2>Priorités</h2>
            <div className="status-stack">
              {Object.entries(statusLabels).map(([status, label]) => {
                const count = flattened.filter((node) => node.status === status).length;
                const meta = statusLabels[status as TravelStatus];

                return (
                  <div key={status}>
                    <span className={`dot status-${status}`} />
                    <strong>{count}</strong>
                    <p>
                      <span aria-hidden="true">{meta.emoji}</span> {label.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="tip-box">
              <Check aria-hidden="true" />
              <p>Chaque étape peut contenir autant de sous-étapes que nécessaire.</p>
            </div>
          </aside>

          <section className="timeline-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Itinéraire actuel</p>
                <h2>{query ? "Résultats filtrés" : "Plan complet"}</h2>
              </div>
              <span>{filteredItems.length} blocs</span>
            </div>

            {viewMode === "detail" && (
              <ol className="travel-list">
                {filteredItems.map((item, index) => (
                  <TravelCard
                    key={item.id}
                    node={item}
                    level={0}
                    countryTheme={getCountryTheme(item, index)}
                    countryIndex={index}
                    draggedId={draggedId}
                    onAddChild={(node) => setEditor({ mode: "create", parentId: node.id })}
                    onDragEnd={() => setDraggedId(null)}
                    onDragStart={setDraggedId}
                    onEdit={(node) => setEditor({ mode: "edit", parentId: null, node })}
                    onDelete={handleDelete}
                    onReorder={handleReorder}
                  />
                ))}
              </ol>
            )}

          </section>
        </section>
      )}

      {editor && (
        <NodeEditor
          key={`${editor.mode}-${editor.node?.id ?? editor.parentId ?? "root"}`}
          state={editor}
          onCancel={() => setEditor(null)}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  );
}
