import React from 'react';
import {
  Sparkles,
  Building2,
  Camera,
  Utensils,
  Flower2,
  Music,
  HeartHandshake,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Layers
} from 'lucide-react';

/**
 * ServiceRequirementsBadge
 * Visual card displaying service-specific requirements without generic irrelevant fields
 * Used across Vendor Bookings and Customer Bookings dashboards
 */
const ServiceRequirementsBadge = ({ booking }) => {
  const req = booking.service_requirements;
  const categorySlug = booking.category_slug || '';
  const categoryName = (booking.category_name || '').toLowerCase();

  // If no structured service requirements are present, show clean fallback
  if (!req || typeof req !== 'object') {
    return null;
  }

  // 1. Bridal Makeup & Styling
  if (categorySlug === 'bridal-makeup' || categoryName.includes('makeup')) {
    const roleLabels = {
      bride: 'Bride',
      motherOfBride: 'Mother of Bride',
      motherOfGroom: 'Mother of Groom',
      sister: 'Sisters / Bridesmaids',
      groom: 'Groom Grooming',
      other: 'Other Family'
    };

    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #FFF9FD 0%, var(--color-primary-light) 100%)',
          border: '1.5px solid #F3D4ED',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
          marginBottom: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9B2C82', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
          <Sparkles size={16} /> Bridal Makeup & Styling Specifications
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Clientele Count</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.95rem' }}>
              {req.peopleCount || 1} {req.peopleCount === 1 ? 'Person' : 'People'}
            </strong>
            {req.roleBreakdown && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-body)', marginTop: '2px' }}>
                {Object.keys(req.roleBreakdown)
                  .map((k) => `${roleLabels[k] || k} (${req.roleBreakdown[k]})`)
                  .join(', ')}
              </div>
            )}
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Looks / Occasions</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.95rem' }}>
              {req.looksCount || '1 Look'}
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Ready by: <strong>{req.completionTime || booking.event_time || 'Morning'}</strong>
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Getting-Ready Location</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.88rem' }}>
              {req.serviceLocationType === 'studio' ? 'At Vendor Studio' : 'At Client Venue / Suite'}
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              📍 {req.gettingReadyLocation || booking.event_location}
            </div>
          </div>
        </div>

        {req.stylingPreferences?.length > 0 && (
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #F8E2F3', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, alignSelf: 'center' }}>
              Preferences:
            </span>
            {req.stylingPreferences.map((p) => (
              <span
                key={p}
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#FFFFFF',
                  border: '1px solid #F3D4ED',
                  color: '#9B2C82',
                  fontWeight: 600
                }}
              >
                ✓ {p}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. Marriage Hall & Venues
  if (categorySlug === 'venues' || categoryName.includes('hall') || categoryName.includes('venue')) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #F8F9FF 0%, var(--color-primary-light) 100%)',
          border: '1.5px solid var(--color-primary-soft)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
          marginBottom: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-dark)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
          <Building2 size={16} /> Marriage Hall & Venue Booking Parameters
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Selected Venue</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.95rem' }}>
              {req.venueName || booking.business_name}
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              📍 {req.venueAddress || booking.vendor_address || booking.event_location}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Capacity / Guest Planning</span>
            <strong style={{ color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>
              {req.guestCount || booking.guest_count} Guests
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Seating: {req.seatingLayout || 'Traditional Rows'}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Reserved Slot</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.9rem' }}>
              {req.bookingSlot || 'Full Day Reservation'}
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Date: {booking.event_date}
            </div>
          </div>
        </div>

        {req.facilitiesNeeded?.length > 0 && (
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, alignSelf: 'center' }}>
              Required Facilities:
            </span>
            {req.facilitiesNeeded.map((f) => (
              <span
                key={f}
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#FFFFFF',
                  border: '1px solid var(--color-primary-soft)',
                  color: 'var(--color-primary-dark)',
                  fontWeight: 600
                }}
              >
                ✓ {f}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. Catering & Food Services
  if (categorySlug === 'catering' || categoryName.includes('cater') || categoryName.includes('food')) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #FFFBF5 0%, var(--color-primary-light) 100%)',
          border: '1.5px solid #FEEBC8',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
          marginBottom: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C05621', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
          <Utensils size={16} /> Catering & Menu Execution Details
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Serving Volume</span>
            <strong style={{ color: '#C05621', fontSize: '1.1rem' }}>
              {req.plateCount || booking.guest_count} Plates
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {req.foodPreference || 'Pure Vegetarian'}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Meal Session & Style</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.9rem' }}>
              {req.mealType || 'Lunch Feast'}
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {req.servingStyle || 'Traditional Banana Leaf Service'}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Delivery Venue</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.85rem' }}>
              📍 {req.serviceLocation || booking.event_location}
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Serving Time: {booking.event_time || '12:30 PM'}
            </div>
          </div>
        </div>

        {req.dietaryNotes && (
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #FEEBC8', fontSize: '0.8rem', color: 'var(--color-text-body)' }}>
            <strong>Special Dietary Request:</strong> "{req.dietaryNotes}"
          </div>
        )}
      </div>
    );
  }

  // 4. Photography & Videography
  if (categorySlug === 'photography' || categoryName.includes('photo') || categoryName.includes('video')) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #F9F9FF 0%, var(--color-primary-light) 100%)',
          border: '1.5px solid var(--color-primary-soft)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
          marginBottom: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-dark)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
          <Camera size={16} /> Photography & Cinematography Coverage
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Coverage Scope</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.95rem' }}>
              {req.coverageScope || 'Photo & Video Coverage'}
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {req.eventDays || '1 Day'} &bull; {req.approxHours || '8 Hours'}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Shoot Location</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.88rem' }}>
              📍 {req.eventLocation || booking.event_location}
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              City: {booking.event_city}
            </div>
          </div>

          {req.deliverables?.length > 0 && (
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Deliverables</span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {req.deliverables.map((d) => (
                  <span
                    key={d}
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-pill)',
                      background: '#FFFFFF',
                      border: '1px solid var(--color-primary-soft)',
                      color: 'var(--color-primary-dark)',
                      fontWeight: 600
                    }}
                  >
                    ✓ {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {req.specialShotsNotes && (
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text-body)' }}>
            <strong>Shot Preferences:</strong> "{req.specialShotsNotes}"
          </div>
        )}
      </div>
    );
  }

  // 5. Stage & Flower Decoration
  if (categorySlug === 'decor-floral' || categoryName.includes('decor') || categoryName.includes('flower')) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #F6FFF9 0%, var(--color-primary-light) 100%)',
          border: '1.5px solid #C6F6D5',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
          marginBottom: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#276749', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
          <Flower2 size={16} /> Stage & Floral Decoration Specifications
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Theme & Materials</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.9rem' }}>
              {req.themeStyle || 'Traditional Floral Theme'}
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Flowers: {req.flowerMaterials || 'Fresh Jasmine & Roses'}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Setup Venue</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.88rem' }}>
              📍 {req.venueLocation || booking.event_location}
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Deadline: {req.setupDeadline || 'Previous Day'}
            </div>
          </div>
        </div>

        {req.decorAreas?.length > 0 && (
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #C6F6D5', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, alignSelf: 'center' }}>
              Areas:
            </span>
            {req.decorAreas.map((a) => (
              <span
                key={a}
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#FFFFFF',
                  border: '1px solid #C6F6D5',
                  color: '#276749',
                  fontWeight: 600
                }}
              >
                ✓ {a}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 6. DJ, Sound & Lighting
  if (categorySlug === 'music-dj' || categoryName.includes('dj') || categoryName.includes('sound')) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #FAF5FF 0%, var(--color-primary-light) 100%)',
          border: '1.5px solid #E9D8FD',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
          marginBottom: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B46C1', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
          <Music size={16} /> DJ, Sound & Stage Lighting Technical Scope
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Venue & Crowd</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.9rem' }}>
              {req.venueType || 'Indoor AC Hall'} &bull; ~{req.crowdSize || booking.guest_count} Audience
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Duration: {req.duration || '4 Hours'}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Location</span>
            <strong style={{ color: 'var(--color-text-title)', fontSize: '0.88rem' }}>
              📍 {req.venueLocation || booking.event_location}
            </strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Music: {req.musicGenres || 'Tamil Kollywood Hits'}
            </div>
          </div>
        </div>

        {req.equipmentScope?.length > 0 && (
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E9D8FD', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, alignSelf: 'center' }}>
              Gear:
            </span>
            {req.equipmentScope.map((e) => (
              <span
                key={e}
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#FFFFFF',
                  border: '1px solid #E9D8FD',
                  color: '#6B46C1',
                  fontWeight: 600
                }}
              >
                ✓ {e}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 7. Event Planning & Coordination
  if (categorySlug === 'event-planning' || categoryName.includes('plan')) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #F8F9FF 0%, var(--color-primary-light) 100%)',
          border: '1.5px solid var(--color-primary-soft)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
          marginBottom: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-dark)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
          <HeartHandshake size={16} /> Event Planning & Coordination Scope
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-title)', marginBottom: '6px' }}>
          <strong>Event Scale:</strong> {req.scale || 'Full Coordination'}
        </div>

        {req.coordinationScope?.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {req.coordinationScope.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#FFFFFF',
                  border: '1px solid var(--color-primary-soft)',
                  color: 'var(--color-primary-dark)',
                  fontWeight: 600
                }}
              >
                ✓ {s}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ServiceRequirementsBadge;
