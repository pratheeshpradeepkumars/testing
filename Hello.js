import React, { Component } from "react";
import SortableTree, {
  toggleExpandedForAll,
  removeNodeAtPath
} from "react-sortable-tree";
import FileExplorerTheme from "react-sortable-tree-theme-file-explorer";
import lodash from "lodash";
const data = [
  { title: ".gitignore", id: 1 },
  { title: "package.json", id: 2 },
  {
    title: "src",
    isDirectory: true,
    dragDisabled: true,
    id: 3,
    children: [
      { title: "styles", id: 4,isDirectory: true, children:[
        {title: "outer", isDirectory: true, 
          children:[{
          title: "new-file.js"
        }]}

      ]},
      { title: "index.js", id: 5 },
      { title: "reducers.js", id: 6 },
      { title: "actions.js", id: 7 },
      { title: "utils.js", id: 8 }
    ]
  },
  {
    title: "tmp",
    isDirectory: true,
    id: 9,
    children: [
      { title: "12214124-log", id: 10 },
      { title: "drag-disabled-file", id: 11 }
    ]
  },
  {
    title: "build",
    isDirectory: true,
    id: 12,
    children: [{ title: "react-sortable-tree.js", id: 13 }]
  },
  {
    title: "public",
    isDirectory: true,
    id: 14
  },
  {
    title: "node_modules",
    isDirectory: true,
    id: 15
  }
];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchString: "",
      searchFocusIndex: 0,
      searchFoundCount: null,
      treeData: [],
      initialData: []
    };

    this.updateTreeData = this.updateTreeData.bind(this);
    this.expandAll = this.expandAll.bind(this);
    this.collapseAll = this.collapseAll.bind(this);
  }

  componentDidMount() {
    this.setState({
      initialData: data,
      treeData: data
    });
  }

  updateTreeData(treeData) {
    this.setState({ treeData });
  }

  getNodeKey = ({ node: { id } }) => id;

  expand(expanded) {
    this.setState({
      treeData: toggleExpandedForAll({
        treeData: this.state.treeData,
        expanded
      })
    });
  }

  deleteNode = rowInfo => {
    let { node, treeIndex, path } = rowInfo;
    this.setState({
      treeData: removeNodeAtPath({
        treeData: this.state.treeData,
        path: path,
        getNodeKey: this.getNodeKey,
        ignoreCollapsed: true
      })
    });
  };

  expandAll() {
    this.expand(true);
  }
 
  collapseAll() {
    this.expand(false);
  }

  canDropHandler = (nextParent) =>  {
    //console.log(nextParent);
    if(nextParent === null) {
      return false;
    }
    return !nextParent || nextParent.isDirectory
  }

  handleMove = (params) => {
    console.log(params);
  }

  filterData = (data, predicate) => {
    // if no data is sent in, return null, otherwise transform the data
    return !!!data
      ? null
      : data.reduce((list, entry) => {
          let clone = null;
          if (predicate(entry)) {
            // if the object matches the filter, clone it as it is
            clone = Object.assign({}, entry);
          } else if (entry.children != null) {
            // if the object has childrens, filter the list of children
            let children = this.filterData(entry.children, predicate);
            if (children.length > 0) {
              // if any of the children matches, clone the parent object, overwrite
              // the children list with the filtered list
              clone = Object.assign({}, entry, { children: children });
            }
          }

          // if there's a cloned object, push it to the output list
          clone && list.push(clone);
          return list;
        }, []);
  };

  render() {
    const {
      treeData,
      initialData,
      searchString,
      searchFocusIndex,
      searchFoundCount
    } = this.state;

    const alertNodeInfo = ({ node, path, treeIndex }) => {
      const objectString = Object.keys(node)
        .map(k => (k === "children" ? "children: Array" : `${k}: '${node[k]}'`))
        .join(",\n   ");

      global.alert(
        "Info passed to the icon and button generators:\n\n" +
          `node: {\n   ${objectString}\n},\n` +
          `path: [${path.join(", ")}],\n` +
          `treeIndex: ${treeIndex}`
      );
    };

    const selectPrevMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
            : searchFoundCount - 1
      });

    const selectNextMatch = () =>
      this.setState({
        searchFocusIndex:
          searchFocusIndex !== null
            ? (searchFocusIndex + 1) % searchFoundCount
            : 0
      });

    return (
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <div style={{ flex: "0 0 auto", padding: "0 15px" }}>
          <h3>File Explorer Theme</h3>
          <button onClick={this.expandAll}>Expand All</button>
          <button onClick={this.collapseAll}>Collapse All</button>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <form
            style={{ display: "inline-block" }}
            onSubmit={event => {
              event.preventDefault();
            }}
          >
            <label htmlFor="find-box">
              Search:&nbsp;
              <input
                id="find-box"
                type="text"
                value={searchString}
                onChange={event =>
                  this.setState({ searchString: event.target.value })
                }
              />
            </label>

            <button
              type="button"
              disabled={!searchFoundCount}
              onClick={selectPrevMatch}
            >
              &lt;
            </button>

            <button
              type="submit"
              disabled={!searchFoundCount}
              onClick={selectNextMatch}
            >
              &gt;
            </button>

            <span>
              &nbsp;
              {searchFoundCount > 0 ? searchFocusIndex + 1 : 0}
              &nbsp;/&nbsp;
              {searchFoundCount || 0}
            </span>
          </form>
        </div>

        <div style={{ flex: "1 0 50%", padding: "0 0 0 15px" }}>
          <SortableTree
            theme={FileExplorerTheme}
            treeData={treeData}
            onChange={this.updateTreeData}
            searchQuery={searchString}
            searchFocusOffset={searchFocusIndex}
            getNodeKey={this.getNodeKey}
            onlyExpandSearchedNodes={true}
            searchFinishCallback={matches =>
              this.setState({
                searchFoundCount: matches.length,
                searchFocusIndex:
                  matches.length > 0 ? searchFocusIndex % matches.length : 0
              })
            }
            canDrag={({ node }) => !node.dragDisabled}
            canDrop={({nextParent}) => this.canDropHandler(nextParent)}
            onMoveNode={this.handleMove}
           // canDrag={false}
            //canDrop={false}
            generateNodeProps={rowInfo => ({
              icons: rowInfo.node.isDirectory
                ? [
                    <div
                      style={{
                        borderLeft: "solid 8px gray",
                        borderBottom: "solid 10px gray",
                        marginRight: 10,
                        boxSizing: "border-box",
                        width: 16,
                        height: 12,
                        filter: rowInfo.node.expanded
                          ? "drop-shadow(1px 0 0 gray) drop-shadow(0 1px 0 gray) drop-shadow(0 -1px 0 gray) drop-shadow(-1px 0 0 gray)"
                          : "none",
                        borderColor: rowInfo.node.expanded ? "white" : "gray"
                      }}
                    />
                  ]
                : [
                    <div
                      style={{
                        border: "solid 1px black",
                        fontSize: 8,
                        textAlign: "center",
                        marginRight: 10,
                        width: 12,
                        height: 16
                      }}
                    >
                      F
                    </div>
                  ],
              title: [
                <span>{rowInfo.node.title}</span>
              ],
              buttons: [
                <button
                  style={{
                    padding: 0,
                    borderRadius: "100%",
                    backgroundColor: "gray",
                    color: "white",
                    width: 16,
                    height: 16,
                    border: 0,
                    fontWeight: 100
                  }}
                  onClick={() => alertNodeInfo(rowInfo)}
                >
                  i
                </button>,
                <button
                  style={{
                    padding: 0,
                    margin: "5px",
                    borderRadius: "100%",
                    backgroundColor: "gray",
                    color: "white",
                    width: 16,
                    height: 16,
                    border: 0,
                    fontWeight: 100
                  }}
                  onClick={() => this.deleteNode(rowInfo)}
                >
                  D
                </button>
              ]
            })}
          />
        </div>
      </div>
    );
  }
}
export default App;
