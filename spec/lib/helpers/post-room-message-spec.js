const postRoomMessage = require('../../../lib/helpers/post-room-message')

describe('post-room-message', () => {
  it('uses the Slack API and rejects a failed post', async () => {
    const postMessage = jasmine.createSpy('postMessage').and.resolveTo({ ok: false, error: 'not_in_channel' })
    const robot = {
      adapter: { client: { web: { chat: { postMessage } } } },
      messageRoom: jasmine.createSpy('messageRoom')
    }

    await expectAsync(postRoomMessage(robot, 'C123', 'Test reminder')).toBeRejectedWithError(
      'Slack rejected a message to C123: not_in_channel'
    )
    expect(postMessage).toHaveBeenCalledWith({
      channel: 'C123', text: 'Test reminder', unfurl_links: false, unfurl_media: false
    })
    expect(robot.messageRoom).not.toHaveBeenCalled()
  })

  it('classifies an explicit SDK platform rejection but leaves network failures uncertain', async () => {
    const postMessage = jasmine.createSpy('postMessage')
    const robot = { adapter: { client: { web: { chat: { postMessage } } } } }
    const rejected = Object.assign(new Error('not_in_channel'), {
      code: 'slack_webapi_platform_error', data: { ok: false, error: 'not_in_channel' }
    })
    postMessage.and.rejectWith(rejected)
    await expectAsync(postRoomMessage(robot, 'C123', 'Greeting')).toBeRejectedWithError(
      postRoomMessage.SlackPostRejectedError, /not_in_channel/
    )

    const network = new Error('connection reset')
    postMessage.and.rejectWith(network)
    await expectAsync(postRoomMessage(robot, 'C123', 'Greeting')).toBeRejectedWith(network)
  })
})
