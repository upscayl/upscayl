import {
  motion,
  useAnimation,
  type Transition,
  type Variants,
} from "motion/react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";
import {
  ArrowDownWideNarrowIcon as StaticArrowDownWideNarrowIcon,
  ArrowUpNarrowWideIcon as StaticArrowUpNarrowWideIcon,
  CommandIcon as StaticCommandIcon,
  CopyCheckIcon as StaticCopyCheckIcon,
  CopyIcon as StaticCopyIcon,
  CpuIcon as StaticCpuIcon,
  EraserIcon as StaticEraserIcon,
  ExternalLinkIcon as StaticExternalLinkIcon,
  FolderSearchIcon as StaticFolderSearchIcon,
  HistoryIcon as StaticHistoryIcon,
  HomeIcon as StaticHomeIcon,
  ImageIcon as StaticImageIcon,
  ImageOffIcon as StaticImageOffIcon,
  ImagesIcon as StaticImagesIcon,
  LayoutGridIcon as StaticLayoutGridIcon,
  MonitorCogIcon as StaticMonitorCogIcon,
  PaletteIcon as StaticPaletteIcon,
  ScrollTextIcon as StaticScrollTextIcon,
  SearchIcon as StaticSearchIcon,
  SettingsIcon as StaticSettingsIcon,
  SparklesIcon as StaticSparklesIcon,
  Trash2Icon as StaticTrash2Icon,
  UploadIcon as StaticUploadIcon,
  XIcon as StaticXIcon,
  ZoomInIcon as StaticZoomInIcon,
  CircleHelpIcon as LucideHelp,
  type LucideIcon,
} from "lucide-react";
import { useAtomValue } from "jotai";

import { reduceAnimationsAtom } from "@/atoms/user-settings-atom";

import { cn } from "@/lib/utils";

/**
 * Animated icons. A parent (usually a button) plays the animation on hover
 * through the ref handle. Size comes from `className`, e.g. "size-5".
 */
export type AnimatedIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

export type AnimatedIconProps = { className?: string };

export type AnimatedIcon = React.ForwardRefExoticComponent<
  AnimatedIconProps & React.RefAttributes<AnimatedIconHandle>
>;

/** Ref + handlers that play an icon's animation while its button is hovered/focused. */
export function useIconHover() {
  const ref = useRef<AnimatedIconHandle>(null);
  return {
    ref,
    hoverProps: {
      onMouseEnter: () => ref.current?.startAnimation(),
      onMouseLeave: () => ref.current?.stopAnimation(),
    },
  };
}

export function useIconActive(delay = 200) {
  const ref = useRef<AnimatedIconHandle>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    ref,
    activeProps: {
      onFocus: () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          ref.current?.startAnimation();
          timeoutRef.current = undefined;
        }, delay);
      },
      onBlur: () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
        ref.current?.stopAnimation();
      },
    },
  };
}

// Rotate/scale around the middle of the shape instead of the SVG origin.
const centered = {
  transformBox: "fill-box",
  transformOrigin: "center",
} as const;

/** Ref handle; a no-op while animations are reduced (nothing is mounted). */
const controlsHandle = (
  controls: ReturnType<typeof useAnimation>,
  reduced: boolean,
): AnimatedIconHandle => ({
  startAnimation: () => {
    if (!reduced) controls.start("animate");
  },
  stopAnimation: () => {
    if (!reduced) controls.start("normal");
  },
});

/** Icon drawn as SVG with individually animated parts. */
function createSvgIcon(
  displayName: string,
  render: (controls: ReturnType<typeof useAnimation>) => ReactNode,
  StaticIcon: LucideIcon,
) {
  const Icon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
    ({ className }, ref) => {
      const controls = useAnimation();
      const reduced = useAtomValue(reduceAnimationsAtom);

      useImperativeHandle(ref, () => controlsHandle(controls, reduced), [
        controls,
        reduced,
      ]);

      // "Reduce animations" setting: show the plain lucide icon instead.
      if (reduced) {
        return <StaticIcon className={cn("shrink-0", className)} />;
      }

      return (
        <span className={cn("inline-flex shrink-0", className)}>
          <svg
            className="size-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ overflow: "visible" }}
          >
            {render(controls)}
          </svg>
        </span>
      );
    },
  );
  Icon.displayName = displayName;
  return Icon;
}

