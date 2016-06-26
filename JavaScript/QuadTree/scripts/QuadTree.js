// ------------------------------------------------------------------
//
// This is a creator function used to generate a new and empty QuadTree.
//
// ------------------------------------------------------------------
function QuadTree(maxMembership) {
	'use strict';

	var root = null,
		that = {
			get root() { return root; },
			get collisionTests() { return collisionTests; },
			get depth() { return findDepth(root); }
		},
		collisionTests = 0;

	// ------------------------------------------------------------------
	//
	// Creator function used to generate a node for the QuadTree.  This is
	// where most of the work takes place, particularly in the 'add' function
	// where the splitting of nodes happens.
	//
	// ------------------------------------------------------------------
	function Node(bounds) {
		var children = [],	// Child nodes of this node
			members = [],	// List of items contained within this node
			node = {
				get left() { return bounds.left; },
				get top() { return bounds.top; },
				get size() { return bounds.size; },
				get isFull() { return members.length >= maxMembership; },
				get hasChildren() { return children.length > 0; },
				get children() { return children; },
				get members() { return members; }
			};

		// ------------------------------------------------------------------
		//
		// Adds a new item to the node.  If the node is full, it is split and
		// its children then distributed to the split nodes.
		//
		// ------------------------------------------------------------------
		node.add = function(item) {
			var child1 = null,
				child2 = null,
				child3 = null,
				child4 = null,
				member = 0;
			//
			// If the node is already full, then have to split and distribute
			// all of the items in the node to the newly created child nodes.
			if (node.isFull) {
				//
				// Create the four child nodes, evenly splitting the area covered by this node
				// amoung the new child nodes.
				child1 = Node({		// Top, left
					left: bounds.left,
					top: bounds.top,
					size: bounds.size / 2
				});
				child2 = Node({		// Top, right
					left: bounds.left + bounds.size / 2,
					top: bounds.top,
					size: bounds.size / 2
				});
				child3 = Node({		// Bottom, left
					left: bounds.left,
					top: bounds.top + bounds.size / 2,
					size: bounds.size / 2
				});
				child4 = Node({		// Bottom right
					left: bounds.left + bounds.size / 2,
					top: bounds.top + bounds.size / 2,
					size: bounds.size / 2
				});
				children.push(child1);
				children.push(child2);
				children.push(child3);
				children.push(child4);
				//
				// With the new child nodes in place, distribute the members contained within
				// this node over the children.
				for (member = 0; member < node.members.length; member += 1) {
					insert(node, members[member]);
				}
				//
				// Finally, get the new item inserted in the correct location.
				insert(node, item);
			} else {
				members.push(item);
			}
		};

		return node;
	}

	// ------------------------------------------------------------------
	//
	// Recursive function used to add a new node to the QuadTree.  Splitting
	// of nodes will automatically happen within the node itself, not here,
	// making this a relatively simple function.
	//
	// ------------------------------------------------------------------
	function insert(node, item) {
		var child = 0;
		//
		// See if the item is inside of this node, if it isn't then nothing to do.
		if (item.insideSquare(node)) {
			//
			// If this node has children, then crawl through them to see which of them
			// the new item belongs; keeping in mind, it may have membership in more
			// than one child.
			if (node.hasChildren) {
				for (child = 0; child < node.children.length; child += 1) {
					insert(node.children[child], item);
				}
			} else {
				node.add(item);
			}
		}
	}

	// ------------------------------------------------------------------
	//
	// Public member used to allow an item to be added to the QuadTree.
	//
	// ------------------------------------------------------------------
	that.insert = function(item) {
		//
		// Call the recursive 'insert' to perform the work of actually
		// adding the new item to the QuadTree.
		insert(root, item);
	};

	// ------------------------------------------------------------------
	//
	// Determines if 'item' intersects with any other item contained within
	// the QuadTree.  If it does, the other item is return, otherwise null
	// is returned.
	//
	// ------------------------------------------------------------------
	function intersects(node, item) {
		var child = 0,
			member = 0,
			hitMe = null;

		collisionTests += 1;
		if (item.insideSquare(node)) {
			if (node.hasChildren) {
				//
				// Not a leaf node, recurse into its children
				for (child = 0; child < node.children.length; child += 1) {
					hitMe = hitMe || intersects(node.children[child], item);
					if (hitMe) {
						break;
					}
				}
			} else {
				//
				// This is a leaf node, test against all members of this node.
				for (member = 0; member < node.members.length; member += 1) {
					if (item !== node.members[member]) {
						collisionTests += 1;
						if (node.members[member].intersects(item)) {
							hitMe = node.members[member];
							break;	// Go ahead and stop at the first one found
						}
					}
				}
			}
		}

		//
		// If we get this far, then we didn't intersect with anything.
		return hitMe;
	}

	// ------------------------------------------------------------------
	//
	// Public member to allow client code to test if 'item' intersects any
	// other object in the QuadTree.
	//
	// ------------------------------------------------------------------
	that.intersects = function(item) {
		var other = null;

		//
		// Start working down through the QuadTree to find which leaf node(s)
		// this item overlaps and then test against everything in those node(s).
		other = intersects(root, item);

		return other;
	};

	// ------------------------------------------------------------------
	//
	// Computes the max depth of the QuadTree.
	//
	// ------------------------------------------------------------------
	function findDepth(node) {
		var depth0 = 0,
			depth1 = 0,
			depth2 = 0,
			depth3 = 0;

		if (node.hasChildren) {
			depth0 = findDepth(node.children[0]);
			depth1 = findDepth(node.children[1]);
			depth2 = findDepth(node.children[2]);
			depth3 = findDepth(node.children[3]);

			return 1 + Math.max(Math.max(depth0, depth1), Math.max(depth2, depth3));
		}

		return 1;
	}

	//
	// Initialize the QuadTree with a root node that has no children and covers
	// the full unit world bounds 0 to 1 in both dimensions.
	root = Node( {
		left: 0,
		top: 0,
		size: 1.0
	});

	return that;
}