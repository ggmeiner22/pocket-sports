const mongoose = require('mongoose')

const TeamsSchema = new mongoose.Schema({
    teamName: String,
    organizationName: String,
    teamColors: Array,
    selectedSport: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Register' }
})

const TeamsModel = mongoose.model("teams", TeamsSchema);
module.exports = TeamsModel;