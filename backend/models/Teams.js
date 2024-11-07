const mongoose = require('mongoose')

const TeamsSchema = new mongoose.Schema({
    teamName: String,
    organizationName: String,
    teamColors: String,
    selectedSport: String
})

const TeamsModel = mongoose.model("teams", TeamsSchema);
module.exports = TeamsModel;