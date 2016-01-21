const React = require("react");
const ReactCSSTransitionGroup = require("react-addons-css-transition-group");
const { Link } = require("react-router");
const { findStage, findProject, findSiblingProject } = require("./helpers");
const findIndex = require("lodash/array/findIndex");

function toDangerousHtml(text) {
  return { __html: text };
}

var ProjectDescription = React.createClass({
  render() {
    const { project, stage } = this.props;
    const { stageId, projects } = stage;
    const { projectId } = project;

    const prevProject = findSiblingProject(projects, projectId, -1);
    const nextProject = findSiblingProject(projects, projectId, +1);

    const {
      title,
      subtitle,
      date,
      text,
      subtext,
      cursor,
    } = project;

    return (
      <section className="project-description">
        <h2
          className="project-description-subtitle"
          dangerouslySetInnerHTML={toDangerousHtml(subtitle)}></h2>
        <h1
          className="project-description-title"
          dangerouslySetInnerHTML={toDangerousHtml(title)}></h1>
        <span className="project-description-date">{date}</span>
        <article
          className="project-description-text"
          dangerouslySetInnerHTML={toDangerousHtml(text)}>
        </article>
        {subtext ? <hr/> : null}
        {subtext
          ? <article
              className="project-description-text"
              dangerouslySetInnerHTML={toDangerousHtml(subtext)}>
            </article>
          : null }
        <nav className="project-navigation">
          {prevProject
            ? <Link to={`${stageId}/${prevProject.projectId}`} className="project-navigation-arrow">‹</Link>
            : null}
          <img
            className="project-navigation-donut"
            src={`images/${cursor.cursor}.gif`} />
          {nextProject
            ? <Link to={`${stageId}/${nextProject.projectId}`} className="project-navigation-arrow">›</Link>
            : null}
        </nav>
      </section>
    );
  }
});

var ProjectSlideShow = React.createClass({
  getInitialState() {
    return { currentImageIndex: 0 };
  },

  componentWillMount() {
    this.startCarousel();
    document.addEventListener("keydown", this.onKeyDown);
  },

  componentWillUnmount() {
    clearInterval(this.interval);
    document.removeEventListener("keydown", this.onKeyDown);
  },

  startCarousel() {
    this.stopCarousel();
    this.interval = setInterval(this.goNextImage, 6000);
  },

  stopCarousel() {
    clearInterval(this.interval);
  },

  onKeyDown(evt) {
    const { keyCode } = evt;
    if (keyCode === 39) {
      this.startCarousel();
      this.goNextImage(+1);
    } else if (keyCode === 37) {
      this.startCarousel();
      this.goNextImage(-1);
    } else if (keyCode === 27) {
      this.props.onClose();
    }
  },

  onClickImage() {
    this.stopCarousel();
    this.goNextImage(1);
  },

  goNextImage(inc) {
    var { project: { images } } = this.props;
    var { currentImageIndex } = this.state;
    currentImageIndex = ((currentImageIndex + (inc || 1)) + images.length) % images.length;
    this.setState({ currentImageIndex });
  },

  goImage(evt, image) {
    evt.preventDefault();
    this.stopCarousel();
    const currentImageIndex = findIndex(this.props.project.images, image);
    if (currentImageIndex >= 0) {
      this.setState({ currentImageIndex });
    }
  },

  render() {
    const { currentImageIndex } = this.state;
    const { stage, project } = this.props;
    const { images } = project;
    const selectedImage = images[currentImageIndex];

    return (
      <section className="project-slide-show">
        <ReactCSSTransitionGroup
          className="project-slide-show-wrapper"
          transitionName="opacity"
          transitionEnterTimeout={400}
          transitionLeaveTimeout={400}
        >
          <ProjectImage
            key={currentImageIndex}
            imageSrc={`${stage.stageId}/${selectedImage.src}`}
            onClick={this.onClickImage} />
        </ReactCSSTransitionGroup>
        <nav className="image-navigation noselect">
          {images.map((image, index) =>
            <a
              href="#"
              key={index}
              onClick={(evt) => this.goImage(evt, image)}
              className={`image-navigation-dot ${image === selectedImage ? "image-navigation-dot-selected" : ""}`}
            >&nbsp;</a>
          )}
        </nav>
      </section>
    );
  }
});

var ProjectImage = React.createClass({
  render() {
    return (
      <img
        className="project-image"
        src={this.props.imageSrc}
        onClick={this.props.onClick} />
    );
  }
});

var ProjectViewer = React.createClass({
  onClose() {
    const { params } = this.props;
    const { stageId } = params;
    this.props.history.push(`/${stageId}`);
  },
  onClickContainer(evt) {
    if (evt.target.className === "project-container") {
      this.onClose();
    }
  },
  render() {
    const { params } = this.props;
    const { stageId, projectId } = params;
    const stage = findStage(stageId);
    const project = findProject(stageId, projectId);

    return (
      <div
        className="project-container"
        onClick={this.onClickContainer}
        key={projectId}
      >
        <section className="project-viewer">
          <ProjectSlideShow
            stage={stage}
            project={project}
            onClose={this.onClose} />
          <ProjectDescription
            stage={stage}
            project={project} />
          <aside
            className="project-close noselect"
            onClick={this.onClose}>×</aside>
        </section>
      </div>
    );
  }
});

module.exports = { ProjectViewer };
