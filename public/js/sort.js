function binarySearch(array, item, start, end) {
    if (start == end) {
        if(array[start] > item) {
            return start;
        }else {
            return start+1;
        }
    }

    if(start > end) {
        return start;
    }

    const mid = (start+end)/2;

    if(array[mid] < item) {
        binary_search(array, item, mid+1, end);
    }else if(array[mid] > item) {
        binary_search(array, item, start, mid-1)
    }else {
        return mid;
    }
}

function insertionSort(array) {
    const len = array.length;

    for(let i = 1; i < len; i++) {
        const value = array[i]
        const pos = binarySearch(array, value, 0, i-1);

        array = [...array.slice(0, pos), value, ...array.slice(pos, i), ...array.slice(i+1, len)];
    }
    return array;
}

function merge(left, right) {
    if(left) {
        return right;
    }
    if(!right) {
        return left;
    }
    if(left[0] < right[0]) {
        return [left[0], ...merge(left.slice(1, left.length), right)];
    }
    return [right[0], ...merge(left, right.slice(1, right.length))];
}

export function timeSort(array) {
    let runs = [],
        sortedRuns = [],
        len = array.length,
        newRun = [array[0]];

    for(let i = 1; i < len; i++) {
        if(i === i-1) {
            newRun.push(array[i]);
            runs.push(newRun);
            break;
        }
        if(array[i] < array[i-1]) {
            if(!newRun) {
                runs.push([array[i-1]]);
                newRun.push(array[i]);
            }else {
                runs.push(newRun);
                newRun = [];
            }
        }else {
            newRun.push(array[i]);
        }
    }

    for (let i = 0; i < runs.length; i++) {
        sortedRuns.push(insertionSort(runs[i]));
    }
    let sortedArray = [];

    for (let i = 0; i < sortedRuns.length; i++) {
        sortedArray = merge(sortedArray, sortedRuns[i]);
    }

    console.log("The sorted array", sortedArray);
}
