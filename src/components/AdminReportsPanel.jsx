import { useState } from 'react'
import { useReports } from '../hooks/useReports'
import { setReportStatus, deleteReport } from '../api/reports'

const TYPE_LABELS = {
  bug: 'Bug report',
  update_request: 'Request an update',
  removal_request: 'Request removal',
  city_request: 'Request city',
  other: 'Other',
}

function formatDate(timestamp) {
  const millis = timestamp?.toMillis?.()
  return millis ? new Date(millis).toLocaleString() : ''
}

function AdminReportsPanel() {
  const { reports, status } = useReports()
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const openReports = reports.filter((r) => r.status !== 'resolved')
  const resolvedReports = reports.filter((r) => r.status === 'resolved')

  const handleToggleStatus = async (report) => {
    setBusyId(report.id)
    try {
      await setReportStatus(report.id, report.status === 'resolved' ? 'open' : 'resolved')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (reportId) => {
    setBusyId(reportId)
    try {
      await deleteReport(reportId)
    } finally {
      setBusyId(null)
      setConfirmingDeleteId(null)
    }
  }

  const renderReport = (report) => (
    <li key={report.id} className="report-card">
      <div className="report-card__header">
        <span className="report-card__type">{TYPE_LABELS[report.type] ?? report.type}</span>
        <span className="admin-list__meta">{formatDate(report.createdAt)}</span>
      </div>

      {report.about && <p className="report-card__about">Re: {report.about}</p>}
      <p className="report-card__message">{report.message}</p>
      {report.contactEmail && (
        <p className="report-card__contact">
          <a href={`mailto:${report.contactEmail}`}>{report.contactEmail}</a>
        </p>
      )}

      <div className="admin-list__actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={() => handleToggleStatus(report)}
          disabled={busyId === report.id}
        >
          {report.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
        </button>
        {confirmingDeleteId === report.id ? (
          <>
            <span className="admin-list__confirm">Delete?</span>
            <button
              type="button"
              className="button button--danger"
              onClick={() => handleDelete(report.id)}
              disabled={busyId === report.id}
            >
              {busyId === report.id ? 'Deleting…' : 'Yes'}
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setConfirmingDeleteId(null)}
            >
              No
            </button>
          </>
        ) : (
          <button
            type="button"
            className="button button--danger"
            onClick={() => setConfirmingDeleteId(report.id)}
          >
            Delete
          </button>
        )}
      </div>
    </li>
  )

  return (
    <div>
      {status === 'unconfigured' && (
        <p className="city-panel__message">Firestore isn't configured.</p>
      )}
      {status === 'loading' && <p className="city-panel__message">Loading reports…</p>}
      {status === 'error' && (
        <p className="city-panel__message">Couldn't load reports right now.</p>
      )}

      {status === 'ready' && (
        <>
          <h3 className="admin-panel__section-title">Open ({openReports.length})</h3>
          {openReports.length === 0 ? (
            <p className="city-panel__message">No open reports.</p>
          ) : (
            <ul className="report-list">{openReports.map(renderReport)}</ul>
          )}

          {resolvedReports.length > 0 && (
            <>
              <h3 className="admin-panel__section-title">Resolved ({resolvedReports.length})</h3>
              <ul className="report-list">{resolvedReports.map(renderReport)}</ul>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default AdminReportsPanel
