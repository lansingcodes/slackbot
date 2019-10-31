if (process.env.GOOGLE_API_KEY && !process.env.CIRCLECI) {
  const urlExpander = require('expand-url')

  describe('welcome-email', () => {
    let emailUrl
    const event = {
      name: "Today's new JavaScript framework",
      group: 'javascript',
      description: 'tbd',
      url: 'meetup.com',
      venue: 'the moon',
      address: '1 solar system way',
      startTime: Date.now()
    }

    beforeEach(done => {
      require('../../../lib/templates/welcome-email')(event, shortUrl => {
        emailUrl = shortUrl
        done()
      })
    })

    it('returns a Google short URL', () => {
      expect(emailUrl).toMatch('http://goo.gl/')
    })

    describe('the short url', () => {
      let expandedUrl

      beforeEach(done => {
        urlExpander.expand(emailUrl, (error, longUrl) => {
          expect(error).toBeUndefined()
          expandedUrl = longUrl
          done()
        })
      })

      it('expands to a link to the JS event on meetup.com', () => {
        expect(
          expandedUrl.replace(
            /today%27s%20\d+%3A\d+[ap]m%20meetup/,
            'today%27s%20%20meetup'
          )
        ).toEqual(
          'http://www.meetup.com/Lansing-Javascript-Meetup/messages/send/?who=oneevent&eventId=222664930&boards=1&subject=JavaScript%20Hack%20Night%20Today!&body=%3Cp%3EFellow%20JSers%2C%3C%2Fp%3E%3Cp%3EThank%20you%20for%20your%20RSVP%20for%20today%27s%20%20meetup.%20We%27re%20going%20to%20have%20a%20great%20crowd!%20I%27m%20pretty%20excited%20to%20see%20SOMETHING_EXCITING.%3C%2Fp%3E%3Cp%3E%3Cstrong%3EHow%20to%20find%20us%3C%2Fstrong%3E%3C%2Fp%3E%3Cp%3EIf%20this%20is%20your%20first%20time%20and%20you%20need%20help%20getting%20to%20our%20group%2C%20be%20sure%20to%20park%20in%20%3Ca%20href%3D%22https%3A%2F%2Fwww.google.com%2Fmaps%2F%4042.734268%2C-84.480879%2C3a%2C75y%2C170.84h%2C85.88t%2Fdata%3D!3m6!1e1!3m4!1sd_i04cP0uHvJdD9MbRm6Zw!2e0!7i13312!8i6656%22%3Ethe%20MSU%20parking%20structure%3C%2Fa%3E%20across%20the%20street%20-%20it%27s%20free%20after%206pm!%20Then%20%3Ca%20href%3D%22https%3A%2F%2Fwww.google.com%2Fmaps%2F%4042.734483%2C-84.480627%2C3a%2C75y%2C29.57h%2C89.85t%2Fdata%3D!3m7!1e1!3m5!1sVPGJPxSePSIAAAQfCOpZDA!2e0!3e2!7i13312!8i6656%22%3Ewalk%20through%20these%20doors%3C%2Fa%3E%2C%20take%20the%20elevators%20at%20the%20end%20of%20the%20hall%20to%20the%203rd%20floor%2C%20and%20we%27ll%20be%20directly%20to%20your%20left%20when%20you%20exit%20the%20elevator.%3C%2Fp%3E%3Cp%3EIf%20you%20still%20need%20help%2C%20simply%20reply%20to%20this%20email%20or%20feel%20free%20to%20text%20or%20call%20Chris%20Fritz%20at%20(517)%20803-9346.%3C%2Fp%3E%3Cp%3E%3Cstrong%3EWhat%20to%20bring%3C%2Fstrong%3E%3C%2Fp%3E%3Cp%3EMany%20people%20choose%20to%20bring%20a%20laptop%2C%20as%20there%20are%20often%20opportunities%20to%20code%20along.%20If%20that%27s%20a%20pain%2C%20all%20you%20really%20need%20is%20yourself%20and%20an%20appetite%20for%20knowledge.%3C%2Fp%3E%3Cp%3EAs%20for%20attire%2C%20we%27re%20not%20even%20business%20casual%20-%20it%27s%20casual%20casual.%20Though%20you%20can%20wear%20a%20fancy%20dress%20or%20nice%20suit%20too.%20That%20would%20also%20be%20OK.%20%3A-)%3C%2Fp%3E%3Cp%3E%3Cstrong%3EFood%20and%20drink%20options%3C%2Fstrong%3E%3C%2Fp%3E%3Cp%3EWe%27ll%20have%20Cottage%20Inn%20pizza%20(plain%20cheese%20and%20usually%20also%20pepperoni)%2C%20Chardonnay%2C%20Blue%20Moon%2C%20Sprite%2C%20and%20there%27s%20a%20water%20fountain%20where%20you%20can%20fill%20up%20a%20cup.%20If%20these%20options%20don%27t%20work%20for%20you%2C%20it%27s%20totally%20cool%20to%20bring%20something%20else%20for%20yourself.%3C%2Fp%3E%3Cp%3E%3Cstrong%3EPsst.%20Over%20here.%20I%27ve%20got%20a%20proposition%20for%20ya.%3C%2Fstrong%3E%3C%2Fp%3E%3Cp%3EWe%27d%20love%20for%20you%20(yes%2C%20you!)%20to%20reach%20out%20to%20the%20community%20and%20show%20us%20what%20you%27re%20excited%20about.%20It%20could%20be%20a%20quick%20topic%20(10-20%20minutes)%20or%20a%20longer%20presentation%20(30-60%20minutes).%20It%20could%20be%20focused%20on%20A_FEW_TOPIC_SUGGESTIONS%2C%20or%20whatever%20else%20you%27re%20into.%3C%2Fp%3E%3Cp%3EThis%20is%20a%20great%20opportunity%20to%3A%3C%2Fp%3E%3Cul%3E%3Cli%3E%3Cstrong%3Epractice%20presenting%3C%2Fstrong%3E%20with%20a%20friendly%20crowd%3C%2Fli%3E%3Cli%3E%3Cstrong%3Ehelp%20our%20community%3C%2Fstrong%3E%20learn%20from%20your%20experience%3C%2Fli%3E%3Cli%3E%3Cstrong%3Eshare%20your%20passions%3C%2Fstrong%3E%20and%20meet%20others%20passionate%20about%20the%20same%20topics%3C%2Fli%3E%3C%2Ful%3E%3Cp%3EIf%20you%27ve%20never%20presented%20before%2C%20don%27t%20worry%2C%20we%20love%20first-time%20presenters!%20If%20you%27re%20nervous%20and%20would%20like%20some%20feedback%20before%20you%20present%2C%20we%27re%20also%20happy%20to%20meet%20with%20you%20and%20help%20you%20refine%20it.%20Reply%20to%20this%20discussion%20or%20send%20me%20a%20message%20with%20your%20topic%20idea%20and%20we%27ll%20work%20out%20a%20date.%3C%2Fp%3E%3Cp%3ESee%20you%20soon%2C%3C%2Fp%3E%3Cp%3ELeo%3C%2Fp%3E'
        )
      })
    })
  })
}
