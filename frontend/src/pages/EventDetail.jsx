import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

/**
 * EventDetail — Public guest page for QR code scans.
 * Rendered when URL path is /events/:slug (no auth required).
 * Fetches event data via GET /api/v1/events/slug/:slug.
 */
export default function EventDetail({ slug, onGoToLogin }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.getEventBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setEvent(data?.data?.event || null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Event not found.');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [slug]);

  const fmt = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  };

  const categoryColor = {
    conference: '#6c5ce7',
    workshop: '#0984e3',
    concert: '#e84393',
    sports: '#00b894',
    networking: '#fdcb6e',
    exhibition: '#fd79a8',
    festival: '#e17055',
    other: '#636e72',
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="event-detail-page">
        <div className="event-detail-loading">
          <div className="spinner" />
          <p>Loading event details…</p>
        </div>
      </div>
    );
  }

  // ── Error / Not found ──
  if (error || !event) {
    return (
      <div className="event-detail-page">
        <div className="event-detail-error">
          <div className="event-detail-error-icon">🔍</div>
          <h2>Event Not Found</h2>
          <p>{error || 'This event does not exist or is no longer available.'}</p>
          <button className="btn btn-primary" onClick={onGoToLogin}>
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const catColor = categoryColor[event.category] || '#6c5ce7';
  const spotsLeft = event.capacity ? event.capacity - (event.attendeeCount || 0) : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="event-detail-page">
      {/* Hero */}
      <div className="event-detail-hero" style={{ '--cat-color': catColor }}>
        <div className="event-detail-hero-bg" />
        <div className="event-detail-hero-content">
          <div className="event-detail-brand" onClick={onGoToLogin} title="Go to Eventora">
            <span className="event-detail-brand-icon">E</span>
            <span className="event-detail-brand-name">Eventora</span>
          </div>

          <span className="event-detail-badge" style={{ background: catColor }}>
            {event.category?.toUpperCase()}
          </span>

          <h1 className="event-detail-title">{event.title}</h1>

          {event.shortDescription && (
            <p className="event-detail-subtitle">{event.shortDescription}</p>
          )}

          <div className="event-detail-meta-row">
            <span className="event-detail-meta-pill">
              📅 {fmt(event.startDate)}
            </span>
            {event.venueName && (
              <span className="event-detail-meta-pill">
                📍 {event.venueName}{event.venueCity ? `, ${event.venueCity}` : ''}
              </span>
            )}
            <span className="event-detail-meta-pill" style={{ color: event.isFree ? '#00b894' : catColor }}>
              {event.isFree ? '🎟 Free' : `💳 ₹${event.ticketPrice?.toLocaleString('en-IN')}`}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="event-detail-body">
        {/* Left column — details */}
        <div className="event-detail-main">
          <section className="event-detail-section">
            <h2>About This Event</h2>
            <p className="event-detail-description">{event.description}</p>
          </section>

          {/* Date & time */}
          <section className="event-detail-section">
            <h2>Date &amp; Time</h2>
            <div className="event-detail-info-grid">
              <div className="event-detail-info-item">
                <span className="event-detail-info-icon">🗓</span>
                <div>
                  <strong>Start</strong>
                  <span>{fmt(event.startDate)}</span>
                </div>
              </div>
              <div className="event-detail-info-item">
                <span className="event-detail-info-icon">🏁</span>
                <div>
                  <strong>End</strong>
                  <span>{fmt(event.endDate)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Venue */}
          {(event.venueName || event.venueAddress) && (
            <section className="event-detail-section">
              <h2>Location</h2>
              <div className="event-detail-info-item">
                <span className="event-detail-info-icon">📍</span>
                <div>
                  {event.venueName && <strong>{event.venueName}</strong>}
                  {event.venueAddress && <span>{event.venueAddress}</span>}
                  <span>
                    {[event.venueCity, event.venueState, event.venueCountry].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Organizer */}
          {event.organizer && (
            <section className="event-detail-section">
              <h2>Organizer</h2>
              <div className="event-detail-organizer">
                <div className="event-detail-organizer-avatar">
                  {event.organizer.name?.charAt(0)?.toUpperCase() || 'O'}
                </div>
                <div>
                  <strong>{event.organizer.name}</strong>
                  <span>{event.organizer.email}</span>
                </div>
              </div>
            </section>
          )}

          {/* Tags */}
          {event.tags?.length > 0 && (
            <section className="event-detail-section">
              <h2>Tags</h2>
              <div className="event-detail-tags">
                {event.tags.map((tag) => (
                  <span key={tag} className="event-detail-tag">{tag}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column — registration card */}
        <div className="event-detail-sidebar">
          <div className="event-detail-register-card" style={{ '--cat-color': catColor }}>
            <div className="event-register-price">
              {event.isFree ? (
                <span className="event-register-free">Free Entry</span>
              ) : (
                <>
                  <span className="event-register-currency">₹</span>
                  <span className="event-register-amount">{Number(event.ticketPrice || 0).toLocaleString('en-IN')}</span>
                  <span className="event-register-per">/ person</span>
                </>
              )}
            </div>

            {spotsLeft !== null && (
              <div className="event-register-spots">
                <div
                  className="event-register-spots-bar"
                  style={{
                    width: `${Math.max(5, Math.min(100, ((event.capacity - spotsLeft) / event.capacity) * 100))}%`,
                    background: isFull ? '#d63031' : catColor,
                  }}
                />
                <span>{isFull ? 'Event Full' : `${spotsLeft} spots left`}</span>
              </div>
            )}

            <div className="event-register-attendees">
              👥 {event.attendeeCount || 0} registered
              {event.capacity ? ` / ${event.capacity} capacity` : ''}
            </div>

            <button
              className="btn btn-primary event-register-btn"
              style={{ background: isFull ? '#636e72' : catColor, width: '100%', fontSize: '15px', padding: '14px', marginTop: '16px' }}
              disabled={isFull}
              onClick={onGoToLogin}
            >
              {isFull ? '🚫 Event Full' : '✅ Register Now'}
            </button>

            <p className="event-register-note">
              {isFull
                ? 'This event has reached maximum capacity.'
                : 'Create a free account or log in to complete registration.'}
            </p>
          </div>

          {/* Share link */}
          <div className="event-detail-share">
            <p>Share this event</p>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '13px' }}
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
              }}
            >
              📋 Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="event-detail-footer">
        <span>Powered by <strong>Eventora</strong></span>
        <button className="btn btn-secondary" style={{ fontSize: '13px' }} onClick={onGoToLogin}>
          Login / Sign Up
        </button>
      </div>
    </div>
  );
}
