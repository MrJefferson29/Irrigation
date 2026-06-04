const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    dueAt: { type: Date, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true },
);

reminderSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Reminder", reminderSchema);
