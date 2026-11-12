type InsightListProps = {
  title: string;
  items: string[];
};

export function InsightList({ title, items }: InsightListProps) {
  return (
    <section className="panel insight-panel">
      <p className="eyebrow">{title}</p>
      <h3>{title}</h3>
      <ul className="bullet-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
