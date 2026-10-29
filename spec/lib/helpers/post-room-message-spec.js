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
})
