const find = require("lodash/collection/find");
const findIndex = require("lodash/array/findIndex");
const assets = require("../public");

const STAGES = assets.stages;

function modulus(array, index) {
  return array[(index + array.length) % array.length];
}

function findProject(stageId, projectId) {
  const stage = findStage(stageId);
  if (stage) {
    return find(stage.projects, proj => proj.projectId == projectId);
  }
}

function findSiblingProject(projects, projectId, inc) {
  const project = modulus(projects, findIndex(projects, (p) => p.projectId === projectId) + inc);
  if (project && project.projectId !== projectId) {
    return project;
  } else {
    return null;
  }
}

function findStage(stageId) {
  return find(STAGES, stage => stage.stageId == stageId);
}

function findSiblingStage(stageId, inc) {
  const stage = modulus(STAGES, findIndex(STAGES, (p) => p.stageId === stageId) + inc);
  if (stage && stage.stageId !== stageId) {
    return stage;
  } else {
    return null;
  }
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

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
  findStage,
  findSiblingStage,
  findProject,
  findSiblingProject,
  throttle,
  capitalize,
};