/** Lucide icon animated as a whole. */
function createLucideAnimatedIcon(
  displayName: string,
  LucideSvg: LucideIcon,
  variants: Variants,
) {
  const Icon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
    ({ className }, ref) => {
      const controls = useAnimation();
      const reduced = useAtomValue(reduceAnimationsAtom);

      useImperativeHandle(ref, () => controlsHandle(controls, reduced), [
        controls,
        reduced,
      ]);

      if (reduced) {
        return <LucideSvg className={cn("shrink-0", className)} />;
      }

      return (
        <motion.span
          className="inline-flex shrink-0"
          animate={controls}
          variants={variants}
        >
          <LucideSvg className={className} />
        </motion.span>
      );
    },
  );
  Icon.displayName = displayName;
  return Icon;
}

/* -------------------------------------------------------------------------- */
/* SVG icons with per-part animation                                          */
/* -------------------------------------------------------------------------- */

const DRAW: Variants = {
  normal: { pathLength: 1, opacity: 1 },
  animate: { opacity: [0, 1], pathLength: [0, 1] },
};

export const HomeIcon = createSvgIcon(
  "HomeIcon",
  (controls) => (
    <>
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <motion.path
        animate={controls}
        d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"
        transition={{ duration: 0.6, opacity: { duration: 0.2 } }}
        variants={DRAW}
      />
    </>
  ),
  StaticHomeIcon,
);

export const SettingsIcon = createSvgIcon(
  "SettingsIcon",
  (controls) => (
    <motion.g
      animate={controls}
      style={centered}
      transition={{ type: "spring", stiffness: 50, damping: 10 }}
      variants={{ normal: { rotate: 0 }, animate: { rotate: 180 } }}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </motion.g>
  ),
  StaticSettingsIcon,
);

const HISTORY_ARROW: Variants = {
  normal: { rotate: "0deg" },
  animate: { rotate: "-50deg" },
};
const HISTORY_HAND: Variants = {
  normal: { rotate: 0, originX: "0%", originY: "100%" },
  animate: { rotate: -360, originX: "0%", originY: "100%" },
};
const HISTORY_MINUTE_HAND: Variants = {
  normal: { rotate: 0, originX: "0%", originY: "0%" },
  animate: { rotate: -45, originX: "0%", originY: "0%" },
};

export const HistoryIcon = createSvgIcon(
  "HistoryIcon",
  (controls) => (
    <>
      <motion.g
        animate={controls}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
        variants={HISTORY_ARROW}
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </motion.g>
      <motion.line
        animate={controls}
        initial="normal"
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        variants={HISTORY_HAND}
        x1="12"
        x2="12"
        y1="12"
        y2="7"
      />
      <motion.line
        animate={controls}
        initial="normal"
        transition={{ duration: 0.5, ease: "easeInOut" }}
        variants={HISTORY_MINUTE_HAND}
        x1="12"
        x2="16"
        y1="12"
        y2="14"
      />
    </>
  ),
  StaticHistoryIcon,
);

const PALETTE_DASH_LENGTH = 70;
const PALETTE_DRAW_DURATION = 0.45;
const PALETTE_DOT_STAGGER = 0.08;
const PALETTE_DOTS = [
  { cx: 6.5, cy: 12.5 },
  { cx: 8.5, cy: 7.5 },
  { cx: 13.5, cy: 6.5 },
  { cx: 17.5, cy: 10.5 },
];

const PALETTE_OUTLINE: Variants = {
  normal: { strokeDashoffset: 0 },
  animate: {
    strokeDashoffset: [PALETTE_DASH_LENGTH, 0],
    transition: { duration: PALETTE_DRAW_DURATION, ease: [0.65, 0, 0.35, 1] },
  },
};
const PALETTE_DOTS_GROUP: Variants = {
  normal: {},
  animate: {
    transition: {
      delayChildren: PALETTE_DRAW_DURATION,
      staggerChildren: PALETTE_DOT_STAGGER,
    },
  },
};
const PALETTE_DOT: Variants = {
  normal: { scale: 1, transition: { duration: 0.2 } },
  animate: {
    scale: [0, 1],
    transition: { type: "spring", stiffness: 300, damping: 10 },
  },
};

