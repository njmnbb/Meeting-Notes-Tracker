const {token, zoomLink, meetingNotesLink} = require("./config.json");
const Discord = require("discord.js");
const cron = require("node-cron");
const bot = new Discord.Client();

bot.login(token);

bot.on('ready', function() {
    
    const currentMeetingDate = getMeetingDate(false);
    const futureMeetingDate = getMeetingDate(true);

    cron.schedule('0 0 19 * * */2', () => {
        bot.channels.cache.get('776261999595356223')
            .send(`@everyone

Every topic below this message will be discussed at the weekly Cat Piss meeting on ${futureMeetingDate}.

Weekly meeting can be joined here: ${zoomLink}. Meeting notes can be found here: ${meetingNotesLink}.

All topics above this message have been, or will be, discussed at the meeting on ${currentMeetingDate}.
            
**Please include all meeting topics for the ${futureMeetingDate} meeting below this message*.*`);
    }, {
        scheduled: true,
        timezone: 'America/Chicago'
    });
})

function getMeetingDate(isFutureMeeting) {
    let date = new Date();
    isFutureMeeting ? date.setDate(date.getDate() + 7) : null;
    return new Intl.DateTimeFormat().format(date);
}