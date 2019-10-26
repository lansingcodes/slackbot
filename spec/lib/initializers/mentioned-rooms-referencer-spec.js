const TextMessage = require('hubot/src/message').TextMessage;

describe('mentioned-rooms-referencer', () => {
  includeHubot();

  beforeEach(() => {
    require('../../../lib/initializers/mentioned-rooms-referencer')(robot);

    // A fake Slack RTM client for mocking
    robot.adapter.client = {
      rtm: {
        dataStore: {
          getChannelByName: () => null,
          getChannelById: () => null
        }
      }
    };
  });

  it('sends a notification to a room when it is mentioned elsewhere', done => {
    const mentionedChannel = {
      id: 'C024BE91L',
      name: 'test',
      created: 1360782804,
      creator: 'U024BE7LH'
    };
    const currentChannel = {
      id: 'C124BE91L',
      name: 'jasmine',
      created: 1360782805,
      creator: 'U124BE7LH'
    };

    // Pretend Slack says the current and mentioned channels are different
    spyOn(robot.adapter.client.rtm.dataStore,
      'getChannelByName').and.returnValue(mentionedChannel);
    spyOn(robot.adapter.client.rtm.dataStore,
      'getChannelById').and.returnValue(currentChannel);

    // Expect a cross-reference message when the current channel is mentioned
    robot.adapter.on('send', (envelope, strings) => {
      expect(envelope.room).toEqual('C024BE91L');
      expect(strings[0]).toEqual(
        'This channel was just referenced at: https://lansingcodes.slack.com/archives/C124BE91L/p1571842414003900');
      done();
    });

    // Mention a the current channel
    robot.adapter.receive(new TextMessage(
      {name: 'jasmine', room: 'jasmine'},
      'This is a reference to the #jasmine room.',
      '1571842414003900'));
  });

  it('does NOT send a notification when the current room is mentioned', () => {
    let messageWasSent = false;
    const currentChannel = {
      id: 'C124BE91L',
      name: 'jasmine',
      created: 1360782805,
      creator: 'U124BE7LH'
    };

    // Pretend Slack says the current and mentioned channels are the same
    spyOn(robot.adapter.client.rtm.dataStore,
      'getChannelByName').and.returnValue(currentChannel);
    spyOn(robot.adapter.client.rtm.dataStore,
      'getChannelById').and.returnValue(currentChannel);

    // Expect to fail if the bot makes a cross-reference
    jasmine.clock().install();
    robot.adapter.on('send', (envelope, strings) => {
      messageWasSent = true;
      fail('We should not cross-reference the same channel.');
    });

    // Mention the current channel
    robot.adapter.receive(new TextMessage(
      {name: 'jasmine', room: 'jasmine'},
      'This is a reference to the #jasmine room.',
      '1571842414003900'));

    // Wait to verify that nothing explodes
    jasmine.clock().tick(1000);
    expect(messageWasSent).toBe(false);
    jasmine.clock().uninstall();
  });
});