export const PaletteIcon = createSvgIcon(
  "PaletteIcon",
  (controls) => (
    <>
      <motion.path
        animate={controls}
        d="M12 2a1 1 0 0 0 0 20l.25 0a1.75 1.75 0 0 0 1.4-2.8l-.3-.4a1.75 1.75 0 0 1 1.4-2.8h2.25a5 5 0 0 0 5-5 10 9 0 0 0-10-9z"
        initial="normal"
        strokeDasharray={PALETTE_DASH_LENGTH}
        variants={PALETTE_OUTLINE}
      />
      <motion.g
        animate={controls}
        initial="normal"
        variants={PALETTE_DOTS_GROUP}
      >
        {PALETTE_DOTS.map((dot) => (
          <motion.circle
            cx={dot.cx}
            cy={dot.cy}
            fill="currentColor"
            key={`${dot.cx}-${dot.cy}`}
            r=".5"
            style={centered}
            variants={PALETTE_DOT}
          />
        ))}
      </motion.g>
    </>
  ),
  StaticPaletteIcon,
);

const CPU_Y: Variants = {
  normal: { scaleY: 1, opacity: 1 },
  animate: { scaleY: [1, 2, 1], opacity: [1, 0.4, 1] },
};
const CPU_X: Variants = {
  normal: { scaleX: 1, opacity: 1 },
  animate: { scaleX: [1, 2, 1], opacity: [1, 0.4, 1] },
};
const CPU_PINS = [
  { d: "M9 2v2", variants: CPU_Y },
  { d: "M15 2v2", variants: CPU_Y },
  { d: "M20 9h2", variants: CPU_X },
  { d: "M20 15h2", variants: CPU_X },
  { d: "M15 20v2", variants: CPU_Y },
  { d: "M9 20v2", variants: CPU_Y },
  { d: "M2 15h2", variants: CPU_X },
  { d: "M2 9h2", variants: CPU_X },
];

export const CpuIcon = createSvgIcon(
  "CpuIcon",
  (controls) => (
    <>
      <motion.rect
        animate={controls}
        height="16"
        rx="2"
        style={centered}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        variants={{
          normal: { scale: 1 },
          animate: { scale: [1, 1.08, 1] },
        }}
        width="16"
        x="4"
        y="4"
      />
      <motion.rect
        animate={controls}
        fill="currentColor"
        height="6"
        rx="1"
        style={centered}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        variants={{
          normal: { scale: 1, fillOpacity: 0, rotate: 0 },
          animate: {
            scale: [1, 0.6, 1.3, 1],
            fillOpacity: [0, 0.8, 0.5, 0],
            rotate: [0, 0, 90, 90],
          },
        }}
        width="6"
        x="9"
        y="9"
      />
      {CPU_PINS.map((pin, i) => (
        <motion.path
          animate={controls}
          d={pin.d}
          key={pin.d}
          style={centered}
          transition={{
            duration: 0.35,
            ease: "easeInOut",
            repeat: 2,
            delay: i * 0.05,
          }}
          variants={pin.variants}
        />
      ))}
    </>
  ),
  StaticCpuIcon,
);

const MONITOR_SCREEN: Variants = {
  normal: { rotate: 0 },
  animate: {
    rotate: [0, -5, 4, -2, 0],
    transition: { duration: 0.7, ease: "easeInOut" },
  },
};
const MONITOR_COG: Variants = {
  normal: { rotate: 0, transition: { duration: 0 } },
  animate: {
    rotate: [0, 360],
    transition: { duration: 0.9, ease: "easeInOut" },
  },
};

export const MonitorCogIcon = createSvgIcon(
  "MonitorCogIcon",
  (controls) => (
    <>
      <motion.g
        variants={MONITOR_SCREEN}
        initial="normal"
        animate={controls}
        style={{ transformBox: "view-box", originX: "12px", originY: "17px" }}
      >
        <path d="M22 13v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
        <motion.g
          variants={MONITOR_COG}
          style={{ transformBox: "view-box", originX: "18px", originY: "6px" }}
        >
          <circle cx="18" cy="6" r="3" />
          <path d="m14.305 7.53.923-.382" />
          <path d="m15.228 4.852-.923-.383" />
          <path d="m16.852 3.228-.383-.924" />
          <path d="m16.852 8.772-.383.923" />
          <path d="m19.148 3.228.383-.924" />
          <path d="m19.53 9.696-.382-.924" />
          <path d="m20.772 4.852.924-.383" />
          <path d="m20.772 7.148.924.383" />
        </motion.g>
      </motion.g>
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </>
  ),
  StaticMonitorCogIcon,
);

