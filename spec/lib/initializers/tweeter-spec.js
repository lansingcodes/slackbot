const includeHubot = require('../../helpers/include-hubot')
const proxyquire = require('proxyquire').noCallThru()
const { TextMessage } = require('hubot')

describe('tweeter', () => {
  includeHubot()

  describe('when the user is authorized', () => {
    describe('and the tweet is sent successfully', () => {
      it('notifies success.', done => {
        // Mock our helper function interactions
        const mockTweetHelper = (text, errFn, succFn) => succFn()
        const mockGetDeniedGifHelper = () => 'foo'
        const registerTweeter = proxyquire(
          '../../../lib/initializers/tweeter',
          {
            '../helpers/tweet': mockTweetHelper,
            '../helpers/get-denied-gif': mockGetDeniedGifHelper
          }
        )

        // Register our mocked registration function with the robot
        registerTweeter(robot)

        // Listen for expected response
        robot.adapter.on('send', (envelope, strings) => {
          const response = strings[0]
          expect(response).toEqual('Tweet sent!')
          done()
        })

        // Trigger response
        robot.adapter.receive(
          new TextMessage(
            { name: 'chrisvfritz', room: 'test' },
            'slackbot tweet hello world'
          )
        )
      })
    })

    describe('and the tweet cannot be sent', () => {
      it('notifies failure with the error message.', done => {
        // Mock our helper function interactions
        const mockTweetHelper = (text, errFn, succFn) => errFn('ow')
        const mockGetDeniedGifHelper = () => 'foo'
        const registerTweeter = proxyquire(
          '../../../lib/initializers/tweeter',
          {
            '../helpers/tweet': mockTweetHelper,
            '../helpers/get-denied-gif': mockGetDeniedGifHelper
          }
        )

        // Register our mocked registration function with the robot
        registerTweeter(robot)

        // Listen for expected response
        robot.adapter.on('send', (envelope, strings) => {
          const response = strings[0]
          expect(response).toEqual('Tweet failed. :-( Error: ow')
          done()
        })

        // Trigger response
        robot.adapter.receive(
          new TextMessage(
            { name: 'chrisvfritz', room: 'test' },
            'slackbot tweet hello world'
          )
        )
      })
    })
  })

  describe('when the user is not authorized', () => {
    it('rejects with a gif and the list of authorized tweeters.', done => {
      // Mock our helper function interactions
      const mockTweetHelper = (text, errFn, succFn) => succFn()
      const mockGetDeniedGifHelper = () => 'foo'
      const registerTweeter = proxyquire('../../../lib/initializers/tweeter', {
        '../helpers/tweet': mockTweetHelper,
        '../helpers/get-denied-gif': mockGetDeniedGifHelper
      })

      // Register our mocked registration function with the robot
      registerTweeter(robot)

      // Listen for expected response
      robot.adapter.on('send', (envelope, strings) => {
        const response = strings[0]
        expect(response).toEqual(
          'No tweet for you!\nfoo\nOnly the following users have access: chrisvfritz, davin, leo, erik.gillespie, katiemfritz'
        )
        done()
      })

      // Trigger response
      robot.adapter.receive(
        new TextMessage(
          { name: 'a.peon', room: 'test' },
          'slackbot tweet hello world'
        )
      )
    })
  })
})
