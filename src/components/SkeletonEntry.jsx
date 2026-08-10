export default function SkeletonEntry() {
  return (
    <div className="entry skeleton-entry" aria-hidden="true">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-subtitle" />
      <div className="skeleton-line skeleton-small" />
    </div>
  );
}