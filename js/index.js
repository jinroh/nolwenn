require("../css/index.less");

const React = require("react");
const ReactDOM = require("react-dom");
const ReactCSSTransitionGroup = require("react-addons-css-transition-group");
const { Router, Route, IndexRedirect, Link } = require("react-router");
const createHashHistory = require("history/lib/createHashHistory");
const { ProjectViewer } = require("./project");
const { initialStage } = require("../public");
const { findStage, findSiblingStage, throttle } = require("./helpers");

const history = createHashHistory({ queryKey: false });

throttle("resize", "throttledResize", window);

const ProjectTooltip = React.createClass({
  render() {
    const {
      project,
      imageWidth,
      imageHeight,
    } = this.props;

    const tooltipStyle = {
      left: (imageWidth  * (project.cursor.x + 2.2) / 100) + "px",
      top:  (imageHeight * (project.cursor.y + 6.0) / 100) + "px",
    };

    return (
      <div
        className="project-tooltip"
        style={tooltipStyle}
      >
        <div>
          <p>{project.title}</p>
          <p className="project-tooltip-subtitle">{project.subtitle}</p>
          <p className="project-tooltip-date"><span>{project.date}</span></p>
        </div>
      </div>
    );
  }
});

const SiteHeader = React.createClass({
  shouldComponentUpdate() {
    return false;
  },
  render() {
    return (
      <header className="site-header">
        <h1>Nolwenn  Le  Scao</h1>
        <p>
          <Link to="/about">À propos</Link> | <Link to="/contact">Contact</Link>
        </p>
      </header>
    );
  }
});

const StageFooter = React.createClass({
  shouldComponentUpdate() {
    return false;
  },
  render() {
    return (
      <footer className="site-footer">
        <a href="/">Photographies Inès Leroy-Galan</a>
      </footer>
    );
  }
});

const StageViewer = React.createClass({
  getInitialState() {
    return {
      imgLoaded: false,
      imgRatio: 0,
      projectTooltip: null,
      height: window.innerHeight,
    };
  },

  componentWillMount() {
    window.addEventListener("throttledResize", this.setWindowSize);
  },

  componentWillUnmount() {
    window.removeEventListener("throttledResize", this.setWindowSize);
  },

  setWindowSize() {
    this.setState({ height: window.innerHeight });
  },

  onImageLoaded() {
    const { naturalWidth, naturalHeight } = this.image;
    this.setState({
      imgLoaded: true,
      imgRatio: naturalWidth / naturalHeight,
    });
  },

  onClickCursor(projectId) {
    this.setState({ projectTooltip: null });
    this.props.onProjectSelect(projectId);
  },

  onMouseEnter(project) {
    this.setState({ projectTooltip: project });
  },

  onMouseLeave() {
    this.setState({ projectTooltip: null });
  },

  getImageSize() {
    const { imgRatio, height } = this.state;
    const imageWidth  = (height - 15 / 100 * height) * imgRatio;
    const imageHeight = (height - 15 / 100 * height);
    return {
      imageWidth,
      imageHeight,
    };
  },

  getCursors(stage, imageWidth, imageHeight) {
    const { stageId } = stage;

    return stage.projects.map((project) => {
      const { projectId, title, cursor } = project;

      const cursorStyle = {
        left:   (imageWidth  * cursor.x / 100) + "px",
        top:    (imageHeight * cursor.y / 100) + "px",
        width:  (imageWidth * 4 / 100) + "px",
        height: (imageWidth * 4 / 100) + "px",
        backgroundImage: `url(images/${cursor.cursor}.gif)`
      };

      return (
        <li>
          <Link
            key={projectId}
            to={`/${stageId}/${projectId}`}
            className="cursor"
            style={cursorStyle}
            onClick={() => this.onMouseLeave(project)}
            onMouseEnter={() => this.onMouseEnter(project)}
            onMouseLeave={() => this.onMouseLeave(project)}>
            {`Projet ${title}`}
          </Link>
        </li>
      );
    });
  },

  render() {
    const { children, params } = this.props;
    const { stageId, projectId } = params;
    const stage = findStage(stageId);
    const { imgLoaded, projectTooltip } = this.state;
    const { imageWidth, imageHeight } = this.getImageSize();

    let cursorSpans, tooltip;

    if (imgLoaded && projectTooltip) {
      tooltip = (
        <ProjectTooltip
          key={projectTooltip.projectId}
          project={projectTooltip}
          imageWidth={imageWidth}
          imageHeight={imageHeight} />
      );
    }

    if (imgLoaded) {
      cursorSpans = this.getCursors(stage, imageWidth, imageHeight);
    }

    const stageStyle = {
      opacity: imgLoaded ? 1 : 0,
      transition: "opacity 1.5s",
      width: imageWidth,
    };

    const stageImageStyle = {
      width:  imageWidth,
      height: imageHeight,
      paddingTop: "2%"
    };

    return (
      <section className="stage" style={stageStyle}>
        <img
          ref={(ref) => this.image = ref}
          alt={"Tableau " + stage.name}
          className="stage-image"
          src={`${stage.stageId}/background.jpg`}
          style={stageImageStyle}
          onLoad={this.onImageLoaded} />

        <ul>
          {cursorSpans}
        </ul>

        <ReactCSSTransitionGroup
          component="div"
          transitionName="unroll"
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
        >
          {tooltip}
        </ReactCSSTransitionGroup>

        {children
          ? <div className="project-white-overlay" />
          : null}

        <ReactCSSTransitionGroup
          component="div"
          transitionName="opacity"
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
        >
          {children
            ? React.cloneElement(children, { key: projectId })
            : null}
        </ReactCSSTransitionGroup>

        <StageFooter />
      </section>
    );
  }
});

const App = React.createClass({
  componentWillMount() {
    document.addEventListener("keydown", ({ keyCode }) => {
      const { params: { stageId } } = this.props;
      let nextStage;
      switch(keyCode) {
      case 33: nextStage = findSiblingStage(stageId, -1); break;
      case 34: nextStage = findSiblingStage(stageId, +1); break;
      }
      if (nextStage) {
        history.push(`/${nextStage.stageId}`);
      }
    });
  },
  render() {
    const { children, params } = this.props;
    const { stageId } = params;
    const nextStage = findSiblingStage(stageId, +1);

    const backgroundElement = (
      <div className="stage-background" key={stageId}>
        <img src={`${stageId}/background_blur.jpg`} />
      </div>
    );

    return (
      <main>
        <ReactCSSTransitionGroup
          component="div"
          transitionName="opacity"
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
        >
          {backgroundElement}
        </ReactCSSTransitionGroup>

        <SiteHeader />

        <ReactCSSTransitionGroup
          component="div"
          className="stages-container"
          transitionName="translate"
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
        >
          {React.cloneElement(children, { key: stageId })}
        </ReactCSSTransitionGroup>

        <Link
          to={`/${nextStage.stageId}`}
          className="stage-nav-arrow">
          <img src="images/top_arrow.png" />
        </Link>
      </main>
    );
  }
});

const routes = (
  <Route path="/" component={App}>
    <Route path=":stageId" component={StageViewer}>
      <Route path=":projectId" component={ProjectViewer} />
    </Route>
    <Route path="/about" />
    <Route path="/contact" />
    <IndexRedirect from="/" to={`/${initialStage}`} />
  </Route>
);

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <Router history={history}>{routes}</Router>,
    document.getElementById("react-root")
  );
});