/* -------------------------------------------------------------------------- */
/* Action icons                                                               */
/* -------------------------------------------------------------------------- */

export const SearchIcon = createSvgIcon(
  "SearchIcon",
  (controls) => (
    <motion.g
      animate={controls}
      transition={{ duration: 1, bounce: 0.3 }}
      variants={{
        normal: { x: 0, y: 0 },
        animate: { x: [0, 0, -3, 0], y: [0, -4, 0, 0] },
      }}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.g>
  ),
  StaticSearchIcon,
);

export const UploadIcon = createSvgIcon(
  "UploadIcon",
  (controls) => (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <motion.g
        animate={controls}
        variants={{
          normal: { y: 0 },
          animate: {
            y: -2,
            transition: {
              type: "spring",
              stiffness: 200,
              damping: 10,
              mass: 1,
            },
          },
        }}
      >
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
      </motion.g>
    </>
  ),
  StaticUploadIcon,
);

const FOLDERS_TRANSITION: Transition = {
  type: "spring",
  stiffness: 250,
  damping: 25,
};

export const FoldersIcon = createSvgIcon(
  "FoldersIcon",
  (controls) => (
    <>
      <motion.g
        animate={controls}
        transition={FOLDERS_TRANSITION}
        variants={{
          normal: { x: 0, y: 0 },
          animate: { x: -2, y: 2 },
        }}
      >
        <rect width="16" height="16" x="6" y="2" rx="2" />
        <circle cx="12" cy="8" r="2" />
        <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
      </motion.g>
      <motion.path
        animate={controls}
        d="M18 22H4a2 2 0 0 1-2-2V6"
        transition={FOLDERS_TRANSITION}
        variants={{
          normal: { x: 0, y: 0, opacity: 1, scale: 1 },
          animate: { x: 2, y: -2, opacity: 0, scale: 0.9 },
        }}
      />
    </>
  ),
  StaticImagesIcon,
);

const layoutGridTile = (delay: number): Variants => ({
  normal: { scale: 1 },
  animate: {
    scale: [1, 1.22, 0.96, 1],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      times: [0, 0.35, 0.7, 1],
      delay,
    },
  },
});
const LAYOUT_GRID_TILES = [
  { x: 3, y: 3, delay: 0 },
  { x: 14, y: 3, delay: 0.08 },
  { x: 14, y: 14, delay: 0.16 },
  { x: 3, y: 14, delay: 0.24 },
];

export const LayoutGridIcon = createSvgIcon(
  "LayoutGridIcon",
  (controls) => (
    <>
      {LAYOUT_GRID_TILES.map((tile) => (
        <motion.rect
          animate={controls}
          height="7"
          initial="normal"
          key={`${tile.x}-${tile.y}`}
          rx="1"
          style={{
            transformBox: "view-box",
            originX: `${tile.x + 3.5}px`,
            originY: `${tile.y + 3.5}px`,
          }}
          variants={layoutGridTile(tile.delay)}
          width="7"
          x={tile.x}
          y={tile.y}
        />
      ))}
    </>
  ),
  StaticLayoutGridIcon,
);

const SEARCH_LENS: Variants = {
  normal: { scale: 1 },
  animate: {
    scale: [1, 1.06, 0.97, 1],
    transition: { duration: 0.6, ease: "easeInOut", times: [0, 0.35, 0.7, 1] },
  },
};
const SEARCH_PLUS: Variants = {
  normal: { rotate: 0, scale: 1, transition: { duration: 0 } },
  animate: {
    rotate: [0, 90],
    scale: [1, 1.2, 1],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};
const searchOrigin = {
  transformBox: "view-box",
  originX: "11px",
  originY: "11px",
} as const;

export const SearchPlusIcon = createSvgIcon(
  "SearchPlusIcon",
  (controls) => (
    <motion.g
      animate={controls}
      initial="normal"
      style={searchOrigin}
      variants={SEARCH_LENS}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
      <motion.g style={searchOrigin} variants={SEARCH_PLUS}>
        <path d="M11 8v6" />
        <path d="M8 11h6" />
      </motion.g>
    </motion.g>
  ),
  StaticZoomInIcon,
);

const ERASER_SCRUB: Variants = {
  normal: { x: 0, rotate: 0 },
  animate: {
    x: [0, -1.5, 1.5, -1.5, 0],
    rotate: [0, -4, 4, -4, 0],
    transition: { duration: 0.7, ease: "easeInOut" },
  },
};

export const EraserIcon = createSvgIcon(
  "EraserIcon",
  (controls) => (
    <motion.g
      animate={controls}
      initial="normal"
      style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}
      variants={ERASER_SCRUB}
    >
      <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
      <path d="m5.082 11.09 8.828 8.828" />
    </motion.g>
  ),
  StaticEraserIcon,
);

