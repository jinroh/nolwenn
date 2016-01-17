const find = require("lodash/collection/find");
const assets = require("../public");

const STAGES = assets.stages;

function findProject(stageId, projectId) {
  const stage = findStage(stageId);
  if (stage) {
    return find(stage.projects, proj => proj.projectId == projectId);
  }
}

function findStage(stageId) {
  return find(STAGES, stage => stage.stageId == stageId);
}

function throttle(type, name, obj) {
  let running = false;
  obj.addEventListener(type, () => {
    if (!running) {
      running = true;
      requestAnimationFrame(() => {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    }
  });
}

module.exports = {
  findStage,
  findProject,
  throttle,
};
