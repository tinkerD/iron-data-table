function ArrayDataSource(arr) {
  function _filter(items, filter) {
    if (filter.length === 0) {
      return items;
    }

    return Array.prototype.filter.call(items, function(item, index) {
      var filtered = true;
      for (var i = 0; i < filter.length; i++) {
        var value = Polymer.Base.get(filter[i].path, item);
        if (filter[i].filter.indexOf(undefined) > -1 || filter[i].filter.indexOf(null) > -1) {
          continue;
        } else {
          if (filter[i].type === 'text') {
            filtered = filtered && (value.toString().toLowerCase().indexOf(filter[i].filter[0].toString().toLowerCase()) > -1);
          } else if (filter[i].type === 'number') {
            if (!filter[i].filter[1]) {
              filter[i].filter[1] = Number.MAX_SAFE_INTEGER;// upper limit
            }
            if (!filter[i].filter[0]) {
              filter[i].filter[0] = Number.MIN_SAFE_INTEGER;// lower limit
            }
            filtered = filtered && (+value >= +filter[i].filter[0] && +value <= +filter[i].filter[1]);
          } else if (filter[i].type === 'date') {
            if (!filter[i].filter[1]) {
              filter[i].filter[1] = new Date(4133874600000);// upper limit
            }
            if (!filter[i].filter[0]) {
              filter[i].filter[0] = new Date(-2209008600000);// lower limit
            }
            filtered = filtered && (new Date(value).getTime() >= filter[i].filter[0].getTime() && new Date(value) <= filter[i].filter[1].getTime());
          } else if (filter[i].type === 'boolean') {
            filtered = filtered && (JSON.parse(filter[i].filter[0]) === JSON.parse(value));
          } else if (filter[i].type === 'list') {
            filtered = filtered && (filter[i].filter.indexOf(value) > -1);
          }
        }
      }
      return filtered;
    });
  }

  function _compare(a, b) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }

  function _sort(items, sortOrder) {
    if (!sortOrder || sortOrder.length === 0) {
      return items;
    }

    var multiSort = function() {
      return function(a, b) {
        return sortOrder.map(function(sort) {
          if (sort.direction === 'asc') {
            return _compare(Polymer.Base.get(sort.path, a), Polymer.Base.get(sort.path, b));
          } else if (sort.direction === 'desc') {
            return _compare(Polymer.Base.get(sort.path, b), Polymer.Base.get(sort.path, a));
          }
          return 0;
        }).reduce(function firstNonZeroValue(p, n) {
          return p ? p : n;
        }, 0);
      };
    };

    // make sure a copy is used so that original array is unaffected.
    return Array.prototype.sort.call(items.slice(0), multiSort(sortOrder));
  }

  return function(opts, cb, err) {
    var filteredItems = _filter(arr, opts.filter);

    var sortedItems = _sort(filteredItems, opts.sortOrder);

    var start = opts.page * opts.pageSize;
    var end = start + opts.pageSize;
    var slice = sortedItems.slice(start, end);

    cb(slice, filteredItems.length);
  };
}
