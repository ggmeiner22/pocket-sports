const mongoose = require('mongoose')

const TeamsSchema = new mongoose.Schema({
    teamName: String,
    organizationName: String,
    teamColors: String,
    selectedSport: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
});

const TeamsModel = mongoose.model("teams", TeamsSchema);
module.exports = TeamsModel;