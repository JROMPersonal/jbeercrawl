import { useState } from 'react'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { signInAdmin, signOutAdmin } from '../api/adminAuth'
import AdminCitiesPanel from './AdminCitiesPanel'
import AdminBreweriesPanel from './AdminBreweriesPanel'
import AdminCrawlsPanel from './AdminCrawlsPanel'

function AdminPage({ cities, onExit }) {
  const { user, status } = useAdminAuth()
  const [password, setPassword] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('cities')

  const handleSignIn = async (event) => {
    event.preventDefault()
    setSigningIn(true)
    setError(null)

    try {
      await signInAdmin(password)
    } catch {
      setError('Incorrect password.')
    } finally {
      setSigningIn(false)
      setPassword('')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Admin</h1>
        <div className="admin-page__header-actions">
          {user && (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => signOutAdmin()}
            >
              Sign out
            </button>
          )}
          <button type="button" className="button button--ghost" onClick={onExit}>
            Back to app
          </button>
        </div>
      </div>

      {status === 'unconfigured' && (
        <p className="city-panel__message">
          Firebase isn't configured (see .env.example), so the admin page isn't
          available.
        </p>
      )}

      {status === 'loading' && <p className="city-panel__message">Loading…</p>}

      {status === 'ready' && !user && (
        <form className="admin-login" onSubmit={handleSignIn}>
          <label className="field">
            <span className="field__label">Admin password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
            />
          </label>

          {error && <p className="modal__error">{error}</p>}

          <button type="submit" className="button" disabled={signingIn || !password}>
            {signingIn ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      )}

      {status === 'ready' && user && (
        <>
          <div className="tab-bar">
            <button
              type="button"
              className={`tab-bar__button${tab === 'cities' ? ' tab-bar__button--active' : ''}`}
              onClick={() => setTab('cities')}
            >
              Cities
            </button>
            <button
              type="button"
              className={`tab-bar__button${tab === 'breweries' ? ' tab-bar__button--active' : ''}`}
              onClick={() => setTab('breweries')}
            >
              Breweries
            </button>
            <button
              type="button"
              className={`tab-bar__button${tab === 'crawls' ? ' tab-bar__button--active' : ''}`}
              onClick={() => setTab('crawls')}
            >
              Beer Crawls
            </button>
          </div>

          {tab === 'cities' && <AdminCitiesPanel cities={cities} />}
          {tab === 'breweries' && <AdminBreweriesPanel cities={cities} />}
          {tab === 'crawls' && <AdminCrawlsPanel cities={cities} />}
        </>
      )}
    </div>
  )
}

export default AdminPage
