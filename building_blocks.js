// Building Blocks
//
// A JavaScript demonstration

var BuildingBlocks = (function() {
	var DRAGGABLE_SCOPE = "blocks";
	var BLOCK_WIDTH = 100;
	function build_block_source(jSrc) {
	    var options = {
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
		var dictRow = {};
		var rgBlocks = rgRgBlocks[col];
		$.each(rgBlocks, function(i,block) {
			dictRow[block.row] = block;
		    });
		var bottom = null;
		$.each(rgBlocks, function(i,block) {
			if (block.row > 0
			    && dictRow[block.row-1] === undefined) {
			    bottom = block.row;
			}
		    });
		if (bottom === null) {
		    return;
		}
		var toDrop = [];
		$.each(rgBlocks, function(i,block) {
			if (block.row >= bottom) {
			    block.row--;
			    toDrop.push(block);
			}
		    });
		$.each(toDrop, function(i,block) {
			block.animate({bottom:"-=" + BLOCK_WIDTH}, 200);
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

	    var cWidth = jDest.width();
	    var cHeight = jDest.height();
	    var cColumns = cWidth / BLOCK_WIDTH;
	    var cMaxHeight = cHeight / BLOCK_WIDTH;
	    var offset = jDest.offset();
	    
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
		clear: clear
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

$(function() {
	$.each(["left_block", "right_block"], function(i,s) {
		BuildingBlocks.build_block_source($("div#" + s));
	    });
	var dest = BuildingBlocks.build_block_dest($("div#construction_zone"));
	$("a#clear_button").click(function(event) {
		dest.clear();
		event.preventDefault();
	    });
    });