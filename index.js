module.exports = {
  initialStage: "embrasee",
  stages: [
    require("./embrasee"),
    require("./convenances"),
    require("./chrysalide"),
    require("./apellis"),
  ],
};