const OPEN_BOX: Variants = {
  normal: { scale: 1 },
  animate: {
    scale: [1, 0.97, 1.02, 1],
    transition: { duration: 0.6, ease: "easeInOut", times: [0, 0.35, 0.7, 1] },
  },
};
const OPEN_ARROW: Variants = {
  normal: { x: 0, y: 0 },
  animate: {
    x: [0, 1.75, -0.4, 0],
    y: [0, -1.75, 0.4, 0],
    transition: { duration: 0.6, ease: "easeInOut", times: [0, 0.35, 0.7, 1] },
  },
};

export const SquareArrowOutUpRightIcon = createSvgIcon(
  "SquareArrowOutUpRightIcon",
  (controls) => (
    <>
      <motion.path
        animate={controls}
        d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"
        initial="normal"
        style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}
        variants={OPEN_BOX}
      />
      <motion.g animate={controls} initial="normal" variants={OPEN_ARROW}>
        <path d="m21 3-9 9" />
        <path d="M15 3h6v6" />
      </motion.g>
    </>
  ),
  StaticExternalLinkIcon,
);

const FOLDER_SEARCH_FOLDER: Variants = {
  normal: { y: 0 },
  animate: {
    y: [0, -1.2, 0.4, 0],
    transition: { duration: 0.6, ease: "easeInOut", times: [0, 0.35, 0.7, 1] },
  },
};
const FOLDER_SEARCH_LENS: Variants = {
  normal: { x: 0, y: 0 },
  animate: {
    x: [0, -1.4, -0.4, 0.7, 0],
    y: [0, 0.3, -1.3, -0.4, 0],
    transition: { duration: 0.8, ease: "easeInOut" },
  },
};

export const FolderSearchIcon = createSvgIcon(
  "FolderSearchIcon",
  (controls) => (
    <>
      <motion.path
        animate={controls}
        d="M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1"
        initial="normal"
        variants={FOLDER_SEARCH_FOLDER}
      />
      <motion.g
        animate={controls}
        initial="normal"
        variants={FOLDER_SEARCH_LENS}
      >
        <path d="m21 21-1.9-1.9" />
        <circle cx="17" cy="17" r="3" />
      </motion.g>
    </>
  ),
  StaticFolderSearchIcon,
);

const TRASH_BIN: Variants = {
  normal: { scaleY: 1, y: 0 },
  animate: {
    y: [0, 0, 1, 0],
    scaleY: [1, 1, 0.94, 1],
    transition: { duration: 0.9, times: [0, 0.55, 0.75, 1], ease: "easeOut" },
  },
};
const TRASH_LID: Variants = {
  normal: { rotate: 0 },
  animate: {
    rotate: [0, -24, -24, 0],
    transition: { duration: 0.9, times: [0, 0.2, 0.55, 1], ease: "easeInOut" },
  },
};

export const TrashIcon = createSvgIcon(
  "TrashIcon",
  (controls) => (
    <>
      <motion.path
        animate={controls}
        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
        initial="normal"
        style={{ transformBox: "view-box", originX: "12px", originY: "22px" }}
        variants={TRASH_BIN}
      />
      <motion.g
        animate={controls}
        initial="normal"
        style={{ transformBox: "view-box", originX: "3px", originY: "6px" }}
        variants={TRASH_LID}
      >
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </motion.g>
    </>
  ),
  StaticXIcon,
);

const SORT_ROW = (delay: number): Variants => ({
  normal: { scaleX: 1 },
  animate: {
    scaleX: [1, 0.6, 1],
    transition: { duration: 0.55, ease: "easeInOut", delay },
  },
});
const sortArrow = (travel: number): Variants => ({
  normal: { y: 0 },
  animate: {
    y: [0, travel, -travel / 4, 0],
    transition: { duration: 0.6, ease: "easeInOut", times: [0, 0.35, 0.7, 1] },
  },
});
const SORT_DOWN_ARROW = sortArrow(2);
const SORT_UP_ARROW = sortArrow(-2);
const sortRowStyle = (y: number) => ({
  transformBox: "view-box" as const,
  originX: "11px",
  originY: `${y}px`,
});

