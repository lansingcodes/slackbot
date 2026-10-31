const EventEmitter = require('events')
const includeHubot = require('../../helpers/include-hubot')

describe('watch-for-disconnected', () => {
  includeHubot()

  beforeEach(() => {
    robot.adapter.client = { socket: new EventEmitter() }
    require('../../../lib/initializers/watch-for-disconnected')(robot)
    spyOn(process, 'exit')
    jasmine.clock().install()
  })

  afterEach(() => jasmine.clock().uninstall())

  it('exits after a lost connection is not restored', () => {
    robot.adapter.client.socket.emit('close')
    jasmine.clock().tick(20001)
    expect(process.exit).toHaveBeenCalledOnceWith(1)
  })

  it('does not exit when the connection returns', () => {
    robot.adapter.client.socket.emit('close')
    robot.adapter.client.socket.emit('open')
    jasmine.clock().tick(20001)
    expect(process.exit).not.toHaveBeenCalled()
  })

  it('does not exit during normal shutdown', () => {
    robot.adapter.client.socket.shuttingDown = true
    robot.adapter.client.socket.emit('close')
    jasmine.clock().tick(20001)
    expect(process.exit).not.toHaveBeenCalled()
  })
})
