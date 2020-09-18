class FluidGrid {
	constructor(config) {
		this.config = config;
		this.elements = [];
		this.dimensions = [];
	}

	update() {
		this._getGridElements();

		var content = document.getElementById(config.elementId);
		var gridWidth = content.offsetWidth;
		var newDimensions = this._calcDimensions(gridWidth);
		this._updateElements(newDimensions);
	}

	_getGridElements() {
		this.elements = document.querySelectorAll("#" + config.elementId + " " + config.childSelector );
		this.elements = [].filter.call(this.elements, (el) => window.getComputedStyle(el.parentNode).display !== 'none');
				
		

		if(this._gridElementsAddedOrRemoved())
		{
			this.dimensions = [];
			for (var i = 0; i < this.elements.length; i++) {
				var element = this.elements[i];
				var w = parseInt(element.offsetWidth, 10);
				var h = parseInt(element.offsetHeight, 10);
				var propWidth = w;

				if (!isNaN(w) && !isNaN(h)) {
					if (h != this.config.maxHeight) {
						propWidth = proportionateWidth(w, h, this.config.maxHeight);
					}
					this.dimensions.push({ "width": propWidth, "height": h});
				}
			}
		}
	}

	_gridElementsAddedOrRemoved()
	{
		return this.elements.length != this.dimensions.length || this.dimensions.length == 0;
	}

	_calcDimensions(gridWidth) {
		var row = new Row(gridWidth, this.config.maxHeight, this.config.gutter);
		var rows = [row];

		for (let i = 0; i < this.dimensions.length; i += 1) {
			row.add(this.dimensions[i]);
			if (row.full() || this._isLastElement(i)) {
				if(this._isOrphan(row, i)) {
					var height = this._averageRowHeight(rows.slice(0, rows.length - 1));
					row.recalculateBasedOnHeight(height);
				}
				else {
					row.recalculateDimensions();
				}

				row = new Row(gridWidth, this.config.maxHeight, this.config.gutter);
				rows.push(row);
			}
		}

		return rows.reduce((r, obj) => r.concat(obj.elements), []);
	}

	_isOrphan(row, i) {
		return row.underflow() && this._isLastElement(i);
	}

	_isLastElement(i) {
		return i == this.dimensions.length - 1;
	}

	_averageRowHeight(rows) {
		return rows.reduce((a, b) => a + b.height(), 0) / rows.length;
	}

	_updateElements(dimensions) {
		for(let i = 0; i < dimensions.length; i += 1)
		{
			this.elements[i].style.width = dimensions[i].width + "px";
			this.elements[i].style.height = dimensions[i].height + "px";
		}
	}

}

class Row {
	constructor(maxWidth, maxHeight, margin) {
		this.maxWidth = maxWidth;
		this.maxHeight = maxHeight;
		this._height = maxHeight;
		this.margin = margin;
		this.elements = [];
	}

	add(element) {
		this.elements.push({"width": element.width, "height": element.height});
	}	

	width() {
		return this.elements.reduce((a, b) => a + b.width, 0);
	}

	height() {
		return this._height;
	}

	totalMargin() {
		return this.margin * this.elements.length * 2;
	}

	totalWidth() {
		return this.width() + this.totalMargin();
	}

	full() {
		return this.totalWidth() >= this.maxWidth;
	}

	underflow() {
		(this.maxWidth - this.totalMargin()) / this.width() > 1;
	}

	recalculateDimensions() {
		let rowRatio = Math.min((this.maxWidth - this.totalMargin()) / this.width(), 1);
		this._height = Math.floor(this.maxHeight * rowRatio);

		this.elements.forEach((el) => { 
			var width = Math.floor(el.width * rowRatio);
			el.width = width;
			el.height = this._height;
		});
	}

	recalculateBasedOnHeight(height) {
		let rowRatio = height / this.maxHeigth;
		this._height = height;

		this.elements.forEach((el) => { 
			var width = Math.floor(el.width * rowRatio);
			el.width = width;
			el.height = this._height;
		});

	}
}

function proportionateWidth(w, h, maxHeight)
{
	return Math.floor(w * (maxHeight / h));
}
