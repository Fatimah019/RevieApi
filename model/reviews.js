const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const reviewSchema = new Schema({
  location: { type: String },
  housetype: { type: String },
  reviewimageorvideo: { type: String },
  landlordname: { type: String },
  landlordstateoforigin: { type: String },
  landlordoccupation: { type: String },
  NoOfOccupants: { type: Number },
  electricityavailability: { type: Boolean },
  wateravailability: { type: Boolean },
  areaType: { type: String },
  distancetoroad: { type: String },
  helpfulmarks: { type: Number },
  iquser: [{ type: Schema.Types.ObjectId, ref: "IqUser" }],
});

module.exports = Mongoose.model("Review", reviewSchema);
