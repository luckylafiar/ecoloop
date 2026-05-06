// src/components/StatusPill.jsx
const LABELS = {
  pending:   'Menunggu',
  confirmed: 'Dikonfirmasi',
  collected: 'Terkumpul',
  certified: 'Bersertifikat',
};

export default function StatusPill({ status }) {
  return (
    <span className="status" data-status={status}>
      {LABELS[status] || status}
    </span>
  );
}