export const ArrowDownWideNarrowIcon = createSvgIcon(
  "ArrowDownWideNarrowIcon",
  (controls) => (
    <>
      <motion.g animate={controls} initial="normal" variants={SORT_DOWN_ARROW}>
        <path d="m3 16 4 4 4-4" />
        <path d="M7 20V4" />
      </motion.g>
      {[
        { d: "M11 4h10", y: 4, delay: 0 },
        { d: "M11 8h7", y: 8, delay: 0.1 },
        { d: "M11 12h4", y: 12, delay: 0.2 },
      ].map((row) => (
        <motion.path
          animate={controls}
          d={row.d}
          initial="normal"
          key={row.d}
          style={sortRowStyle(row.y)}
          variants={SORT_ROW(row.delay)}
        />
      ))}
    </>
  ),
  StaticArrowDownWideNarrowIcon,
);

export const ArrowUpNarrowWideIcon = createSvgIcon(
  "ArrowUpNarrowWideIcon",
  (controls) => (
    <>
      <motion.g animate={controls} initial="normal" variants={SORT_UP_ARROW}>
        <path d="m3 8 4-4 4 4" />
        <path d="M7 4v16" />
      </motion.g>
      {[
        { d: "M11 12h4", y: 12, delay: 0.2 },
        { d: "M11 16h7", y: 16, delay: 0.1 },
        { d: "M11 20h10", y: 20, delay: 0 },
      ].map((row) => (
        <motion.path
          animate={controls}
          d={row.d}
          initial="normal"
          key={row.d}
          style={sortRowStyle(row.y)}
          variants={SORT_ROW(row.delay)}
        />
      ))}
    </>
  ),
  StaticArrowUpNarrowWideIcon,
);

const TRASH_BARS: Variants = {
  normal: { y: 0, opacity: 1 },
  animate: {
    y: [0, 5, 5, 0],
    opacity: [1, 0, 0, 1],
    transition: { duration: 0.9, times: [0, 0.35, 0.6, 1], ease: "easeInOut" },
  },
};

export const Trash2Icon = createSvgIcon(
  "Trash2Icon",
  (controls) => (
    <>
      {["M10 11v6", "M14 11v6"].map((d) => (
        <motion.path
          animate={controls}
          d={d}
          initial="normal"
          key={d}
          variants={TRASH_BARS}
        />
      ))}
      <motion.path
        animate={controls}
        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
        initial="normal"
        style={{ transformBox: "view-box", originX: "12px", originY: "22px" }}
        variants={TRASH_BIN}
      />
      <motion.g
        animate={controls}
        initial="normal"
        style={{ transformBox: "view-box", originX: "3px", originY: "6px" }}
        variants={TRASH_LID}
      >
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </motion.g>
    </>
  ),
  StaticTrash2Icon,
);

const SPARKLE_VARIANTS: Variants = {
  initial: { y: 0, fill: "none" },
  hover: {
    y: [0, -1.5, 0, 0],
    scale: [1, 1.18, 1, 1],
    rotate: [0, 12, -8, 0],
    fill: "currentColor",
    transition: {
      duration: 1.2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.3,
    },
  },
};
const SPARKLE_STAR_VARIANTS: Variants = {
  initial: { opacity: 1, x: 0, y: 0 },
  blink: {
    opacity: [0, 1, 0, 0, 0, 0, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};
const SPARKLE_STARS = ["M20 3v4", "M22 5h-4", "M4 17v2", "M5 18H3"];

// Two animation tracks (sparkle fill + blinking stars), so not built by
// createSvgIcon.
export const SparklesIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ className }, ref) => {
    const sparkleControls = useAnimation();
    const starControls = useAnimation();
    const reduced = useAtomValue(reduceAnimationsAtom);

    useImperativeHandle(
      ref,
      () => ({
        startAnimation: () => {
          if (reduced) return;
          sparkleControls.start("hover");
          starControls.start("blink");
        },
        stopAnimation: () => {
          if (reduced) return;
          sparkleControls.start("initial");
          starControls.start("initial");
        },
      }),
      [sparkleControls, starControls, reduced],
    );

    if (reduced) {
      return <StaticSparklesIcon className={cn("shrink-0", className)} />;
    }

    return (
      <span className={cn("inline-flex shrink-0", className)}>
        <svg
          className="size-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            animate={sparkleControls}
            style={centered}
            d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
            variants={SPARKLE_VARIANTS}
          />
          {SPARKLE_STARS.map((d) => (
            <motion.path
              animate={starControls}
              d={d}
              key={d}
              variants={SPARKLE_STAR_VARIANTS}
            />
          ))}
        </svg>
      </span>
    );
  },
);
SparklesIcon.displayName = "SparklesIcon";

