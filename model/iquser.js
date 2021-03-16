const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const iqUsersSchema = new Schema({
  email: { type: String },
  username: { type: String },
  password: { type: String },
  confirm_password: { type: String },
  avatar: { type: String },
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
});

module.exports = Mongoose.model("IqUser", iqUsersSchema);
