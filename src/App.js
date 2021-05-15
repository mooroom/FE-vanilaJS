import { request } from "./api";
import Breadcrumb from "./Breadcrumb";
import Nodes from "./Nodes";
import ImageView from "./ImageView";

function App($app) {
  this.state = {
    isRoot: false,
    nodes: [],
    depth: []
  };
  const imageView = new ImageView({
    $app,
    initialState: this.state.selectNodeImage
  });

  this.setState = (nextState) => {
    this.state = nextState;
    breadcrumb.setState(this.state.depth);
    nodes.setState({
      isRoot: this.state.isRoot,
      nodes: this.state.nodes
    });
    imageView.setState(this.state.selectedFilePath);
  };

  const breadcrumb = new Breadcrumb({ $app, initialState: this.state.depth });
  const nodes = new Nodes({
    $app,
    initialState: {},
    onClick: async (node) => {
      try {
        if (node.type === "DIRECTORY") {
          const nextNodes = await request(node.id);
          this.setState({
            ...this.state,
            depth: [...this.state.depth, node],
            nodes: nextNodes
          });
        } else if (node.type === "FILE") {
          // file
          this.setState({
            ...this.state,
            selectedFilePath: node.filePath
          });
        }
      } catch (e) {}
    },
    onBackClick: async () => {
      try {
        const nextState = { ...this.state };
        nextState.depth.pop();

        const prevNodeId =
          nextState.depth.length === 0
            ? null
            : nextState.depth[nextState.depth.length - 1].id;

        if (prevNodeId === null) {
          const rootNodes = await request();
          this.setState({
            ...nextState,
            isRoot: true,
            nodes: rootNodes
          });
        } else {
          const prevNodes = await request(prevNodeId);

          this.setState({
            ...nextState,
            isRoot: false,
            nodes: prevNodes
          });
        }
      } catch (e) {}
    }
  });

  const init = async () => {
    try {
      const rootNodes = await request();
      this.setState({
        ...this.state,
        isRoot: true,
        nodes: rootNodes
      });
    } catch (e) {}
  };

  init();
}

export default App;
