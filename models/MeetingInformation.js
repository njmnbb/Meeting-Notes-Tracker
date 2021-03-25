const mongoose = require('mongoose');
const {Schema} = mongoose;

const meetingInformation = new Schema({
    meetingDate: String,
    meetingTime: String,    
});

const MeetingInformation = mongoose.model('meetingInformation', meetingInformation, 'meeting-information');
module.exports = MeetingInformation;