const FILE_TEXT_LINES = [
  { d: "M10 9H8", delay: 0.3 },
  { d: "M16 13H8", delay: 0.5 },
  { d: "M16 17H8", delay: 0.7 },
];

export const FileTextIcon = createSvgIcon(
  "FileTextIcon",
  (controls) => (
    <>
      <motion.g
        animate={controls}
        style={centered}
        transition={{ duration: 0.3, ease: "easeOut" }}
        variants={{ normal: { scale: 1 }, animate: { scale: 1.05 } }}
      >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      </motion.g>
      {FILE_TEXT_LINES.map((line) => (
        <motion.path
          animate={controls}
          d={line.d}
          key={line.d}
          variants={{
            normal: { pathLength: 1 },
            animate: {
              pathLength: [1, 0, 1],
              transition: { duration: 0.7, delay: line.delay },
            },
          }}
        />
      ))}
    </>
  ),
  StaticScrollTextIcon,
);

const COPY_SPRING: Transition = { type: "spring", stiffness: 300, damping: 14 };
const COPY_BACK_SHEET =
  "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2";
const COPY_TEXT_LINES = [
  { d: "M12 13h6", delay: 0.25 },
  { d: "M12 17h4", delay: 0.4 },
];

// Back sheet kicks away, front sheet pops forward, then text lines type in.
export const CopyIcon = createSvgIcon(
  "CopyIcon",
  (controls) => (
    <>
      <motion.path
        animate={controls}
        d={COPY_BACK_SHEET}
        transition={COPY_SPRING}
        variants={{
          normal: { x: 0, y: 0, opacity: 1 },
          animate: { x: -2.5, y: -2.5, opacity: 0.6 },
        }}
      />
      <motion.g
        animate={controls}
        style={centered}
        transition={COPY_SPRING}
        variants={{
          normal: { x: 0, y: 0, scale: 1, rotate: 0 },
          animate: {
            x: 1.5,
            y: 1.5,
            scale: [1, 1.18, 1.08],
            rotate: [0, -6, 0],
          },
        }}
      >
        <rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
      </motion.g>
      {COPY_TEXT_LINES.map((line) => (
        <motion.path
          animate={controls}
          d={line.d}
          key={line.d}
          variants={{
            normal: { pathLength: 0, opacity: 0, x: 0, y: 0 },
            animate: {
              pathLength: [0, 1],
              opacity: [0, 1],
              x: 1.5,
              y: 1.5,
              transition: { duration: 0.35, delay: line.delay },
            },
          }}
        />
      ))}
    </>
  ),
  StaticCopyIcon,
);

// Sheets lock together, front sheet pulses, check draws with a pop.
export const CopyCheckIcon = createSvgIcon(
  "CopyCheckIcon",
  (controls) => (
    <>
      <motion.g
        animate={controls}
        style={centered}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        variants={{
          normal: { scale: 1 },
          animate: { scale: [1, 1.2, 0.95, 1] },
        }}
      >
        <rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
        <path d={COPY_BACK_SHEET} />
      </motion.g>
      <motion.path
        animate={controls}
        d="m12 15 2 2 4-4"
        style={centered}
        variants={{
          normal: { pathLength: 1, opacity: 1, scale: 1 },
          animate: {
            pathLength: [0, 1],
            opacity: [0, 1],
            scale: [0.6, 1.4, 1],
            transition: { duration: 0.5, delay: 0.15 },
          },
        }}
      />
    </>
  ),
  StaticCopyCheckIcon,
);

/* -------------------------------------------------------------------------- */
/* Lucide icons animated as a whole                                           */
/* -------------------------------------------------------------------------- */

const SHAKE_TRANSITION: Transition = { duration: 0.5, ease: "easeInOut" };

