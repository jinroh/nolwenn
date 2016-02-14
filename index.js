module.exports = {
  initialStage: "embrasee",
  stages: [
    require("./embrasee"),
    require("./apellis"),
    require("./convenances"),
    require("./chrysalide"),
  ],
};
