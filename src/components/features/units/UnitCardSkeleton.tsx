export function UnitCardSkeleton() {
  return (
    <article className="unit-card unit-card-skeleton" aria-busy="true">
      <div className="unit-skeleton-media" />
      <div className="unit-skeleton-content">
        <div className="unit-skeleton-line unit-skeleton-line--title" />
        <div className="unit-skeleton-line" />
        <div className="unit-skeleton-line unit-skeleton-line--short" />
        <div className="unit-skeleton-line unit-skeleton-line--price" />
      </div>
    </article>
  );
}
