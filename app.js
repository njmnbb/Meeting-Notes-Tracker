const {token, zoomLink, meetingNotesLink, dateAndTimeMongoID, discordTextChannel} = require("./config.json");
const Discord = require("discord.js");
const cron = require("node-cron");
const bot = new Discord.Client();
const mongoConnectionService = require('./mongoConnectionService');
const mongoose = require('mongoose');
const MeetingInformation = require('./models/MeetingInformation');
const express = require('express');
const path = require('path');
const { Console } = require("console");
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Connecting to MongoDB
mongoConnectionService.connect();

// Setting Express schtuff
app.set('views', path.join(__dirname, '/views/'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Redirects user to meeting notes update form
app.get('/meeting-notes', function(request, response) {
    response.sendFile(path.join(app.get('views') + 'meeting-notes.html'));
});

// Updates cron job with requested time and date
app.post('/update', async function(request, response) {

    // Stopping and removing previous task
    let tasks = cron.getTasks();
    tasks[0].stop();
    tasks.splice(0, 1);

    // Check if request is valid
    if(request.body.date_field != undefined && request.body.time_field != '') {

        // Store new date and time in Mongo
        await MeetingInformation.updateOne({ _id: dateAndTimeMongoID }, createMeetingUpdateObject(request));

        // Update cron job with new date and time
        scheduleCronJob();

        // Return new date and time
        response.status(200).send(`Meeting notification updated to run every ${request.body.date_field} at ${request.body.time_field}`);
    } else {
        response.status(400).send("Missing date or time");
    }
});

// Returns the current meeting schedule from the DB
app.get('/fetchCurrentMeetingSchedule', async function(request, response) {
    getCurrentMeetingSchedule()
        .then(result => response.send(result))
        .catch(error => response.status(500).send(error));
});

bot.login(token);

bot.on('ready', function() {
    scheduleCronJob();
});

bot.on('message', async (message) => {
    if(message.content === '!schedule') {
        const schedule = await getCurrentMeetingSchedule();
        message.channel.send(`Meetings occur every ${schedule.meetingDate} at ${schedule.meetingTime}`);
    }
});

async function scheduleCronJob() {
    let currentMeetingSchedule = await getCurrentMeetingSchedule();
    const cronSyntax = createCronSyntax( currentMeetingSchedule );

    const task = cron.schedule(cronSyntax, () => {
        const currentMeetingDate = getMeetingDate(false);
        const futureMeetingDate = getMeetingDate(true);
        
        bot.channels.cache.get(discordTextChannel)
            .send(`@OG Cat Pissers

Every topic below this message will be discussed at the weekly Cat Piss meeting on ${futureMeetingDate}.

Weekly meeting can be joined here: ${zoomLink}.

Meeting notes can be found here: ${meetingNotesLink}.

All topics above this message have been, or will be, discussed at the meeting on ${currentMeetingDate}.
            
**Please include all meeting topics for the ${futureMeetingDate} meeting below this message.**`);
    }, {
        scheduled: true,
        timezone: 'America/Chicago'
    });

    task.start();
}

function createCronSyntax(dateAndTime) {
    const meetingTime = dateAndTime.meetingTime.split(':');
    return `0 ${meetingTime[1]} ${meetingTime[0]} * * ${dateAndTime.meetingDate}`;
}

function getMeetingDate(isFutureMeeting) {
    let date = new Date();
    isFutureMeeting ? date.setDate(date.getDate() + 7) : null;
    return date.toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
}

function createMeetingUpdateObject(request) {
    const updatedMeetingDateTime = {};

    if(request.body.date_field != undefined) updatedMeetingDateTime.meetingDate = request.body.date_field;
    if(request.body.time_field != '') updatedMeetingDateTime.meetingTime = request.body.time_field;
    
    return updatedMeetingDateTime;
}

async function getCurrentMeetingSchedule() {
    const meetingSchedule = await MeetingInformation.findOne({ _id: dateAndTimeMongoID });
    return meetingSchedule;
}

app.listen(port, () => {
    console.log('Listening on port 3000');
});