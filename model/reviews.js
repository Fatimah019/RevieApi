const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const reviewSchema = new Schema({
  reviwavatarorvid: [{ type: String }],
  landlordinfo: { type: String },
  locationofapartment: { type: String },
  amenitiesquality: { type: String },
  marks: { type: String },
  date: { type: Date, required: true, default: Date.now },
});

module.exports = Mongoose.model("Review", reviewSchema);
