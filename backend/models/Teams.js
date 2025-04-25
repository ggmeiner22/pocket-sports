const mongoose = require('mongoose')

const TeamsSchema = new mongoose.Schema({
    teamName: String,
    organizationName: String,
    teamColors: Array,
    selectedSport: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
    teamCode: { type: String, unique: true },
    extraInfoVisibility: {
        showPosition: { type: Boolean, default: true },
        showHeight: { type: Boolean, default: true },
        showWeight: { type: Boolean, default: true }
      }
});

const TeamsModel = mongoose.model("teams", TeamsSchema);
module.exports = TeamsModel;