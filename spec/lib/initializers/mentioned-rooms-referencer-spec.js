const includeHubot = require('../../helpers/include-hubot')
const { TextMessage } = require('hubot')

describe('mentioned-rooms-referencer', () => {
  let hubotRobot
  let webClient
  includeHubot()

  const buildWebClient = ({
    channels = [],
    currentChannel,
    permalink
  }) => ({
    conversations: {
      list: jasmine.createSpy('conversations.list').and.callFake(async ({ cursor }) => ({
        channels,
        response_metadata: cursor ? { next_cursor: '' } : {}
      })),
      info: jasmine.createSpy('conversations.info').and.callFake(async () => ({
        channel: currentChannel
      }))
    },
    chat: {
      getPermalink: jasmine.createSpy('chat.getPermalink').and.callFake(async () => ({
        permalink
      }))
    }
  })

  beforeEach(() => {
    hubotRobot = global.robot
    const modulePath = require.resolve('../../../lib/initializers/mentioned-rooms-referencer')
    delete require.cache[modulePath]
  })

  it('sends a notification to a room when it is mentioned elsewhere', done => {
    const mentionedChannel = {
      id: 'C024BE91L',
      name: 'test'
    }
    const currentChannel = {
      id: 'C124BE91L',
      name: 'jasmine'
    }
    const permalink = 'https://lansingcodes.slack.com/archives/C124BE91L/p1571842414003900'

    webClient = buildWebClient({
      channels: [mentionedChannel],
      currentChannel,
      permalink
    })

    hubotRobot.adapter.client = { web: webClient }

    require('../../../lib/initializers/mentioned-rooms-referencer')(hubotRobot)

    hubotRobot.adapter.on('send', (envelope, strings) => {
      expect(envelope.room).toEqual(mentionedChannel.id)
      expect(strings[0]).toEqual(
        `This channel was just referenced at: ${permalink}`
      )
      done()
    })

    hubotRobot.adapter.receive(
      new TextMessage(
        { name: 'jasmine', room: currentChannel.id },
        'This is a reference to the #test room.',
        '1571842414.003900'
      )
    )
  })

  it('does NOT send a notification when the current room is mentioned', done => {
    const currentChannel = {
      id: 'C124BE91L',
      name: 'jasmine'
    }

    webClient = buildWebClient({
      channels: [currentChannel],
      currentChannel,
      permalink: 'https://example.test'
    })

    hubotRobot.adapter.client = { web: webClient }

    require('../../../lib/initializers/mentioned-rooms-referencer')(hubotRobot)

    let messageWasSent = false

    hubotRobot.adapter.on('send', () => {
      messageWasSent = true
      done.fail('We should not cross-reference the same channel.')
    })

    hubotRobot.adapter.receive(
      new TextMessage(
        { name: 'jasmine', room: currentChannel.id },
        'This is a reference to the #jasmine room.',
        '1571842414.003900'
      )
    )

    setTimeout(() => {
      expect(messageWasSent).toBe(false)
      done()
    }, 0)
  })
})
