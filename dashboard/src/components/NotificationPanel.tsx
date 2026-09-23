import React from 'react';
import { useTrafficStore } from '../store/trafficStore';
import type { NotificationCategory, NotificationBadge } from '../types/traffic';
import { Bell, X, Siren, ArrowRight } from 'lucide-react';

export const NotificationPanel: React.FC = () => {
  const isNotificationsOpen = useTrafficStore((s) => s.isNotificationsOpen);
  const setIsNotificationsOpen = useTrafficStore((s) => s.setIsNotificationsOpen);
  const notificationFilter = useTrafficStore((s) => s.notificationFilter);
  const setNotificationFilter = useTrafficStore((s) => s.setNotificationFilter);
  const notifications = useTrafficStore((s) => s.notifications);
  const frame = useTrafficStore((s) => s.frame);
  const setSelectedJunctionId = useTrafficStore((s) => s.setSelectedJunctionId);
  const setSelectedRoadId = useTrafficStore((s) => s.setSelectedRoadId);

  if (!isNotificationsOpen) return null;

  const emergencies = Object.values(frame?.emergencies || {}).filter((e) => e.active);
  const activeAmbulance = emergencies[0];

  const filteredNotifications = notifications.filter((n) => {
    if (notificationFilter === 'ALL') return true;
    return n.category === notificationFilter;
  });

  const getBadgeStyle = (badge: NotificationBadge) => {
    switch (badge) {
      case 'New':
        return { bg: '#EF4444', text: '#FFF' };
      case 'High':
        return { bg: '#F59E0B', text: '#000' };
      case 'Info':
        return { bg: '#0284C7', text: '#FFF' };
      case 'Resolved':
        return { bg: '#10B981', text: '#FFF' };
      default:
        return { bg: '#64748B', text: '#FFF' };
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'EMERGENCY': return '#EF4444';
      case 'TRAFFIC': return '#F59E0B';
      case 'SIGNAL': return '#38BDF8';
      case 'SYSTEM': return '#10B981';
      default: return '#94A3B8';
    }
  };

  const handleNotificationClick = (targetId?: string, targetType?: string) => {
    if (!targetId) return;
    if (targetType === 'INTERSECTION' || targetId.startsWith('J')) {
      setSelectedJunctionId(targetId);
    } else if (targetType === 'ROAD' || targetId.startsWith('ROAD_') || targetId.startsWith('IN_')) {
      setSelectedRoadId(targetId);
    }
  };

  return (
    <aside className="notifications-panel">
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={16} color="#FFF" />
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
            Notifications
          </h3>
          <span style={{
            fontSize: '11px',
            color: '#64748B',
            fontWeight: 600,
          }}>
            {notifications.length} total
          </span>
        </div>

        <button
          onClick={() => setIsNotificationsOpen(false)}
          style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
          title="Minimize Notifications"
        >
          <X size={16} />
        </button>
      </div>

      {/* Filter Tabs matching reference image: All, Events/Traffic, Users/Emergency, Client/Signal */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        overflowX: 'auto',
      }}>
        {(['ALL', 'TRAFFIC', 'EMERGENCY', 'SIGNAL', 'SYSTEM'] as const).map((cat) => {
          const isActive = notificationFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setNotificationFilter(cat)}
              style={{
                background: isActive ? '#10B981' : '#101726',
                color: isActive ? '#FFF' : '#64748B',
                border: '1px solid',
                borderColor: isActive ? '#10B981' : 'var(--border-subtle)',
                borderRadius: '16px',
                padding: '3px 10px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat === 'ALL' ? `All (${notifications.length})` : cat}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredNotifications.map((n) => {
          const badgeStyle = getBadgeStyle(n.badge);
          const catColor = getCategoryColor(n.category);

          return (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n.targetId, n.targetType)}
              style={{
                background: '#0D1525',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px 12px',
                cursor: n.targetId ? 'pointer' : 'default',
                transition: 'border-color 0.15s ease',
              }}
            >
              {/* Badge + Title + Time */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '3px',
                    background: badgeStyle.bg,
                    color: badgeStyle.text,
                    textTransform: 'uppercase',
                  }}>
                    {n.badge}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFF' }}>
                    {n.title}
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748B' }}>
                  {n.timeAgo}
                </span>
              </div>

              {/* Detail text */}
              <p style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.4, marginBottom: '6px' }}>
                {n.detail}
              </p>

              {/* Category Tag */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  color: catColor,
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  letterSpacing: '0.04em',
                }}>
                  {n.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Card: Dedicated Emergency Corridor Monitor matching reference image */}
      <div style={{
        background: '#0A111E',
        borderTop: '1px solid var(--border-subtle)',
        padding: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Siren size={15} color="#EF4444" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFF' }}>
              Emergency Corridor
            </span>
          </div>

          <span style={{
            fontSize: '9px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '12px',
            background: activeAmbulance ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
            color: activeAmbulance ? '#F87171' : '#94A3B8',
            border: `1px solid ${activeAmbulance ? '#EF4444' : '#475569'}`,
          }}>
            {activeAmbulance ? '● ACTIVE' : 'STANDBY'}
          </span>
        </div>

        {activeAmbulance ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}>
                🚑
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
                  {activeAmbulance.ambulance_id} – To Hospital
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                  ETA: <strong style={{ color: '#F87171' }}>{Math.floor(activeAmbulance.eta_seconds / 60)}:{Math.floor(activeAmbulance.eta_seconds % 60).toString().padStart(2, '0')}</strong> • J1 → J2 → J3 → Hospital
                </div>
              </div>
            </div>

            {/* Stepper route visualization matching reference image */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginTop: '12px' }}>
              {/* Connected track line */}
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '12px',
                right: '12px',
                height: '2px',
                background: '#1E293B',
                zIndex: 1,
              }} />

              {['J1', 'J2', 'J3'].map((jId) => {
                const status = activeAmbulance.prepared_intersections?.[jId]?.status || 'PREPARING';
                const isReady = status === 'READY' || status === 'PASSING';
                return (
                  <div key={jId} style={{ zIndex: 2, textAlign: 'center' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: isReady ? '#10B981' : '#F59E0B',
                      boxShadow: isReady ? '0 0 6px #10B981' : 'none',
                      margin: '0 auto 4px auto',
                    }} />
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#FFF' }}>{jId}</div>
                    <div style={{ fontSize: '8px', color: isReady ? '#34D399' : '#FBBF24', fontWeight: 700 }}>
                      {isReady ? 'READY' : 'PREPARING'}
                    </div>
                  </div>
                );
              })}

              <div style={{ zIndex: 2, textAlign: 'center' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  boxShadow: '0 0 6px #EF4444',
                  margin: '0 auto 4px auto',
                }} />
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#FFF' }}>HOSPITAL</div>
                <div style={{ fontSize: '8px', color: '#38BDF8', fontWeight: 700 }}>1.2 km</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0', color: '#64748B', fontSize: '11px' }}>
            No active emergency preemption wave.
          </div>
        )}
      </div>
    </aside>
  );
};
