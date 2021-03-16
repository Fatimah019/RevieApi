const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const iqUsersReviewSchema = new Schema({
  location: { type: String },
  housetype: { type: String },
  reviewimageorvideo: [{ type: String }],
  landlordname: { type: String },
  landlordstateoforigin: { type: String },
  landlordoccupation: { type: String },
  NoOfOccupants: { type: Number },
  electricityavailability: { type: Boolean },
  wateravailability: { type: Boolean },
  areaType: { type: String },
  distancetoroad: { type: String },
  helpfulmarks: { type: Number },
  date: { type: Date, required: true, default: Date.now },
});

module.exports = Mongoose.model("IqUserReview", iqUsersReviewSchema);
