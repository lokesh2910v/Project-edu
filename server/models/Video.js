import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  youtubeUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Simple validation for YouTube URL
        return /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/.test(v);
      },
      message: props => `${props.value} is not a valid YouTube URL!`
    }
  },
  order: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure unique ordering within a module
VideoSchema.index({ moduleId: 1, order: 1 }, { unique: true });

const Video = mongoose.model('Video', VideoSchema);

export default Video;