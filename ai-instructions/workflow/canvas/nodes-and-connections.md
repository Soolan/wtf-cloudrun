# Nodes and Connections

**UI Design Considerations**
- In a workflow, the starting nodes (triggers) should have curved left side.
- Middle nodes (actions) should be rounded rectangles.
- Nodes are connected by solid arrows.
- The output joint for the connection is a circle.
- The input joint for the connection is a small vertical dash.
- Node names should appear beneath them.
- If it has sub-nodes, it means it is node cluster and the root node name should be inside the rectangle.
- In the cluster nodes, the connection between the root node and sub nodes are represented by dashed arrows.
- The connection joints inside the node clusters are diamonds. The arrow points from the sub node to the root node.
- When hover/click on a node it should highlight it.
- When hover/click on a connection, it should highlight it also should display add and delete icons 
(delete icon only for child nodes).
- Add button will show a panel where we can pick the next node, and connect the previous node to it.
- Delete button will simply remove the connection.
- For connecting a node to another, drag its output connection to the input joint of the next node. 
- When they are close enough, it will snap into the joint.
- When a node is hovered/selected, four tiny icon buttons appear on top left edge of the node:
  - execute
  - activate/deactivate
  - delete
  - and a context menu (... icon)
- When dragging the nodes around, its connections to its neighbors will be affected following bezier curves (not straight lines).

**Useful clip (n8n editor)**
Please watch this short clip, to see the nodes and connections in action.
`@ai-instructions/workflows/canvas/nodes-and-connection.webm`
