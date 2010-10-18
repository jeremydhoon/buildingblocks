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
	    jSrc.bind("selectstart", function(event) {
		    event.preventDefault();
		});
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
		jBlock.hide();
		jDest.append(jBlock);
		var cX = cCol * BLOCK_WIDTH;
		var cY = rgRgBlocks[cCol].length * BLOCK_WIDTH;
		jBlock.css({position: "absolute", bottom: cY, left: cX});
		jBlock.show();
		
		rgRgBlocks[cCol].push(jBlock);
	    }
	    var cWidth = jDest.width();
	    var cHeight = jDest.height();
	    var cColumns = cWidth / BLOCK_WIDTH;
	    var cMaxHeight = cHeight / BLOCK_WIDTH;
	    var offset = jDest.offset();
	    var rgRgBlocks = [];
	    var i;
	    for (i = 0; i < cColumns; i++) {
		rgRgBlocks.push([]);
	    }
	    var options = {
		drop: drop_handler,
		activeClass: "droppable_highlight",		
		scope: DRAGGABLE_SCOPE
	    };
	    jDest.droppable(options);
	    var obj = {
		blocks: rgRgBlocks,
		widget: jDest
	    };
	    return obj;
	}

	function clear_dest(dest) {
	    dest.blocks = $.map(dest.blocks, function(ele,i) {return [];});
	    widget.empty();
	}

	return {build_block_source: build_block_source,
		build_block_dest: build_block_dest,
		clear_dest: clear_dest
	};
    })();

$(function() {
	$.each(["left_block", "right_block"], function(i,s) {
		BuildingBlocks.build_block_source($("div#" + s));
	    });
	var dest = BuildingBlocks.build_block_dest($("div#construction_zone"));
	$("a#clear_button").click(BuildingBlocks.clear_dest);
    });