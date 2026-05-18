const { Review, Complaint } = require("../models");

exports.createReview = async (req, res) => {
  try {
    const review = await Review.create({
      userId: req.user.id,
      providerId: req.body.providerId,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    return res.status(201).json({
      success: true,
      review,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({
      userId: req.user.id,
      consultationId: req.body.consultationId,
      category: req.body.category,
      message: req.body.message,
      status: "open",
    });

    return res.status(201).json({
      success: true,
      complaint,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      data: complaints,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
