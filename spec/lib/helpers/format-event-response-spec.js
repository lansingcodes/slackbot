const { upcomingEvents, nextEvent } = require('../../../lib/helpers/format-event-response')

describe('format-event-response', () => {
  const startTime = new Date('2026-11-06T20:00:00Z').valueOf()

  it('shows a readable event list with RSVP links and group names', () => {
    const text = upcomingEvents([{ group: 'ai', name: 'AI Office Hours', url: 'https://example.test/event', startTime }])
    expect(text).toContain('*Upcoming events*')
    expect(text).toContain('<https://example.test/event|AI Office Hours>')
    expect(text).toContain('ai · in ')
    expect(text).toContain('next GROUP event')
    expect(text).not.toContain('```')
  })

  it('escapes event text and does not create unsafe links', () => {
    const text = nextEvent({ group: 'ai', name: '<@U123> & friends', url: 'javascript:alert(1)', startTime })
    expect(text).toContain('&lt;@U123&gt; &amp; friends')
    expect(text).not.toContain('<javascript:')
  })
})
