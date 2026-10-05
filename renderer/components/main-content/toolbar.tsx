import {
  SearchIcon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  InfoIcon,
  MaximizeIcon,
  MinimizeIcon,
  ImagesIcon,
  ImageIcon,
  LayersIcon,
  TimerIcon,
  HistoryIcon,
  ChartNoAxesColumnIncreasingIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { userStatsAtom, viewTypeAtom } from "@/atoms/user-settings-atom";
import { useAtom, useAtomValue } from "jotai";
import { Separator } from "../ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { translationAtom } from "@/atoms/translations-atom";
import React from "react";
import CountUp from "../ui/count-up";
import { Badge } from "../ui/badge";

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

interface ToolBarProps {
  zoomAmount: string;
  setZoomAmount: (arg: any) => void;
  resetImagePaths: () => void;
  maximize: boolean;
  setMaximize: React.Dispatch<React.SetStateAction<boolean>>;
  hasImage: boolean;
  hasUpscayledImage: boolean;
}

export default function ToolBar({
  zoomAmount,
  setZoomAmount,
  resetImagePaths,
  maximize,
  setMaximize,
  hasImage,
  hasUpscayledImage,
}: ToolBarProps) {
  const t = useAtomValue(translationAtom);
  const userStats = useAtomValue(userStatsAtom);

  const [viewType, setViewType] = useAtom(viewTypeAtom);

  return (
    <div className="absolute right-0 bottom-0 left-0 z-20 flex items-center pb-8">
      <div className="mx-auto inline-flex items-center gap-2 rounded-4xl bg-background p-2 backdrop-blur-sm">
        <Button
          disabled={!hasUpscayledImage}
          variant={viewType === "lens" ? "default" : "secondary"}
          onClick={() => setViewType(viewType === "lens" ? "slider" : "lens")}
          size="icon"
        >
          <SearchIcon />
        </Button>
        <Separator orientation="vertical" className="h-6 w-px shrink-0" />
        <Button
          disabled={
            !hasImage || viewType === "lens" || parseInt(zoomAmount) === 100
          }
          variant="outline"
          size="icon"
          onClick={() =>
            setZoomAmount((prev: string) => Math.max(Number(prev) - 10, 100))
          }
        >
          <MinusIcon />
        </Button>
        <Button
          disabled={
            !hasImage || viewType === "lens" || parseInt(zoomAmount) === 1000
          }
          variant="outline"
          size="icon"
          onClick={() =>
            setZoomAmount((prev: string) => Math.min(Number(prev) + 10, 1000))
          }
        >
          <PlusIcon />
        </Button>
        <Separator orientation="vertical" className="h-6 w-px shrink-0" />
        <Button
          disabled={!hasImage}
          variant="outline"
          size="icon"
          className="group"
          onClick={() => setMaximize((prev) => !prev)}
        >
          {maximize ? <MinimizeIcon /> : <MaximizeIcon />}
        </Button>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon">
              <InfoIcon />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="mx-auto w-full max-w-md rounded-4xl p-1">
            <DrawerHeader>
              <DrawerTitle className="relative px-2 pt-2 pb-0.5 text-start">
                <p>Upscayl Overview</p>
                <p className="text-sm font-normal text-muted-foreground">
                  Your activity at a glance
                </p>
                <Badge
                  variant="outline"
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                >
                  <div className="size-2 rounded-full bg-green-500"></div> Ready
                </Badge>
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-5">
              <div className="relative rounded-2xl border bg-card p-3 shadow-sm">
                <div>
                  <p>{t`Total Upscayls`}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight">
                    <CountUp
                      from={0}
                      to={userStats.totalUpscayls}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up-text"
                      delay={0}
                    />
                  </p>
                  <div className="absolute top-1/2 right-2 -translate-y-1/2">
                    <ChartNoAxesColumnIncreasingIcon
                      className="size-14 text-primary/60"
                      strokeWidth={4}
                      style={{
                        maskImage:
                          "linear-gradient(to top, transparent, black 85%)",
                        WebkitMaskImage:
                          "linear-gradient(to top, transparent, black 85%)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 [&>div]:pb-1.5">
                <div className="rounded-2xl border bg-card p-3 shadow-sm">
                  <div className="inline-flex items-center gap-2">
                    <ImagesIcon className="size-4 text-primary" />
                    <p className="text-xs leading-snug text-muted-foreground">
                      {t("Total Batch Upscayls")}
                    </p>
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">
                    <CountUp
                      from={0}
                      to={userStats.batchUpscayls}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up-text"
                      delay={0}
                    />
                  </p>
                </div>

                <div className="rounded-2xl border bg-card p-3 shadow-sm">
                  <div className="inline-flex items-center gap-1.5">
                    <ImageIcon className="size-4 text-primary" />
                    <p className="text-xs leading-snug text-muted-foreground">
                      {t("Total Image Upscayls")}
                    </p>
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">
                    <CountUp
                      from={0}
                      to={userStats.imageUpscayls}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up-text"
                      delay={0}
                    />
                  </p>
                </div>

                <div className="col-span-2 flex items-center gap-2 rounded-2xl border bg-card p-1.5 pr-3 shadow-sm">
                  <Button className="rounded-lg" size="icon-sm" asChild>
                    <div>
                      <LayersIcon />
                    </div>
                  </Button>
                  <p className="text-muted-foreground">
                    {t("Total Double Upscayls")}
                  </p>
                  <p className="ml-auto text-2xl font-semibold tracking-tight">
                    <CountUp
                      from={0}
                      to={userStats.doubleUpscayls}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up-text"
                      delay={0}
                    />
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-2 border-b pb-2">
                  <TimerIcon className="size-4 text-primary" />
                  <p className="text-sm font-semibold text-muted-foreground">
                    Performance
                  </p>
                </div>
                <div className="mt-2 grid grid-cols-2 divide-x divide-border">
                  <div className="pr-4">
                    <p className="text-xl font-semibold tracking-tight">
                      {formatDuration(userStats.averageUpscaylTime / 1000)}
                    </p>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">
                      {t("Average Upscayl Time")}
                    </p>
                  </div>
                  <div className="pl-4">
                    <p className="text-xl font-semibold tracking-tight">
                      {formatDuration(userStats.lastUpscaylDuration / 1000)}
                    </p>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">
                      {t("Last Upscayl Duration")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-2 pt-1">
                <div className="rounded-full border bg-secondary p-1.5">
                  <HistoryIcon className="size-4 shrink-0 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("Last Used At")}
                </p>
                <p className="ml-auto text-xs font-medium">
                  {userStats.lastUsedAt
                    ? new Date(userStats.lastUsedAt).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
        <Separator orientation="vertical" className="h-6 w-px shrink-0" />
        <Button
          disabled={!hasImage}
          variant="destructive"
          size="icon"
          onClick={resetImagePaths}
        >
          <RotateCcwIcon />
        </Button>
      </div>
    </div>
  );
}
