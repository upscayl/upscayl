export default function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}
