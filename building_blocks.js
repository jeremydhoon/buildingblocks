// Building Blocks
//
// A JavaScript demonstration

var BuildingBlocks = (function() {
	var DRAGGABLE_SCOPE = "blocks";
	var BLOCK_WIDTH = 100;
	function build_block_source(jSrc) {
	    var options = {
		cursor: "move",
		distance: 2,
		helper: "clone",
		opacity: 1,
		revert: 'invalid',
		revertDuration: 200,
		stack: ".block",
		scope: DRAGGABLE_SCOPE
	    };
	    jSrc.draggable(options);
	    disable_select(jSrc);
	    return jSrc;
	}
	
	function build_block_dest(jDest) {
	    function col_from_event(event) {
		var offset = jDest.offset();
		var dx = event.pageX - offset.left;
		return Math.floor(dx / BLOCK_WIDTH);		
	    }

	    function drop_handler(event, ui) {
		var cCol = col_from_event(event);
		if (cCol >= cColumns || cCol < 0
		    || rgRgBlocks[cCol].length >= cMaxHeight) {
		    return;
		}
		
		var jBlock = $(ui.draggable).clone();
		disable_select(jBlock);
		jBlock.hide();
		jBlock.row = rgRgBlocks[cCol].length;
		jBlock.col = cCol;
		jDest.append(jBlock);
		var cX = cCol * BLOCK_WIDTH;
		var cY = rgRgBlocks[cCol].length * BLOCK_WIDTH;
		jBlock.css({position: "absolute", bottom: cY, left: cX});
		jBlock.show();
		
		rgRgBlocks[cCol].push(jBlock);
	    }

	    function click_to_rc(event) {
		var offset = jDest.offset();
		var cCol = col_from_event(event);
		var cRow = Math.floor(((offset.top + cHeight) - event.pageY)
				      / BLOCK_WIDTH);
		return {row:cRow, col: cCol};
	    }

	    function get_block_index(row, col) {
		var ix = null;
		$.each(rgRgBlocks[col], function(i,blk) {
			if (blk.row == row) {
			    ix = i;
			}
		    });
		return ix;
	    }

	    function get_block(row, col) {
		var ix = get_block_index(row,col);
		return rgRgBlocks[col][ix];
	    }

	    function remove_block(rc) {
		var ix = get_block_index(rc.row, rc.col);
		var block = rgRgBlocks[rc.col][ix];
		block.fadeOut(100, function() {block.remove();});
		rgRgBlocks[block.col].splice(ix,1);
	    }

	    function lower_col(col) {
		var rgBlocks = rgRgBlocks[col];

		var dictRow = {};
		$.each(rgBlocks, function(i,block) {
			dictRow[block.row] = block;
		    });

		rgBlocks.sort(function(a,b) {return a.row-b.row;});
		var toDrop = {};
		$.each(rgBlocks, function(i,block) {
			var cMissing = block.row - i;
			if (cMissing > 0) {
			    if (!toDrop[cMissing]) {
				toDrop[cMissing] = [];
			    }
			    toDrop[cMissing].push(block);
			}
			block.row -= cMissing;
		    });


		$.each(toDrop, function(n,toDropN) {
			if (n > 0) {
			    $.each(toDropN, function(i,block) {
				    var options = {
					bottom: "-=" + (n*BLOCK_WIDTH),
					duration: 200
				    };
				    block.animate(options);
				});
			}
		    });
		return toDrop.length;
	    }

	    function check_rc(rc) {
		return get_block_index(rc.row, rc.col) !== null;
	    }

	    function click_handler(event) {
		var rc = click_to_rc(event);
		if (check_rc(rc)) {
		    remove_block(rc);
		    lower_col(rc.col);
		}
	    }

	    function reset_blocks() {
		rgRgBlocks = [];
		var i;
		for (i = 0; i < cColumns; i++) {
		    rgRgBlocks.push([]);
		}
	    }

	    function clear() {
		jDest.children().fadeOut(200, function() {
			jDest.empty();
		    });
		reset_blocks();
	    }

	    function remove_color(sColor) {
		var toLower = {};
		var toRemove = [];
		$.each(rgRgBlocks, function(i) {
			$.each(rgRgBlocks[i], function(j,block) {
				if (block.hasClass(sColor)) {
				    toLower[i] = true;
				    toRemove.push(block);
				}
			    });
		    });
		$.map(toRemove, remove_block);
		$.each(toLower, lower_col);
	    }

	    function remove_bottom() {
		alert("Implement me!");
	    }

	    var cWidth = jDest.width();
	    var cHeight = jDest.height();
	    var cColumns = Math.floor(cWidth / BLOCK_WIDTH);
	    var cMaxHeight = Math.floor(cHeight / BLOCK_WIDTH);
	    
	    var rgRgBlocks = [];
	    reset_blocks();

	    var options = {
		drop: drop_handler,
		activeClass: "droppable_highlight",		
		scope: DRAGGABLE_SCOPE
	    };
	    disable_select(jDest);
	    jDest.droppable(options);
	    jDest.click(click_handler);

	    var obj = {
		blocks: rgRgBlocks,
		widget: jDest,
		clear: clear,
		remove_color: remove_color,
		remove_bottom: remove_bottom
	    };
	    return obj;
	}

	function disable_select(j) {
	    j.bind("selectstart", function(event) {
		    event.preventDefault();
		});
	}

	return {build_block_source: build_block_source,
		build_block_dest: build_block_dest,
	};
    })();

$(window).load(function() {
	$.each(["left_block", "right_block"], function(i,s) {
		BuildingBlocks.build_block_source($("div#" + s));
	    });
	var dest = BuildingBlocks.build_block_dest($("div#construction_zone"));
	$("a#clear_button").click(function(event) {
		event.preventDefault();
		dest.clear();
	    });
	$("a#remove_blue").click(function(event) {
		event.preventDefault();
		dest.remove_color("blue");
	    });
	$("a#remove_bottom").click(function(event) {
		event.preventDefault();
		dest.remove_bottom();
	    });
    });