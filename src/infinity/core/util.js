(function (_) {

    /**
     * @class GUtil
     * @constructor
     * @version 1.0
     */
    function GUtil() {
    };

    /**
     * This is equal to the Array.indexOf function except that for
     * comparing the values in the array, the gUtil.equals function
     * is used instead
     * @param {Array} array the array to get an index for an element
     * @param {*} element the element to get the index for
     * @param {Boolean} [objectByValue] if set, objects are compared by their value and
     * not by their reference. Defaults to false if not provided.
     * @return {Number} a value less than zero if element is not found or
     * the index of the given element in the given array
     */
    GUtil.prototype.indexOfEquals = function (array, element, objectByValue) {
        for (var i = 0; i < array.length; ++i) {
            if (this.equals(array[i], element, objectByValue)) {
                return i;
            }
        }
        return -1;
    };

    /**
     * Compare two objects for equality by their values. Also takes care of null parameters.
     * If the function can not compare the type by value then it'll return false as if
     * the two parameters wouldn't be equal.
     * Currently supported types: Object, Boolean, Number, String, Array, Date, GRect, GPoint, GTransform.
     * For objects this will iterate only the object's own properties to an unnested deepness so
     * take care in using this function for highly complex object structures.
     * For numbers, the epsilon comparison will be used so that very small differences in numbers
     * are considered equal to compensate for any floating point errors
     * @param {*} left left side of comparison
     * @param {*} right right side of comparison
     * @param {Boolean} [objectByValue] if set, objects are compared by their value and
     * not by their reference. Defaults to false if not provided.
     * @return {Boolean} true if left and right are equal (also if they're null!)
     */
    GUtil.prototype.equals = function (left, right, objectByValue) {
        if (!left && left === right) {
            return true;
        } else if (left && right) {
            if (left instanceof GRect || right instanceof GRect) {
                return left instanceof GRect && right instanceof GRect ? GRect.equals(left, right) : false;
            } else if (left instanceof GPoint || right instanceof GPoint) {
                return left instanceof GPoint && right instanceof GPoint ? GPoint.equals(left, right) : false;
            } else if (left instanceof GTransform || right instanceof GTransform) {
                return left instanceof GTransform && right instanceof GTransform ? GTransform.equals(left, right) : false;
            } else if (left instanceof Date || right instanceof Date) {
                return left instanceof Date && right instanceof Date ? (+left == +right) : false;
            } else if (left instanceof Array || right instanceof Array) {
                if (left instanceof Array && right instanceof Array) {
                    if (left.length !== right.length) {
                        return false;
                    }

                    for (var i = 0; i < left.length; ++i) {
                        if (!this.equals(left[i], right[i], objectByValue)) {
                            return false;
                        }
                    }

                    return true;
                } else {
                    return false;
                }
            } else {
                var leftType = typeof left;
                var rightType = typeof right;

                if (leftType !== rightType) {
                    return false;
                }

                if (leftType === 'number') {
                    if (isNaN(left) || isNaN(right)) {
                        return isNaN(left) && isNaN(right);
                    } else {
                        return gMath.isEqualEps(left, right);
                    }
                } else if (leftType === 'string') {
                    return left.localeCompare(right) === 0;
                } else if (leftType === 'boolean') {
                    return (+left == +right);
                } else if (leftType === 'object') {
                    if (!objectByValue) {
                        return left === right;
                    } else {
                        var leftKeys = Object.keys(left);
                        var rightKeys = Object.keys(right);

                        if (!this.equals(leftKeys, rightKeys, objectByValue)) {
                            return false;
                        }

                        for (var i = 0; i < leftKeys.length; ++i) {
                            if (!this.equals(left[leftKeys[i]], right[leftKeys[i]]), objectByValue) {
                                return false;
                            }
                        }

                        return true;
                    }
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    };

    /**
     * Checks if a given array contains at least one key
     * of a given object
     * @param {Array<*>} array
     * @param {*} object
     */
    GUtil.prototype.containsObjectKey = function (array, object) {
        for (var key in object) {
            if (array.indexOf(key) >= 0) {
                return true;
            }
        }
        return false;
    };

    /**
     * Compares a flag subtract in two given bitmasks.
     * @param {Number} leftMask
     * @param {Number} rightMask
     * @param {Number} flag
     * @returns {Number}
     * returns 0 if flag is the same on both masks (aka either set or unset),
     * returns -1 if flag is set in left mask but not in right mask,
     * returns +1 if flag is set in right mask but not in left mask
     */
    GUtil.prototype.flagDelta = function (leftMask, rightMask, flag) {
        if ((leftMask & flag) == (rightMask & flag)) {
            return 0;
        } else if ((leftMask & flag) != 0) {
            return -1;
        } else {
            return 1;
        }
    };

    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

    /**
     * Generate an unique id
     * @param {Number} [len] the desired length of the uid, defaults to 32
     * @returns {String} more or less unique id depending on the desired length
     */
    GUtil.prototype.uuid = function (len) {
        var chars = CHARS, uuid = [], i;
        var radix = chars.length;
        var len = len ? len : 32;
        for (i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * radix];
        }
        return uuid.join('');
    };

    /**
     * Replace all occurrences of a string with another string
     * @param {String} string the string to replace within
     * @param {String} what_ the string to look for
     * @param {String} with_ the string to replace with
     * @returns {String}
     */
    GUtil.prototype.replaceAll = function (string, what_, with_) {
        var result = string;
        while (result.indexOf(what_) >= 0) {
            result = result.replace(what_, with_);
        }
        return result;
    };

    // Makes unique sort of array elements, leaving only the elements from [a,b] segment
    // New array is written into newnums
    GUtil.prototype.uSortSegment = function (a, b, nums, newnums) {
        var nElms = 0;
        nums.sort(function (s, k) {
            return s - k;
        });

        if (nums[0] >= a && nums[0] <= b) {
            newnums[0] = nums[0];
            nElms = 1;

            if (nums.length == 1) {
                return nElms;
            }
        }

        for (var i = 1; i < nums.length; i++) {
            if (nums[i] != nums[i - 1] && nums[i] >= a && nums[i] <= b) {
                newnums.push(nums[i]);
                ++nElms;
            }
        }

        return nElms;
    };

    /**
     * Escape an unescaped html string
     * @param {String} html
     * @returns {String}
     */
    GUtil.prototype.escape = function (html) {
        return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };

    /**
     * Unscape an escaped html string
     * @param {String} html
     * @returns {String}
     */
    GUtil.prototype.unescape = function (html) {
        var result = gUtil.replaceAll(html, "&lt;", '<');
        result = gUtil.replaceAll(result, "&gt;", '>');
        result = gUtil.replaceAll(result, "&quot;", '"');
        result = gUtil.replaceAll(result, "&#039;", "'");
        result = gUtil.replaceAll(result, "&amp;", '&');
        return result;
    };

    GUtil.prototype._memcpy = function (dst, dstOffset, src, srcOffset, length) {
        src = src.subarray || src.slice ? src : src.buffer;
        dst = dst.subarray || dst.slice ? dst : dst.buffer;

        src = srcOffset ? src.subarray ?
            src.subarray(srcOffset, length && srcOffset + length) :
            src.slice(srcOffset, length && srcOffset + length) : src;

        if (dst.set) {
            dst.set(src, dstOffset);
        } else {
            for (var i = 0; i < src.length; i++) {
                dst[i + dstOffset] = src[i];
            }
        }

        return dst;
    };

    GUtil.prototype.memcpy = function (dst, src, length) {
        return this._memcpy(dst, 0, src, 0, length);
    };

    _.gUtil = new GUtil();
})(this);