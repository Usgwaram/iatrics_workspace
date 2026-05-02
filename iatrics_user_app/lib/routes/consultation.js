router.get("/user/:userId", async (req, res) => {
  const sessions = await Session.findAll({
    where: {
      userId: req.params.userId,
      status: "ended",
    },
    order: [["createdAt", "DESC"]],
  });

  res.json(sessions);
});