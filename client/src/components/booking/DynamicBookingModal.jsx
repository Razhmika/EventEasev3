import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Building2,
  Camera,
  Utensils,
  Flower2,
  Music,
  HeartHandshake,
  Info
} from 'lucide-react';
import api from '../../services/api';

/**
 * Dynamic, Service-Specific Booking Request Modal
 * Adapts form fields according to the selected vendor service category:
 * - bridal-makeup: People breakdown, looks count, ready time, studio vs venue location (NO guest count)
 * - venues: Fixed venue address displayed (NO re-entry), guest count for capacity, time slots, facilities
 * - photography: Coverage scope, days, hours, album requirements, venue location
 * - catering: Plate count, meal time, food preference, serving style, menu dietary notes
 * - decor-floral: Decor areas, theme style, flower materials, setup deadline, venue location
 * - music-dj: Equipment scope, venue type, crowd size, music genres, duration
 * - event-planning: Coordination scope, event scale, destination
 */
const DynamicBookingModal = ({
  vendor,
  initialService = null,
  onClose,
  onSuccess
}) => {
  // Service selection
  const [selectedServiceId, setSelectedServiceId] = useState(
    initialService ? initialService.id.toString() : ''
  );

  // Common Event Essentials
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('10:00');
  const [quoteAmount, setQuoteAmount] = useState(
    initialService ? initialService.price : vendor.starting_price || ''
  );
  const [customerNotes, setCustomerNotes] = useState('');

  // Location fields (adaptive)
  const [venueLocation, setVenueLocation] = useState('');
  const [eventCity, setEventCity] = useState(vendor.city || 'Coimbatore');

  // Generic guest count (used only for categories where applicable)
  const [guestCount, setGuestCount] = useState(150);

  // Service-Specific Requirements State
  // 1. Bridal Makeup
  const [makeupRoles, setMakeupRoles] = useState({
    bride: true,
    motherOfBride: false,
    motherOfGroom: false,
    sister: false,
    groom: false,
    other: false
  });
  const [makeupRoleCounts, setMakeupRoleCounts] = useState({
    bride: 1,
    motherOfBride: 1,
    motherOfGroom: 1,
    sister: 1,
    groom: 1,
    other: 1
  });
  const [makeupLooks, setMakeupLooks] = useState('1 Look');
  const [makeupLocationType, setMakeupLocationType] = useState('venue'); // 'venue' or 'studio'
  const [makeupGettingReadyAddress, setMakeupGettingReadyAddress] = useState('');
  const [makeupStylePreferences, setMakeupStylePreferences] = useState({
    hdMakeup: true,
    sareeDraping: true,
    hairStyling: true,
    flowerSetting: true,
    airbrush: false
  });

  // 2. Marriage Hall & Venues
  const [venueSlot, setVenueSlot] = useState('Full Day (Morning 6 AM - Night 10 PM)');
  const [venueGuestCount, setVenueGuestCount] = useState(350);
  const [venueFacilities, setVenueFacilities] = useState({
    acHall: true,
    diningHall: true,
    dressingRooms: true,
    kitchen: true,
    parking: true,
    generatorBackup: true
  });
  const [seatingLayout, setSeatingLayout] = useState('Traditional Theater Rows');

  // 3. Photography & Videography
  const [photoScope, setPhotoScope] = useState('Both Photography & Videography');
  const [photoDays, setPhotoDays] = useState('1 Day');
  const [photoHours, setPhotoHours] = useState('8 Hours (Full Day)');
  const [photoDeliverables, setPhotoDeliverables] = useState({
    printedAlbum: true,
    candidShoots: true,
    traditionalStage: true,
    cinematicTeaser: true,
    droneCoverage: false
  });
  const [photoSpecialShots, setPhotoSpecialShots] = useState('');

  // 4. Catering & Food Services
  const [cateringPlates, setCateringPlates] = useState(300);
  const [cateringMealType, setCateringMealType] = useState('Lunch');
  const [cateringFoodType, setCateringFoodType] = useState('Pure Vegetarian');
  const [cateringServingStyle, setCateringServingStyle] = useState('Traditional Banana Leaf Feast');
  const [cateringDietaryNotes, setCateringDietaryNotes] = useState('');

  // 5. Stage & Flower Decoration
  const [decorAreas, setDecorAreas] = useState({
    stageMandapam: true,
    entranceArch: true,
    receptionBackdrop: true,
    diningArea: false,
    pathwayWalkway: false,
    photoBooth: false
  });
  const [decorTheme, setDecorTheme] = useState('Traditional South Indian Temple Floral');
  const [flowerMaterials, setFlowerMaterials] = useState('Fresh Jasmine & Marigold');
  const [decorSetupDeadline, setDecorSetupDeadline] = useState('Previous Day Night 10:00 PM');

  // 6. DJ, Sound & Lighting
  const [djScope, setDjScope] = useState({
    djPerformance: true,
    soundSystem: true,
    stageLighting: true,
    movingHeads: false,
    wirelessMics: true
  });
  const [djVenueType, setDjVenueType] = useState('Indoor AC Hall');
  const [djDurationHours, setDjDurationHours] = useState('4 Hours');
  const [djCrowdSize, setDjCrowdSize] = useState(250);
  const [djMusicGenres, setDjMusicGenres] = useState('Tamil Kollywood Dance Hits & Retro Classics');

  // 7. Event Planning & Coordination
  const [planningScope, setPlanningScope] = useState({
    fullPlanning: true,
    dayOfCoordination: true,
    vendorManagement: true,
    decorDirection: true
  });
  const [planningScale, setPlanningScale] = useState('Medium (150 - 350 Guests)');

  // Submission & UI feedback state
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Current selected service object
  const currentService = vendor.services?.find(
    (s) => s.id.toString() === selectedServiceId
  );

  // Determine active category slug
  const getCategorySlug = () => {
    if (currentService?.category_slug) return currentService.category_slug;
    if (vendor.category_slug) return vendor.category_slug;
    if (vendor.category) return vendor.category;
    // Check service title hints as fallback
    const title = (currentService?.title || vendor.business_name || '').toLowerCase();
    if (title.includes('makeup') || title.includes('bridal') || title.includes('makeover')) return 'bridal-makeup';
    if (title.includes('hall') || title.includes('mahal') || title.includes('mandapam') || title.includes('venue')) return 'venues';
    if (title.includes('photo') || title.includes('studio') || title.includes('video')) return 'photography';
    if (title.includes('cater') || title.includes('food') || title.includes('feast')) return 'catering';
    if (title.includes('decor') || title.includes('flower') || title.includes('stage')) return 'decor-floral';
    if (title.includes('dj') || title.includes('sound') || title.includes('music')) return 'music-dj';
    if (title.includes('plan') || title.includes('event')) return 'event-planning';
    return 'default';
  };

  const activeCategory = getCategorySlug();

  // Whenever selected service changes, update price and intelligent defaults
  const handleServiceChange = (sId) => {
    setSelectedServiceId(sId);
    const svc = vendor.services?.find((s) => s.id.toString() === sId);
    if (svc) {
      setQuoteAmount(svc.price);
    } else {
      setQuoteAmount(vendor.starting_price || '');
    }
  };

  // Calculate makeup total people
  const calculateMakeupPeopleCount = () => {
    let total = 0;
    Object.keys(makeupRoles).forEach((role) => {
      if (makeupRoles[role]) {
        total += makeupRoleCounts[role] || 1;
      }
    });
    return Math.max(total, 1);
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!eventDate) {
      setErrorMessage('Please select the scheduled date for your celebration.');
      return;
    }

    // Construct service-specific requirements payload
    let serviceRequirements = null;
    let finalLocation = venueLocation;
    let finalGuestCount = guestCount;

    if (activeCategory === 'bridal-makeup') {
      const peopleCount = calculateMakeupPeopleCount();
      const activeRoles = Object.keys(makeupRoles).filter((r) => makeupRoles[r]);
      const roleBreakdown = {};
      activeRoles.forEach((r) => {
        roleBreakdown[r] = makeupRoleCounts[r] || 1;
      });

      if (makeupLocationType === 'venue' && !makeupGettingReadyAddress.trim()) {
        setErrorMessage('Please provide the getting-ready venue or address for the makeup artist.');
        return;
      }

      serviceRequirements = {
        category: 'bridal-makeup',
        peopleCount,
        roleBreakdown,
        looksCount: makeupLooks,
        serviceLocationType: makeupLocationType,
        gettingReadyLocation:
          makeupLocationType === 'studio'
            ? vendor.address || `${vendor.business_name} Studio, ${vendor.city}`
            : makeupGettingReadyAddress.trim(),
        completionTime: eventTime,
        stylingPreferences: Object.keys(makeupStylePreferences).filter(
          (k) => makeupStylePreferences[k]
        )
      };

      finalLocation = serviceRequirements.gettingReadyLocation;
      finalGuestCount = peopleCount; // Makeup does not have a 500-guest crowd requirement
    } else if (activeCategory === 'venues') {
      if (!venueGuestCount || venueGuestCount < 1) {
        setErrorMessage('Please specify your expected guest count to verify hall capacity.');
        return;
      }

      serviceRequirements = {
        category: 'venues',
        venueName: vendor.business_name,
        venueAddress: vendor.address || `${vendor.business_name}, ${vendor.city}`,
        guestCount: parseInt(venueGuestCount, 10),
        bookingSlot: venueSlot,
        seatingLayout,
        facilitiesNeeded: Object.keys(venueFacilities).filter((k) => venueFacilities[k])
      };

      // Venue is fixed at vendor's address — customer does NOT re-enter address!
      finalLocation = vendor.address || `${vendor.business_name}, ${vendor.city}`;
      finalGuestCount = parseInt(venueGuestCount, 10);
    } else if (activeCategory === 'photography') {
      if (!venueLocation.trim()) {
        setErrorMessage('Please specify the event venue or shoot location.');
        return;
      }

      serviceRequirements = {
        category: 'photography',
        coverageScope: photoScope,
        eventDays: photoDays,
        approxHours: photoHours,
        deliverables: Object.keys(photoDeliverables).filter((k) => photoDeliverables[k]),
        specialShotsNotes: photoSpecialShots.trim(),
        eventLocation: venueLocation.trim()
      };
    } else if (activeCategory === 'catering') {
      if (!cateringPlates || cateringPlates < 1) {
        setErrorMessage('Please specify the expected number of plates for catering.');
        return;
      }
      if (!venueLocation.trim()) {
        setErrorMessage('Please specify the delivery and serving venue location.');
        return;
      }

      serviceRequirements = {
        category: 'catering',
        plateCount: parseInt(cateringPlates, 10),
        mealType: cateringMealType,
        foodPreference: cateringFoodType,
        servingStyle: cateringServingStyle,
        dietaryNotes: cateringDietaryNotes.trim(),
        serviceLocation: venueLocation.trim()
      };
      finalGuestCount = parseInt(cateringPlates, 10);
    } else if (activeCategory === 'decor-floral') {
      if (!venueLocation.trim()) {
        setErrorMessage('Please specify the hall or home address for decoration.');
        return;
      }

      serviceRequirements = {
        category: 'decor-floral',
        decorAreas: Object.keys(decorAreas).filter((k) => decorAreas[k]),
        themeStyle: decorTheme,
        flowerMaterials,
        setupDeadline: decorSetupDeadline,
        venueLocation: venueLocation.trim()
      };
    } else if (activeCategory === 'music-dj') {
      if (!venueLocation.trim()) {
        setErrorMessage('Please specify the event venue location for sound equipment setup.');
        return;
      }

      serviceRequirements = {
        category: 'music-dj',
        equipmentScope: Object.keys(djScope).filter((k) => djScope[k]),
        venueType: djVenueType,
        duration: djDurationHours,
        crowdSize: parseInt(djCrowdSize, 10) || 200,
        musicGenres: djMusicGenres,
        venueLocation: venueLocation.trim()
      };
      finalGuestCount = parseInt(djCrowdSize, 10) || 200;
    } else if (activeCategory === 'event-planning') {
      serviceRequirements = {
        category: 'event-planning',
        coordinationScope: Object.keys(planningScope).filter((k) => planningScope[k]),
        scale: planningScale,
        destinationCity: eventCity
      };
    } else {
      // Default / generic fallback
      serviceRequirements = {
        category: 'general',
        notes: customerNotes
      };
    }

    setSubmitting(true);
    try {
      const payload = {
        vendorId: vendor.id,
        serviceId: selectedServiceId ? parseInt(selectedServiceId, 10) : null,
        categoryId: currentService?.category_id || null,
        eventName: eventName.trim() || `${eventType} Celebration`,
        eventType,
        eventDate,
        eventTime,
        location: finalLocation || vendor.address || `${vendor.business_name}, ${vendor.city}`,
        city: eventCity || vendor.city,
        guestCount: finalGuestCount,
        estimatedBudget: quoteAmount ? parseFloat(quoteAmount) : vendor.starting_price,
        quoteAmount: quoteAmount ? parseFloat(quoteAmount) : vendor.starting_price,
        customerNotes: customerNotes.trim(),
        serviceRequirements
      };

      const res = await api.post('/bookings', payload);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit booking inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(30, 20, 50, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 48px rgba(98, 64, 160, 0.22)',
          border: '1px solid var(--color-primary-soft)',
          backgroundColor: '#FFFFFF'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, #FFFFFF 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={vendor.avatar_url || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80'}
              alt={vendor.business_name}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--color-primary-soft)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-text-title)' }}>
                  Request Booking & Quote
                </h2>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}
                >
                  {activeCategory.replace('-', ' ')}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Direct inquiry to <strong>{vendor.business_name}</strong> &bull; {vendor.city}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-text-title)', marginBottom: '8px' }}>
                Booking Request Sent!
              </h3>
              <p style={{ color: 'var(--color-text-body)', maxWidth: '440px', margin: '0 auto 20px', fontSize: '0.95rem' }}>
                Your service requirements have been sent to <strong>{vendor.business_name}</strong>. The vendor will evaluate the date, requirements, and provide a binding quote.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {errorMessage && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#FFF5F5',
                    border: '1px solid #FEB2B2',
                    color: 'var(--color-danger)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Package / Service Selection */}
              <div
                style={{
                  padding: '16px',
                  background: 'var(--color-primary-light)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-primary-soft)'
                }}
              >
                <label
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--color-primary-dark)',
                    display: 'block',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Selected Package / Service
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  style={{
                    background: '#FFFFFF',
                    borderColor: 'var(--color-primary-soft)',
                    fontWeight: 600,
                    color: 'var(--color-text-title)'
                  }}
                >
                  <option value="">General Custom Inquiry (Full Event)</option>
                  {vendor.services?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} — ₹{parseFloat(s.price).toLocaleString('en-IN')} (per {s.pricing_unit})
                    </option>
                  ))}
                </select>
                {currentService?.description && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--color-text-body)' }}>
                    {currentService.description}
                  </p>
                )}
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 1: EVENT ESSENTIALS (COMMON FIELDS)
              ────────────────────────────────────────────────────────────── */}
              <div>
                <h4
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--color-primary-dark)',
                    margin: '0 0 12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Calendar size={15} /> 1. Event Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                      Event Title / Occasion *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Divya's Muhurtham & Reception"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                      Event Type *
                    </label>
                    <select value={eventType} onChange={(e) => setEventType(e.target.value)} required>
                      <option value="Wedding">Wedding</option>
                      <option value="Reception">Reception</option>
                      <option value="Engagement">Engagement Ceremony</option>
                      <option value="Birthday">Birthday Celebration</option>
                      <option value="Anniversary">Family Anniversary</option>
                      <option value="Housewarming">Housewarming Function</option>
                      <option value="Corporate">Corporate Annual Day</option>
                      <option value="College Cultural">College Cultural Fest</option>
                      <option value="Other">Other Special Occasion</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                      {activeCategory === 'bridal-makeup'
                        ? 'Required Ready / Finish Time *'
                        : activeCategory === 'catering'
                        ? 'Meal Serving Time *'
                        : activeCategory === 'decor-floral'
                        ? 'Setup Completion Deadline *'
                        : 'Event Start Time'}
                    </label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 2: DYNAMIC SERVICE-SPECIFIC REQUIREMENTS
              ────────────────────────────────────────────────────────────── */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <h4
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--color-primary-dark)',
                    margin: '0 0 12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={15} /> 2. Service-Specific Requirements
                </h4>

                {/* ── 2A: BRIDAL MAKEUP & STYLING ── */}
                {activeCategory === 'bridal-makeup' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* People Requiring Makeup */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)' }}>
                          Who Needs Makeup? (Select all that apply) *
                        </label>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                          Total: {calculateMakeupPeopleCount()} {calculateMakeupPeopleCount() === 1 ? 'Person' : 'People'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                        {[
                          { key: 'bride', label: 'Bride' },
                          { key: 'motherOfBride', label: 'Mother of the Bride' },
                          { key: 'motherOfGroom', label: 'Mother of the Groom' },
                          { key: 'sister', label: 'Sisters / Bridesmaids' },
                          { key: 'groom', label: 'Groom (Grooming)' },
                          { key: 'other', label: 'Other Family Members' }
                        ].map((item) => (
                          <div
                            key={item.key}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: makeupRoles[item.key]
                                ? '1.5px solid var(--color-primary)'
                                : '1px solid var(--color-border)',
                              background: makeupRoles[item.key] ? 'var(--color-primary-light)' : '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                margin: 0
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={makeupRoles[item.key]}
                                onChange={(e) => {
                                  setMakeupRoles({ ...makeupRoles, [item.key]: e.target.checked });
                                }}
                              />
                              {item.label}
                            </label>

                            {makeupRoles[item.key] && item.key !== 'bride' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={makeupRoleCounts[item.key]}
                                  onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                                    setMakeupRoleCounts({ ...makeupRoleCounts, [item.key]: val });
                                  }}
                                  style={{
                                    width: '44px',
                                    padding: '2px 4px',
                                    fontSize: '0.8rem',
                                    textAlign: 'center'
                                  }}
                                />
                                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>qty</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Number of Makeup Looks */}
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                        Number of Makeup Looks / Occasions *
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        {[
                          { val: '1 Look', desc: 'Muhurtham or Reception Only' },
                          { val: '2 Looks', desc: 'Muhurtham + Reception' },
                          { val: '3+ Looks', desc: 'Engagement + Wedding + Reception' }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setMakeupLooks(opt.val)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: makeupLooks === opt.val
                                ? '2px solid var(--color-primary)'
                                : '1px solid var(--color-border)',
                              background: makeupLooks === opt.val ? 'var(--color-primary-light)' : '#FFFFFF',
                              textAlign: 'left',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-title)' }}>
                              {opt.val}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                              {opt.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Makeup Location Type */}
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                        Service Delivery Location *
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setMakeupLocationType('venue')}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: makeupLocationType === 'venue' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            background: makeupLocationType === 'venue' ? 'var(--color-primary-light)' : '#FFFFFF',
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-title)' }}>
                            At Customer's Venue / Home
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            Artist travels to marriage hall or hotel suite
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMakeupLocationType('studio')}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: makeupLocationType === 'studio' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            background: makeupLocationType === 'studio' ? 'var(--color-primary-light)' : '#FFFFFF',
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-title)' }}>
                            At Vendor's Studio
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            {vendor.address || `${vendor.city} Studio`}
                          </div>
                        </button>
                      </div>

                      {makeupLocationType === 'venue' ? (
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-body)', display: 'block', marginBottom: '4px' }}>
                            Getting-Ready Address / Room Details *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Kongu Mahal Bride Room, Avinashi Road, Coimbatore"
                            value={makeupGettingReadyAddress}
                            onChange={(e) => setMakeupGettingReadyAddress(e.target.value)}
                          />
                        </div>
                      ) : (
                        <div style={{ padding: '8px 12px', background: 'var(--color-bg-page)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          📍 Service will take place at artist's studio: <strong>{vendor.address || `${vendor.city}, Tamil Nadu`}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── 2B: MARRIAGE HALL & VENUES ── */}
                {activeCategory === 'venues' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Fixed Venue Card — Address Already Known, NO re-entry! */}
                    <div
                      style={{
                        padding: '14px 16px',
                        background: 'var(--color-primary-light)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--color-primary-soft)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-dark)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                        <Building2 size={16} /> Selected Venue Location (Pre-verified)
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-title)' }}>
                        {vendor.business_name}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-body)', marginTop: '2px' }}>
                        📍 {vendor.address || `${vendor.city}, Tamil Nadu`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        ℹ️ Venue address is already saved. You do not need to re-enter this address.
                      </div>
                    </div>

                    {/* Expected Guest Count (Crucial for Hall Capacity!) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Expected Guest Count * (Capacity Planning)
                        </label>
                        <input
                          type="number"
                          required
                          min="50"
                          max="5000"
                          placeholder="e.g. 400"
                          value={venueGuestCount}
                          onChange={(e) => setVenueGuestCount(e.target.value)}
                        />
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                          Essential for seating and dining hall allotment.
                        </span>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Booking Slot / Duration *
                        </label>
                        <select value={venueSlot} onChange={(e) => setVenueSlot(e.target.value)}>
                          <option value="Full Day (Morning 6 AM - Night 10 PM)">Full Day (6 AM - 10 PM)</option>
                          <option value="Morning Muhurtham Slot (5 AM - 2 PM)">Morning Muhurtham Slot (5 AM - 2 PM)</option>
                          <option value="Evening Reception Slot (3 PM - 11 PM)">Evening Reception Slot (3 PM - 11 PM)</option>
                          <option value="2-Day Wedding Package">2-Day Wedding Package (Eve + Muhurtham)</option>
                        </select>
                      </div>
                    </div>

                    {/* Facilities Required */}
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                        Required Hall Facilities & Amenities
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
                        {[
                          { key: 'acHall', label: 'Central Air Conditioning' },
                          { key: 'diningHall', label: 'Separate Dining Hall (300+ seats)' },
                          { key: 'dressingRooms', label: 'AC Bride & Groom Suites' },
                          { key: 'kitchen', label: 'Kitchen & Cooking Utensils' },
                          { key: 'parking', label: 'Dedicated Car Parking Area' },
                          { key: 'generatorBackup', label: 'Full Generator Power Backup' }
                        ].map((f) => (
                          <label
                            key={f.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.8rem',
                              color: 'var(--color-text-body)',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={venueFacilities[f.key]}
                              onChange={(e) => setVenueFacilities({ ...venueFacilities, [f.key]: e.target.checked })}
                            />
                            {f.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 2C: PHOTOGRAPHY & VIDEOGRAPHY ── */}
                {activeCategory === 'photography' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Coverage Scope *
                        </label>
                        <select value={photoScope} onChange={(e) => setPhotoScope(e.target.value)}>
                          <option value="Both Photography & Videography">Both Photography & Videography</option>
                          <option value="Photography Only">Photography Only</option>
                          <option value="Cinematic Videography Only">Cinematic Videography Only</option>
                          <option value="Candid Photography Only">Candid Photography Only</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Number of Event Days
                        </label>
                        <select value={photoDays} onChange={(e) => setPhotoDays(e.target.value)}>
                          <option value="1 Day">1 Day (Wedding or Reception)</option>
                          <option value="2 Days">2 Days (Pre-wedding + Wedding)</option>
                          <option value="3+ Days">3+ Days (Extended Festivities)</option>
                        </select>
                      </div>
                    </div>

                    {/* Deliverables required */}
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                        Deliverables & Features Required
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
                        {[
                          { key: 'printedAlbum', label: 'Premium 40-Page Album' },
                          { key: 'candidShoots', label: 'Dedicated Candid Photographer' },
                          { key: 'traditionalStage', label: 'Traditional Stage Coverage' },
                          { key: 'cinematicTeaser', label: 'Cinematic Teaser & Full Video' },
                          { key: 'droneCoverage', label: 'Drone Aerial Shoot' }
                        ].map((d) => (
                          <label
                            key={d.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.8rem',
                              color: 'var(--color-text-body)',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={photoDeliverables[d.key]}
                              onChange={(e) => setPhotoDeliverables({ ...photoDeliverables, [d.key]: e.target.checked })}
                            />
                            {d.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                        Special Moments & Shot Preferences
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Traditional muhurtham timing, couple portrait session before reception"
                        value={photoSpecialShots}
                        onChange={(e) => setPhotoSpecialShots(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* ── 2D: CATERING & FOOD SERVICES ── */}
                {activeCategory === 'catering' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Expected Plates / Guests *
                        </label>
                        <input
                          type="number"
                          required
                          min="20"
                          max="10000"
                          placeholder="e.g. 350"
                          value={cateringPlates}
                          onChange={(e) => setCateringPlates(e.target.value)}
                        />
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Essential for pricing</span>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Meal Session *
                        </label>
                        <select value={cateringMealType} onChange={(e) => setCateringMealType(e.target.value)}>
                          <option value="Lunch">Lunch Feast</option>
                          <option value="Dinner">Evening Dinner</option>
                          <option value="Breakfast">Morning Breakfast / Tiffin</option>
                          <option value="High Tea & Evening Snacks">High Tea & Evening Snacks</option>
                          <option value="Full Day All Meals">Full Day All Meals</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Food Preference *
                        </label>
                        <select value={cateringFoodType} onChange={(e) => setCateringFoodType(e.target.value)}>
                          <option value="Pure Vegetarian">Pure Vegetarian</option>
                          <option value="Non-Vegetarian">Non-Vegetarian</option>
                          <option value="Mixed (Separate Counters)">Mixed (Separate Counters)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Serving Style
                        </label>
                        <select value={cateringServingStyle} onChange={(e) => setCateringServingStyle(e.target.value)}>
                          <option value="Traditional Banana Leaf Feast">Traditional Banana Leaf Feast</option>
                          <option value="Grand Buffet Counter">Grand Buffet Counter</option>
                          <option value="Live Counters (Dosa, Chaat, Tandoor)">Live Counters (Dosa, Chaat, Tandoor)</option>
                          <option value="Seated Table Service">Seated Table Service</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Special Dietary / Menu Notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Jain food for 15 guests, live filter coffee"
                          value={cateringDietaryNotes}
                          onChange={(e) => setCateringDietaryNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 2E: STAGE & FLOWER DECORATION ── */}
                {activeCategory === 'decor-floral' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                        Decoration Areas Required
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
                        {[
                          { key: 'stageMandapam', label: 'Wedding Stage Mandapam' },
                          { key: 'entranceArch', label: 'Grand Entrance Floral Arch' },
                          { key: 'receptionBackdrop', label: 'Reception Backdrop with Lights' },
                          { key: 'diningArea', label: 'Dining Area Floral Hangings' },
                          { key: 'pathwayWalkway', label: 'Aisle / Pathway Walkway' },
                          { key: 'photoBooth', label: 'Selfie Booth / Photo Backdrop' }
                        ].map((item) => (
                          <label
                            key={item.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.8rem',
                              color: 'var(--color-text-body)',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={decorAreas[item.key]}
                              onChange={(e) => setDecorAreas({ ...decorAreas, [item.key]: e.target.checked })}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Theme / Decoration Style
                        </label>
                        <select value={decorTheme} onChange={(e) => setDecorTheme(e.target.value)}>
                          <option value="Traditional South Indian Temple Floral">Traditional South Indian Temple Floral</option>
                          <option value="Pastel Modern Floral">Pastel Modern Floral</option>
                          <option value="Royal Grandeur with Chandeliers">Royal Grandeur with Chandeliers</option>
                          <option value="Contemporary Minimalist">Contemporary Minimalist</option>
                          <option value="Lavender & White Signature Theme">Lavender & White Signature Theme</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Flower & Material Preferences
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Fresh Jasmine, Marigold, Lotus & Roses"
                          value={flowerMaterials}
                          onChange={(e) => setFlowerMaterials(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 2F: DJ, SOUND & LIGHTING ── */}
                {activeCategory === 'music-dj' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                        Equipment & Services Scope
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
                        {[
                          { key: 'djPerformance', label: 'DJ Performance & Live Mixing' },
                          { key: 'soundSystem', label: 'JBL Line Array Speakers & Subs' },
                          { key: 'stageLighting', label: 'Moving Heads & Stage Spotlights' },
                          { key: 'movingHeads', label: 'Dance Floor Laser & Fog Machine' },
                          { key: 'wirelessMics', label: 'Wireless Cordless Microphones' }
                        ].map((item) => (
                          <label
                            key={item.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.8rem',
                              color: 'var(--color-text-body)',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={djScope[item.key]}
                              onChange={(e) => setDjScope({ ...djScope, [item.key]: e.target.checked })}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Venue Type
                        </label>
                        <select value={djVenueType} onChange={(e) => setDjVenueType(e.target.value)}>
                          <option value="Indoor AC Hall">Indoor AC Hall</option>
                          <option value="Outdoor Lawn / Open Air">Outdoor Lawn / Open Air</option>
                          <option value="Covered Banquet Terrace">Covered Banquet Terrace</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Performance Duration
                        </label>
                        <select value={djDurationHours} onChange={(e) => setDjDurationHours(e.target.value)}>
                          <option value="3 Hours">3 Hours</option>
                          <option value="4 Hours">4 Hours (Standard)</option>
                          <option value="6 Hours">6 Hours (Full Evening)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                          Audience / Crowd Size
                        </label>
                        <input
                          type="number"
                          value={djCrowdSize}
                          onChange={(e) => setDjCrowdSize(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 2G: EVENT PLANNING ── */}
                {activeCategory === 'event-planning' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                        Planning & Coordination Scope
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
                        {[
                          { key: 'fullPlanning', label: 'Full End-to-End Planning' },
                          { key: 'dayOfCoordination', label: 'On-Day Coordination & Stage Flow' },
                          { key: 'vendorManagement', label: 'Vendor Sourcing & Management' },
                          { key: 'decorDirection', label: 'Theme & Aesthetic Direction' }
                        ].map((item) => (
                          <label
                            key={item.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.8rem',
                              color: 'var(--color-text-body)',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={planningScope[item.key]}
                              onChange={(e) => setPlanningScope({ ...planningScope, [item.key]: e.target.checked })}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 3: SERVICE LOCATION (SMART & ADAPTIVE)
                  (Do not ask customer for address if service is at fixed venue or studio)
              ────────────────────────────────────────────────────────────── */}
              {activeCategory !== 'venues' && (activeCategory !== 'bridal-makeup' || makeupLocationType === 'venue') && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <h4
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--color-primary-dark)',
                      margin: '0 0 12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <MapPin size={15} /> 3. Service Location
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                        Venue Name / Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kongu Mahal, Avinashi Road or Residential Address"
                        value={venueLocation}
                        onChange={(e) => setVenueLocation(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Coimbatore, Tiruppur, Erode"
                        value={eventCity}
                        onChange={(e) => setEventCity(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 4: BUDGET & SPECIAL NOTES
              ────────────────────────────────────────────────────────────── */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <h4
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--color-primary-dark)',
                    margin: '0 0 12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <DollarSign size={15} /> 4. Budget & Special Requests
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                      Proposed Budget / Offer (₹ INR)
                    </label>
                    <input
                      type="number"
                      placeholder={`e.g. ${vendor.starting_price || 25000}`}
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                      Vendor starting price: ₹{parseFloat(vendor.starting_price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                      Additional Requirements & Vision Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Share any special timing preferences, customs, or expectations..."
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '12px',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '16px',
                  marginTop: '8px'
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline btn-sm"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                  style={{ minWidth: '160px' }}
                >
                  {submitting ? 'Sending Request...' : 'Send Booking Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicBookingModal;