const shake: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -10, 10, -10, 0], transition: SHAKE_TRANSITION },
};

const IMAGE_OFF_BODY: Variants = {
  normal: { opacity: 1 },
  animate: {
    opacity: [1, 0.4, 1],
    transition: { duration: 0.7, ease: "easeInOut" },
  },
};
const IMAGE_OFF_SLASH: Variants = {
  normal: { strokeDashoffset: 0 },
  animate: {
    strokeDashoffset: [29, 0],
    transition: { duration: 0.45, ease: "easeInOut", delay: 0.1 },
  },
};

export const ImageOffIcon = createSvgIcon(
  "ImageOffIcon",
  (controls) => (
    <>
      <motion.g variants={IMAGE_OFF_BODY} initial="normal" animate={controls}>
        <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
        <line x1="13.5" x2="6" y1="13.5" y2="21" />
        <line x1="18" x2="21" y1="12" y2="15" />
        <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" />
        <path d="M21 15V5a2 2 0 0 0-2-2H9" />
      </motion.g>
      <motion.line
        x1="2"
        x2="22"
        y1="2"
        y2="22"
        strokeDasharray="29"
        strokeDashoffset="0"
        variants={IMAGE_OFF_SLASH}
        initial="normal"
        animate={controls}
      />
    </>
  ),
  StaticImageOffIcon,
);
const IMAGE_SUN: Variants = {
  normal: { scale: 1 },
  animate: {
    scale: [1, 1.35, 0.9, 1],
    transition: { duration: 0.6, ease: "easeInOut", times: [0, 0.35, 0.7, 1] },
  },
};
const IMAGE_HILL: Variants = {
  normal: { scaleY: 1 },
  animate: {
    scaleY: [1, 1.15, 0.97, 1],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
      times: [0, 0.35, 0.7, 1],
      delay: 0.08,
    },
  },
};

export const ImageSettingsIcon = createSvgIcon(
  "ImageSettingsIcon",
  (controls) => (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <motion.circle
        cx="9"
        cy="9"
        r="2"
        variants={IMAGE_SUN}
        initial="normal"
        animate={controls}
        style={{ transformBox: "view-box", originX: "9px", originY: "9px" }}
      />
      <motion.path
        d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
        variants={IMAGE_HILL}
        initial="normal"
        animate={controls}
        style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}
      />
    </>
  ),
  StaticImageIcon,
);
export const HelpIcon = createLucideAnimatedIcon("HelpIcon", LucideHelp, shake);

const COMMAND_TIMES = [0, 0.4, 0.75, 1];
const commandLoop = (delay: number): Variants => ({
  normal: { scale: 1 },
  animate: {
    scale: [1, 1.2, 0.95, 1],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      times: COMMAND_TIMES,
      delay,
    },
  },
});
const COMMAND_CROSS: Variants = {
  normal: { scale: 1 },
  animate: {
    scale: [1, 0.88, 1.03, 1],
    transition: { duration: 0.5, ease: "easeInOut", times: COMMAND_TIMES },
  },
};
const commandStyle = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: `${x}px`,
  originY: `${y}px`,
});

export const CommandIcon = createSvgIcon(
  "CommandIcon",
  (controls) => (
    <>
      <motion.g
        variants={COMMAND_CROSS}
        initial="normal"
        animate={controls}
        style={commandStyle(12, 12)}
      >
        <path d="M15 6V18" />
        <path d="M18 15H6" />
        <path d="M9 18V6" />
        <path d="M6 9H18" />
      </motion.g>
      <motion.path
        d="M9 6A3 3 0 1 0 6 9"
        variants={commandLoop(0)}
        initial="normal"
        animate={controls}
        style={commandStyle(6, 6)}
      />
      <motion.path
        d="M18 9A3 3 0 1 0 15 6"
        variants={commandLoop(0.08)}
        initial="normal"
        animate={controls}
        style={commandStyle(18, 6)}
      />
      <motion.path
        d="M15 18A3 3 0 1 0 18 15"
        variants={commandLoop(0.16)}
        initial="normal"
        animate={controls}
        style={commandStyle(18, 18)}
      />
      <motion.path
        d="M6 15A3 3 0 1 0 9 18"
        variants={commandLoop(0.24)}
        initial="normal"
        animate={controls}
        style={commandStyle(6, 18)}
      />
    </>
  ),
  StaticCommandIcon,
);
