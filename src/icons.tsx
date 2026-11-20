const ICON_PROPS = {
  viewBox: "0 0 16 16",
  width: 16,
  height: 16,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export const TrashIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9h6.6L12 4M6.5 7v3.5M9.5 7v3.5" />
  </svg>
);

export const CheckIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M3 8.5l3.2 3.2L13 4.8" />
  </svg>
);

export const PlusIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M8 3v10M3 8h10" />
  </svg>
);

export const EditIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M11 2.5l2.5 2.5L5.5 13H3v-2.5zM9.5 4l2.5 2.5" />
  </svg>
);

export const SwapIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M2.5 5.5h10M10 3l2.5 2.5L10 8M13.5 10.5h-10M6 8l-2.5 2.5L6 13" />
  </svg>
);

export const CloseIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

export const RefreshIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M13 3.5v3h-3M13 6.5A5 5 0 1 0 13.3 9" />
  </svg>
);

export const ExitIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M6.5 2.5h-3v11h3M6 8h7.5M11 5.5L13.5 8 11 10.5" />
  </svg>
);
