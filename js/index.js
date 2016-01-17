require("../css/index.less");

const React = require("react");
const ReactDOM = require("react-dom");
const ReactCSSTransitionGroup = require("react-addons-css-transition-group");
const { Router, Route, IndexRedirect, Link } = require("react-router");
const { ProjectViewer } = require("./components/project");
const { initialStage } = require("../public");
const { findStage, throttle } = require("./helpers");

throttle("resize", "throttledResize", window);

const StageViewer = React.createClass({
  getInitialState() {
    return {
      imgLoaded: false,
      imgRatio: 0,
      projectTooltip: null,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },

  componentDidMount() {
    window.addEventListener("throttledResize", this.setWindowSize);
  },

  componentWillUnmount() {
    window.removeEventListener("throttledResize", this.setWindowSize);
  },

  setWindowSize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
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

  render() {
    const { children, params } = this.props;
    const { stageId, projectId } = params;
    const stage = findStage(stageId);
    const {
      height,
      imgLoaded,
      imgRatio,
      projectTooltip,
    } = this.state;

    let cursorSpans;
    let imageWidth = 0;
    let imageHeight = 0;
    let tooltip;

    if (imgLoaded) {
      imageWidth = height * imgRatio;
      imageHeight = height;

      if (projectTooltip) {
        const tooltipStyle = {
          left: (imageWidth  * (projectTooltip.cursor.x + 2.2) / 100) + "px",
          top:  (imageHeight * (projectTooltip.cursor.y + 6) / 100) + "px",
        };

        tooltip = (
          <div
            key={projectTooltip.projectId}
            className="project-tooltip"
            style={tooltipStyle}
          >
            <div>
              <p>{projectTooltip.title}</p>
              <p className="project-tooltip-subtitle">{projectTooltip.subtitle}</p>
              <p className="project-tooltip-date"><span>{projectTooltip.date}</span></p>
            </div>
          </div>
        );
      }

      cursorSpans = stage.projects.map((project) => {
        const { projectId, cursor } = project;

        const cursorStyle = {
          left:   (imageWidth  * cursor.x / 100) + "px",
          top:    (imageHeight * cursor.y / 100) + "px",
          width:  (imageWidth * 4 / 100) + "px",
          height: (imageWidth * 4 / 100) + "px",
          backgroundImage: `url(images/${cursor.cursor}.gif)`
        };

        return (
          <Link
            key={projectId}
            to={`/${stageId}/${projectId}`}
            className={"cursor cursor-" + cursor.cursor}
            style={cursorStyle}
            onClick={() => this.onMouseLeave(project)}
            onMouseEnter={() => this.onMouseEnter(project)}
            onMouseLeave={() => this.onMouseLeave(project)}>
          </Link>
        );
      });
    }

    const stageStyle = {
      opacity: imgLoaded ? 1 : 0,
      transition: "opacity 3s",
      width: imageWidth,
      height: imageHeight,
      margin: "auto",
    };

    const stageImageStyle = {
      width: imageWidth,
      height: imageHeight,
    };

    const siteHeaderStyle = {
      color: stage.headerColor || "#D6C3BC",
    };

    if (stage.headerAlign == "right") {
      siteHeaderStyle.right = 0;
      siteHeaderStyle.textAlign = "right";
    } else {
      siteHeaderStyle.left = 0;
      siteHeaderStyle.textAlign = "left";
    }

    return (
      <section className="stage" style={stageStyle}>
        <header
          className="site-header"
          style={siteHeaderStyle}
        >
          <h1>Nolwenn Le Scao</h1>
          <p><Link to="/about">À propos</Link> | <Link to="/contact">Contact</Link></p>
        </header>

        <img
          ref={(ref) => this.image = ref}
          className={`stage-image ${projectId ? "stage-image-blurrrrrred" : ""}`}
          src={`${stage.stageId}/background.jpg`}
          style={stageImageStyle}
          onLoad={this.onImageLoaded} />

        {cursorSpans}

        <ReactCSSTransitionGroup
          transitionName="unroll"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
        >
          {tooltip}
        </ReactCSSTransitionGroup>

        <ReactCSSTransitionGroup
          transitionName="opacity"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
        >
          {children
            ? React.cloneElement(children, { key: projectId })
            : null}
        </ReactCSSTransitionGroup>

        <footer className="site-footer">
          <a href="/">Photographies Inès Leroy-Galan</a>
        </footer>
      </section>
    );
  }
});

const App = React.createClass({
  render() {
    const { children, params } = this.props;
    const { stageId } = params;
    const stage = findStage(stageId);

    const mainStyle = {
      backgroundColor: stage.backgroundColor,
      backgroundImage: `url(${stageId}/background_blur.jpg)`,
      backgroundSize: "100% auto",
      backgroundRepeat: "no-repeat",
    };

    return (
      <main style={mainStyle}>
        {children}
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
  ReactDOM.render(<Router>{routes}</Router>, document.getElementById("root"));
});
